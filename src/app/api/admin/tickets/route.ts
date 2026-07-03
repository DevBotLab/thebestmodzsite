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

  const where: Prisma.SupportTicketWhereInput = {}
  if (status && status !== 'all') where.status = status as any

  const [items, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { id: true, tgId: true, tgUsername: true, firstName: true, lastName: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ])

  return success({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
