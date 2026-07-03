import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success } from '@/lib/api-response'

export async function GET(_req: NextRequest) {
  const top = await prisma.referral.groupBy({
    by: ['referrerId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  const referrerIds = top.map((r) => r.referrerId)
  const users = await prisma.user.findMany({
    where: { id: { in: referrerIds } },
    select: { id: true, tgUsername: true, firstName: true },
  })

  const userMap = new Map(users.map((u) => [u.id, u]))
  const result = top.map((r) => {
    const u = userMap.get(r.referrerId)
    return {
      tgUsername: u?.tgUsername || null,
      firstName: u?.firstName || null,
      count: r._count.id,
    }
  })

  return success(result)
}
