import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api-response'
import { reviewCreateSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await getSession()
  const cursor = req.nextUrl.searchParams.get('cursor')
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 20, 50)
  const productId = req.nextUrl.searchParams.get('productId')

  const where = { isApproved: true, ...(productId ? { productId } : {}) }

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { tgUsername: true, firstName: true } },
      product: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  const hasMore = reviews.length > limit
  const items = hasMore ? reviews.slice(0, limit) : reviews
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  const reviewIds = items.map(r => r.id)
  const likeGroups = await prisma.reviewLike.groupBy({
    by: ['reviewId', 'type'],
    where: { reviewId: { in: reviewIds } },
    _count: { id: true },
  })

  const countMap = new Map<string, { likes: number; dislikes: number }>()
  for (const id of reviewIds) countMap.set(id, { likes: 0, dislikes: 0 })
  for (const g of likeGroups) {
    const entry = countMap.get(g.reviewId)!
    if (g.type === 'LIKE') entry.likes = g._count.id
    else entry.dislikes = g._count.id
  }

  let userLikeMap = new Map<string, string>()
  if (session) {
    const userLikes = await prisma.reviewLike.findMany({
      where: { reviewId: { in: reviewIds }, userId: session.userId },
      select: { reviewId: true, type: true },
    })
    for (const ul of userLikes) userLikeMap.set(ul.reviewId, ul.type)
  }

  const enriched = items.map(r => ({
    ...r,
    likes: countMap.get(r.id)?.likes ?? 0,
    dislikes: countMap.get(r.id)?.dislikes ?? 0,
    userLike: userLikeMap.get(r.id) ?? null,
  }))

  return success({ items: enriched, nextCursor, hasMore })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = reviewCreateSchema.safeParse(body)
    if (!parsed.success) return error('Некорректные данные отзыва', 400)

    const { text, rating, productId } = parsed.data

    const completedOrder = productId
      ? await prisma.order.findFirst({
          where: {
            userId: session.userId,
            productId,
            status: 'COMPLETED',
          },
        })
      : await prisma.order.findFirst({
          where: {
            userId: session.userId,
            status: 'COMPLETED',
          },
        })

    const isVerified = !!completedOrder

    const review = await prisma.review.create({
      data: {
        userId: session.userId,
        productId: productId || null,
        rating,
        text,
        isVerified,
        isApproved: false,
      },
    })

    return success(review, 201)
  } catch (e) {
    console.error('Review create error:', e)
    return error('Ошибка создания отзыва', 500)
  }
}
