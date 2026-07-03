import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized, notFound } from '@/lib/api-response'
import { z } from 'zod'

const processPaymentSchema = z.object({
  method: z.string().min(1, 'Метод оплаты обязателен'),
  orderId: z.string().min(1, 'ID заказа обязателен'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = processPaymentSchema.safeParse(body)
    if (!parsed.success) return error('Неверные данные оплаты', 400)

    const { method: methodCode, orderId } = parsed.data

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return notFound('Заказ не найден')
    if (order.userId !== session.userId) return unauthorized('Это не ваш заказ')

    const paymentMethod = await prisma.paymentMethod.findUnique({ where: { code: methodCode } })
    if (!paymentMethod || !paymentMethod.isActive) return error('Метод оплаты недоступен', 400)

    const payment = await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'AWAITING_PAYMENT', paymentMethod: methodCode },
      })

      return tx.payment.create({
        data: {
          userId: session.userId,
          orderId,
          amount: order.totalPrice,
          methodId: paymentMethod.id,
          status: 'PENDING',
        },
      })
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'PAYMENT_INITIATED',
        details: { paymentId: payment.id, orderId, method: methodCode },
        ip: req.headers.get('x-forwarded-for') || null,
      },
    })

    return success(payment, 201)
  } catch (e) {
    console.error('Payment process error:', e)
    return error('Ошибка обработки оплаты', 500)
  }
}
