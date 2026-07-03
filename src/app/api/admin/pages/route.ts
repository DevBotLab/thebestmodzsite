import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, validationError } from '@/lib/api-response'
import { z } from 'zod'

const PAGES_KEYS = ['offer', 'privacy', 'about'] as const

const updatePageSchema = z.object({
  key: z.enum(PAGES_KEYS),
  content: z.string().min(1).max(100000),
})

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: PAGES_KEYS.map((k) => "page_" + k) } },
  })

  const result: Record<string, string> = {}
  for (const key of PAGES_KEYS) {
    const setting = settings.find((s) => s.key === "page_" + key)
    result[key] = (setting?.value as string) ?? ''
  }

  return success(result)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = updatePageSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const { key, content } = parsed.data
  const settingKey = "page_" + key

  await prisma.systemSetting.upsert({
    where: { key: settingKey },
    update: { value: content },
    create: { key: settingKey, value: content },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'PAGE_UPDATE',
      details: { pageKey: key },
    },
  })

  return success({ [key]: content })
}
