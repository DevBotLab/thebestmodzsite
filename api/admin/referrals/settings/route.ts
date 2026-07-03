import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, validationError } from '@/lib/api-response'
import { z } from 'zod'

const referralSettingsSchema = z.object({
  defaultPercent: z.number().int().min(0).max(100).optional(),
  transferCommission: z.number().int().min(0).max(100).optional(),
})

const SETTING_KEYS = {
  defaultPercent: 'referral_default_percent',
  transferCommission: 'referral_transfer_commission',
} as const

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: Object.values(SETTING_KEYS) } },
  })

  const settingsMap = new Map(settings.map((s) => [s.key, s.value]))

  return success({
    defaultPercent: (settingsMap.get(SETTING_KEYS.defaultPercent) as number) ?? 5,
    transferCommission: (settingsMap.get(SETTING_KEYS.transferCommission) as number) ?? 0,
  })
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = referralSettingsSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const updates: { key: string; value: any }[] = []
  if (parsed.data.defaultPercent !== undefined) {
    updates.push({ key: SETTING_KEYS.defaultPercent, value: parsed.data.defaultPercent })
  }
  if (parsed.data.transferCommission !== undefined) {
    updates.push({ key: SETTING_KEYS.transferCommission, value: parsed.data.transferCommission })
  }

  for (const { key, value } of updates) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'REFERRAL_SETTINGS_UPDATE',
      details: { changes: parsed.data },
    },
  })

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: Object.values(SETTING_KEYS) } },
  })
  const settingsMap = new Map(settings.map((s) => [s.key, s.value]))

  return success({
    defaultPercent: (settingsMap.get(SETTING_KEYS.defaultPercent) as number) ?? 5,
    transferCommission: (settingsMap.get(SETTING_KEYS.transferCommission) as number) ?? 0,
  })
}
