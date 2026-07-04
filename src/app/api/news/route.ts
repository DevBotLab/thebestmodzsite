import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const cursor = req.nextUrl.searchParams.get('cursor')
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 20, 50)

  const news = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  const hasMore = news.length > limit
  const items = hasMore ? news.slice(0, limit) : news
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return NextResponse.json({ items, nextCursor, hasMore })
}
