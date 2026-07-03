import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRedis } from '@/lib/redis'
import { success, error, unauthorized, notFound } from '@/lib/api-response'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await params

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { method: true },
    })
    if (!payment) return notFound('Платёж не найден')
    if (payment.userId !== session.userId) return unauthorized('Это не ваш платёж')
    if (payment.status !== 'PENDING') return error('Платёж уже обработан', 400)

    const manualMethods = ['freekassa', 'card_rf', 'card_ua', 'mastercard', 'paypal']
    const methodCode = payment.method.code

    if (manualMethods.includes(methodCode)) {
      if (payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'CHECKING' },
        })
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'CHECKING' },
      })

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'PAYMENT_CONFIRMED',
          details: { paymentId: payment.id, amount: Number(payment.amount), method: methodCode },
          ip: req.headers.get('x-forwarded-for') || null,
        },
      })

      return success({ message: 'Платёж отправлен на проверку' })
    }

    if (methodCode === 'cryptobot') {
      if (!payment.externalId) return error('Нет данных о крипто-платеже', 400)

      const redis = getRedis()
      const raw = await redis.get(payment.externalId)
      if (!raw) return error('Платёж не найден в системе', 404)

      const data = JSON.parse(raw)
      if (data.status !== 'completed') return error('Платёж ещё не подтверждён', 400)

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS' },
      })

      if (payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAID' },
        })
      }

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'PAYMENT_COMPLETED',
          details: { paymentId: payment.id, amount: Number(payment.amount), method: methodCode },
          ip: req.headers.get('x-forwarded-for') || null,
        },
      })

      await redis.del(payment.externalId)

      return success({ message: 'Платёж подтверждён' })
    }

    return error('Метод оплаты не поддерживается', 400)
  } catch (e) {
    console.error('Payment confirm error:', e)
    return error('Ошибка подтверждения платежа', 500)
  }
}
