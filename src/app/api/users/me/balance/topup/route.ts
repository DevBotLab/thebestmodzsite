import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api-response'
import { topUpSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = topUpSchema.safeParse(body)
    if (!parsed.success) return error('Сумма должна быть не менее 100', 400)

    const { amount } = parsed.data
    if (amount < 100) return error('Минимальная сумма пополнения — 100', 400)

    const defaultMethod = await prisma.paymentMethod.findFirst({ where: { isActive: true } })
    if (!defaultMethod) return error('Нет доступных методов оплаты', 400)

    const payment = await prisma.payment.create({
      data: {
        userId: session.userId,
        amount,
        methodId: defaultMethod.id,
        status: 'PENDING',
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'BALANCE_TOPUP',
        details: { paymentId: payment.id, amount },
        ip: req.headers.get('x-forwarded-for') || null,
      },
    })

    return success({
      paymentId: payment.id,
      paymentUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/payment/${payment.id}`,
    }, 201)
  } catch (e) {
    console.error('Topup error:', e)
    return error('Ошибка пополнения баланса', 500)
  }
}
