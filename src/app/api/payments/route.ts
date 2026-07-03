import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const methods = await prisma.paymentMethod.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ['card_ua_number', 'card_ua_bank', 'card_ua_name', 'card_mastercard_number', 'card_mastercard_name', 'paypal_email', 'paypal_name'] } },
  })

  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))

  return success({ methods, settings: settingsMap })
}
