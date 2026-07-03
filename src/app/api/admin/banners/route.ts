import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, validationError } from '@/lib/api-response'
import { createBannerSchema } from '@/lib/validations'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return success(banners)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = createBannerSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const banner = await prisma.banner.create({ data: parsed.data })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'BANNER_CREATE',
      details: { bannerId: banner.id, title: parsed.data.title },
    },
  })

  return success(banner, 201)
}
