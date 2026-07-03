import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api-response'
import { transferBalanceSchema } from '@/lib/validations'

const COMMISSION_KEY = 'referralTransferCommission'
const DEFAULT_COMMISSION = 5

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = transferBalanceSchema.safeParse(body)
    if (!parsed.success) return error('Неверные данные перевода', 400)

    const { tgId, amount } = parsed.data

    const sender = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!sender) return unauthorized()

    if (sender.tgId === tgId) return error('Нельзя перевести средства самому себе', 400)

    const receiver = await prisma.user.findUnique({ where: { tgId } })
    if (!receiver) return error('Пользователь с таким Telegram ID не найден', 404)

    const setting = await prisma.systemSetting.findUnique({ where: { key: COMMISSION_KEY } })
    const commissionPercent = setting ? (setting.value as { value?: number })?.value ?? DEFAULT_COMMISSION : DEFAULT_COMMISSION
    const commission = (amount * commissionPercent) / 100
    const totalDeduction = amount + commission

    const senderBalance = parseFloat(sender.balance.toString())
    if (senderBalance < totalDeduction) return error('Недостаточно средств с учётом комиссии', 400)

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: sender.id },
        data: { balance: { decrement: totalDeduction } },
      })

      await tx.user.update({
        where: { id: receiver.id },
        data: { balance: { increment: amount } },
      })

      await tx.balanceTransaction.create({
        data: {
          userId: sender.id,
          amount: -totalDeduction,
          type: 'TRANSFER_SENT',
          description: `Перевод пользователю ${receiver.tgUsername || receiver.tgId || receiver.id}`,
          relatedUserId: receiver.id,
          orderId: null,
        },
      })

      await tx.balanceTransaction.create({
        data: {
          userId: receiver.id,
          amount,
          type: 'TRANSFER_RECEIVED',
          description: `Перевод от пользователя ${sender.tgUsername || sender.tgId || sender.id}`,
          relatedUserId: sender.id,
          orderId: null,
        },
      })

      if (commission > 0) {
        await tx.balanceTransaction.create({
          data: {
            userId: sender.id,
            amount: -commission,
            type: 'WITHDRAWAL',
            description: `Комиссия за перевод (${commissionPercent}%)`,
          },
        })
      }
    })

    const updatedSender = await prisma.user.findUnique({ where: { id: sender.id } })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'BALANCE_TRANSFER',
        details: { toTgId: tgId, amount, commission, receiverId: receiver.id },
        ip: req.headers.get('x-forwarded-for') || null,
      },
    })

    return success({ balance: parseFloat(updatedSender!.balance.toString()) })
  } catch (e) {
    console.error('Transfer error:', e)
    return error('Ошибка перевода средств', 500)
  }
}
