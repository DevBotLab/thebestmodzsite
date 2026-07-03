import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const categoryId = searchParams.get('categoryId')
  const platform = searchParams.get('platform')
  const sortBy = searchParams.get('sortBy') || 'popularity'
  const cursor = searchParams.get('cursor')
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50)

  const where: Record<string, unknown> = {}
  if (categoryId) where.categoryId = categoryId
  if (platform) where.platform = platform

  let orderBy: Record<string, string> = { sortOrder: 'asc' }
  if (sortBy === 'popularity') orderBy = { sortOrder: 'asc' }

  const products = await prisma.product.findMany({
    where,
    include: {
      tariffs: { orderBy: { price: 'asc' } },
      category: true,
      _count: { select: { reviews: true, orders: true } },
    },
    orderBy,
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  const hasMore = products.length > limit
  const items = hasMore ? products.slice(0, limit) : products
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return success({ items, nextCursor, hasMore })
}
