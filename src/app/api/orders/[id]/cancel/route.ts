import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized, notFound } from '@/lib/api-response'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const order = await prisma.order.findUnique({ where: { id: params.id } })
    if (!order) return notFound('Заказ не найден')
    if (order.userId !== session.userId) return unauthorized()
    if (order.status !== 'CREATED' && order.status !== 'AWAITING_PAYMENT') {
      return error('Заказ нельзя отменить', 400)
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      })

      if (parseFloat(order.totalPrice.toString()) > 0) {
        await tx.user.update({
          where: { id: session.userId },
          data: { balance: { increment: order.totalPrice } },
        })

        await tx.balanceTransaction.create({
          data: {
            userId: session.userId,
            amount: order.totalPrice,
            type: 'REFUND',
            description: `Отмена заказа #${order.id}`,
            orderId: order.id,
          },
        })
      }
    })

    return success({ message: 'Заказ отменён' })
  } catch (e) {
    console.error('Cancel order error:', e)
    return error('Ошибка отмены заказа', 500)
  }
}
