import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized, notFound } from '@/lib/api-response'
import { orderCreateSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()

  const cursor = req.nextUrl.searchParams.get('cursor')
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 20, 50)

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      tariff: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  const hasMore = orders.length > limit
  const items = hasMore ? orders.slice(0, limit) : orders
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return success({ items, nextCursor, hasMore })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = orderCreateSchema.safeParse(body)
    if (!parsed.success) return error('Неверные данные заказа', 400)

    const { productId, tariffId } = parsed.data

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return notFound('Товар не найден')

    const tariff = await prisma.productTariff.findUnique({ where: { id: tariffId } })
    if (!tariff || tariff.productId !== productId) return notFound('Тариф не найден')

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return unauthorized()

    const price = parseFloat(tariff.price.toString())
    const balance = parseFloat(user.balance.toString())

    if (balance < price) return error('Недостаточно средств на балансе', 400)

    const order = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.userId },
        data: { balance: { decrement: price } },
      })

      await tx.balanceTransaction.create({
        data: {
          userId: session.userId,
          amount: -price,
          type: 'PURCHASE',
          description: `Покупка: ${product.name} (${tariff.name})`,
        },
      })

      return tx.order.create({
        data: {
          userId: session.userId,
          productId,
          tariffId,
          totalPrice: price,
          status: 'PAID',
        },
      })
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'ORDER_CREATED',
        details: { orderId: order.id, productId, tariffId, price },
        ip: req.headers.get('x-forwarded-for') || null,
      },
    })

    return success(order, 201)
  } catch (e) {
    console.error('Order create error:', e)
    return error('Ошибка создания заказа', 500)
  }
}
