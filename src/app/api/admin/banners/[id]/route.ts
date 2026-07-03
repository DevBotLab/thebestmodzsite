import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { success, unauthorized, forbidden, notFound, validationError } from '../../../../../lib/api-response'
import { createBannerSchema } from '../../../../../lib/validations'

const updateBannerSchema = createBannerSchema.partial()

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()
  const banner = await prisma.banner.findUnique({ where: { id: params.id } })
  if (!banner) return notFound()
  return success(banner)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()
  const body = await req.json()
  const parsed = updateBannerSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)
  const existing = await prisma.banner.findUnique({ where: { id: params.id } })
  if (!existing) return notFound()
  const banner = await prisma.banner.update({ where: { id: params.id }, data: parsed.data })
  await prisma.auditLog.create({ data: { userId: session.userId, action: 'BANNER_UPDATE', details: { bannerId: banner.id } } })
  return success(banner)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()
  const existing = await prisma.banner.findUnique({ where: { id: params.id } })
  if (!existing) return notFound()
  await prisma.banner.delete({ where: { id: params.id } })
  await prisma.auditLog.create({ data: { userId: session.userId, action: 'BANNER_DELETE', details: { bannerId: params.id } } })
  return success({ deleted: true })
}
