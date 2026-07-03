import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, validationError } from '@/lib/api-response'
import { createNewsSchema } from '@/lib/validations'

const updateNewsSchema = createNewsSchema.partial()

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.news.findUnique({ where: { id } })
  if (!existing) return notFound('Новость не найдена')

  const body = await req.json()
  const parsed = updateNewsSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const news = await prisma.news.update({
    where: { id },
    data: parsed.data,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'NEWS_UPDATE',
      details: { newsId: id, changes: parsed.data },
    },
  })

  return success(news)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.news.findUnique({ where: { id } })
  if (!existing) return notFound('Новость не найдена')

  await prisma.news.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'NEWS_DELETE',
      details: { newsId: id, title: existing.title },
    },
  })

  return success({ deleted: true })
}
