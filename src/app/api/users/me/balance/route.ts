import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, unauthorized } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()

  const cursor = req.nextUrl.searchParams.get('cursor')
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 20, 50)

  const transactions = await prisma.balanceTransaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  const hasMore = transactions.length > limit
  const items = hasMore ? transactions.slice(0, limit) : transactions
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return success({ items, nextCursor, hasMore })
}
