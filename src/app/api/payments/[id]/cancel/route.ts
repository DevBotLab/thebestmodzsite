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
    })
    if (!payment) return notFound('Платёж не найден')
    if (payment.userId !== session.userId) return unauthorized('Это не ваш платёж')
    if (payment.status !== 'PENDING') return error('Платёж уже обработан', 400)

    if (payment.externalId?.startsWith('crypto_pay:')) {
      const redis = getRedis()
      await redis.del(payment.externalId)
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'PAYMENT_CANCELLED',
        details: { paymentId: payment.id, amount: Number(payment.amount) },
        ip: req.headers.get('x-forwarded-for') || null,
      },
    })

    return success({ message: 'Платёж отменён' })
  } catch (e) {
    console.error('Payment cancel error:', e)
    return error('Ошибка отмены платежа', 500)
  }
}
