import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized, notFound } from '@/lib/api-response'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    return success({
      id: payment.id,
      amount: Number(payment.amount),
      status: payment.status,
      method: payment.method.code,
      createdAt: payment.createdAt,
    })
  } catch (e) {
    console.error('Payment status error:', e)
    return error('Ошибка получения статуса', 500)
  }
}
