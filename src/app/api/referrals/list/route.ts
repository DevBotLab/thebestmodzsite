import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, unauthorized } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()

  const cursor = req.nextUrl.searchParams.get('cursor')
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 20, 50)

  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.userId },
    include: {
      referred: {
        select: { tgUsername: true, firstName: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  const hasMore = referrals.length > limit
  const items = hasMore ? referrals.slice(0, limit) : referrals
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return success({
    items: items.map((r) => ({
      tgUsername: r.referred.tgUsername,
      firstName: r.referred.firstName,
      date: r.createdAt,
    })),
    nextCursor,
    hasMore,
  })
}
