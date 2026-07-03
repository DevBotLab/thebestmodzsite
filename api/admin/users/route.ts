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
  const search = searchParams.get('search')

  const where: Prisma.UserWhereInput = {}
  if (search) {
    where.OR = [
      { tgUsername: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { tgId: { contains: search } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        tgId: true,
        tgUsername: true,
        firstName: true,
        lastName: true,
        balance: true,
        referralCode: true,
        referralPercent: true,
        isBlocked: true,
        blockReason: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, supportTickets: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return success({
    items: items.map((u) => ({ ...u, balance: Number(u.balance) })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
