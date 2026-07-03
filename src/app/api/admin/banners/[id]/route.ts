import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, validationError } from '@/lib/api-response'
import { createBannerSchema } from '@/lib/validations'

const updateBannerSchema = createBannerSchema.partial()

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.banner.findUnique({ where: { id } })
  if (!existing) return notFound('Баннер не найден')

  const body = await req.json()
  const parsed = updateBannerSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const banner = await prisma.banner.update({
    where: { id },
    data: parsed.data,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'BANNER_UPDATE',
      details: { bannerId: id, changes: parsed.data },
    },
  })

  return success(banner)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.banner.findUnique({ where: { id } })
  if (!existing) return notFound('Баннер не найден')

  await prisma.banner.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'BANNER_DELETE',
      details: { bannerId: id, title: existing.title },
    },
  })

  return success({ deleted: true })
}
