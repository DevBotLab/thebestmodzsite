import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden } from '@/lib/api-response'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const skip = (page - 1) * limit
  const status = searchParams.get('status')
  const userId = searchParams.get('userId')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const where: Prisma.OrderWhereInput = {}
  if (status && status !== 'all') where.status = status as any
  if (userId) where.userId = userId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, tgId: true, tgUsername: true, firstName: true, lastName: true } },
        product: { select: { id: true, name: true, slug: true } },
        tariff: { select: { id: true, name: true, days: true } },
        payments: { select: { id: true, status: true, amount: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return success({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
