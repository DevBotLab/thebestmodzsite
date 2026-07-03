import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRedis } from '@/lib/redis'
import { success, error, unauthorized } from '@/lib/api-response'
import { z } from 'zod'
import crypto from 'crypto'

const createPaymentSchema = z.object({
  methodCode: z.string().min(1),
  amount: z.number().positive().max(1000000),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = createPaymentSchema.safeParse(body)
    if (!parsed.success) return error('Неверные данные', 400)

    const { methodCode, amount } = parsed.data

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { code: methodCode, isActive: true },
    })
    if (!paymentMethod) return error('Метод оплаты недоступен', 400)

    const payment = await prisma.payment.create({
      data: {
        userId: session.userId,
        amount,
        methodId: paymentMethod.id,
        status: 'PENDING',
      },
    })

    let paymentKey: string | undefined
    let invoiceUrl: string | undefined
    let cardDetails: Record<string, any> | undefined

    if (methodCode === 'cryptobot') {
      let rate = 85
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=rub', {
          signal: AbortSignal.timeout(5000),
        })
        const data = await res.json()
        if (data?.tether?.rub) rate = data.tether.rub
      } catch {}

      const amountUsdt = Math.round((amount / rate) * 100) / 100
      const key = crypto.randomBytes(8).toString('hex')
      paymentKey = key
      invoiceUrl = `https://pay.crypt.bot/invoice/${key}`

      const redis = getRedis()
      const payload = JSON.stringify({
        paymentId: payment.id,
        amountRub: amount,
        amountUsdt,
        status: 'pending',
        createdAt: Date.now(),
      })
      await redis.setex(`crypto_pay:${key}`, 3600, payload)

      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId: `crypto_pay:${key}` },
      })
    } else {
      const settingKeys: Record<string, string[]> = {
        freekassa: [],
        card_rf: ['card_rf_number', 'card_rf_bank', 'card_rf_name'],
        card_ua: ['card_ua_number', 'card_ua_bank', 'card_ua_name'],
        mastercard: ['card_mastercard_number', 'card_mastercard_name'],
        paypal: ['paypal_email', 'paypal_name'],
      }

      const keys = settingKeys[methodCode] || []
      if (keys.length > 0) {
        const settings = await prisma.systemSetting.findMany({
          where: { key: { in: keys } },
        })
        cardDetails = Object.fromEntries(settings.map(s => [s.key, s.value]))
      }
    }

    return success({ payment, paymentKey, invoiceUrl, cardDetails }, 201)
  } catch (e) {
    console.error('Payment create error:', e)
    return error('Ошибка создания платежа', 500)
  }
}
