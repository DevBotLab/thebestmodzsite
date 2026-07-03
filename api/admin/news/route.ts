import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, validationError } from '@/lib/api-response'
import { createNewsSchema } from '@/lib/validations'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return success(news)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = createNewsSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const news = await prisma.news.create({ data: parsed.data })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'NEWS_CREATE',
      details: { newsId: news.id, title: parsed.data.title },
    },
  })

  return success(news, 201)
}
