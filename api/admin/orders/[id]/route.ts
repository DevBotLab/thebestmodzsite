import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { success, unauthorized, forbidden, notFound, error, validationError } from '@/lib/api-response'
import { updateOrderStatusSchema } from '@/lib/validations'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, tgId: true, tgUsername: true, firstName: true, lastName: true, balance: true } },
      product: { include: { category: true } },
      tariff: true,
      payments: true,
      balanceTransactions: true,
    },
  })

  if (!order) return notFound('Заказ не найден')

  const keyRecord = await prisma.productKey.findFirst({
    where: { orderId: id },
    select: { id: true, key: true, isUsed: true, tariffId: true, createdAt: true },
  })

  let decryptedKey: string | null = null
  if (keyRecord) {
    try {
      decryptedKey = decrypt(keyRecord.key)
    } catch {
      decryptedKey = null
    }
  }

  return success({
    ...order,
    totalPrice: Number(order.totalPrice),
    user: order.user ? { ...order.user, balance: Number(order.user.balance) } : null,
    key: keyRecord
      ? { id: keyRecord.id, key: decryptedKey, isUsed: keyRecord.isUsed, tariffId: keyRecord.tariffId, createdAt: keyRecord.createdAt }
      : null,
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { user: true, tariff: true },
  })
  if (!existing) return notFound('Заказ не найден')

  const body = await req.json()
  const parsed = updateOrderStatusSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const { status } = parsed.data
  const oldStatus = existing.status

  if (status === oldStatus) {
    return error('Статус уже установлен')
  }

  const result = await prisma.$transaction(async (tx) => {
    if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      const keyRecord = await tx.productKey.findFirst({
        where: { orderId: id, isUsed: false },
      })

      if (!keyRecord) {
        throw new Error('Нет доступных ключей для выдачи')
      }

      await tx.productKey.update({
        where: { id: keyRecord.id },
        data: { isUsed: true },
      })

      const user = await tx.user.findUnique({ where: { id: existing.userId } })
      if (user && existing.tariff) {
        const balanceToDeduct = existing.totalPrice
        if (user.balance.lt(balanceToDeduct)) {
          const newBalance = user.balance.sub(balanceToDeduct)
          await tx.user.update({
            where: { id: existing.userId },
            data: { balance: newBalance },
          })

          await tx.balanceTransaction.create({
            data: {
              userId: existing.userId,
              amount: balanceToDeduct.negated(),
              type: 'PURCHASE',
              description: `Списание за заказ #${id}`,
              orderId: id,
            },
          })
        }
      }
    }

    if ((status === 'CANCELLED' || status === 'REFUNDED') && oldStatus !== 'CANCELLED' && oldStatus !== 'REFUNDED') {
      await tx.productKey.updateMany({
        where: { orderId: id, isUsed: true },
        data: { isUsed: false, orderId: null },
      })

      const user = await tx.user.findUnique({ where: { id: existing.userId } })
      if (user) {
        const refundAmount = existing.totalPrice
        await tx.user.update({
          where: { id: existing.userId },
          data: { balance: user.balance.add(refundAmount) },
        })

        await tx.balanceTransaction.create({
          data: {
            userId: existing.userId,
            amount: refundAmount,
            type: 'REFUND',
            description: `Возврат за заказ #${id}`,
            orderId: id,
          },
        })
      }
    }

    const order = await tx.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, tgId: true, tgUsername: true, firstName: true } },
        product: { select: { id: true, name: true } },
        tariff: true,
      },
    })

    return order
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'ORDER_STATUS_UPDATE',
      details: { orderId: id, from: oldStatus, to: status },
    },
  })

  return success(result)
}
