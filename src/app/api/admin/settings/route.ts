import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, validationError } from '@/lib/api-response'
import { z } from 'zod'

const DEFAULT_SETTINGS: Record<string, any> = {
  siteName: 'Cheat Shop',
  supportContact: '',
  minDeposit: 100,
  minWithdrawal: 100,
  currency: 'RUB',
  telegramBotLink: '',
  welcomeBonus: 0,
  maintenanceMode: false,
  orderAutoComplete: false,
}

const updateSettingsSchema = z.record(z.unknown())

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const settings = await prisma.systemSetting.findMany()
  const result: Record<string, any> = { ...DEFAULT_SETTINGS }

  for (const s of settings) {
    result[s.key] = s.value
  }

  return success(result)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = updateSettingsSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  for (const [key, value] of Object.entries(parsed.data)) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'SETTINGS_UPDATE',
      details: { keys: Object.keys(parsed.data) },
    },
  })

  const settings = await prisma.systemSetting.findMany()
  const result: Record<string, any> = { ...DEFAULT_SETTINGS }
  for (const s of settings) {
    result[s.key] = s.value
  }

  return success(result)
}
