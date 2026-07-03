import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api-response'
import { reviewCreateSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const cursor = req.nextUrl.searchParams.get('cursor')
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 20, 50)
  const productId = req.nextUrl.searchParams.get('productId')

  const where: Record<string, unknown> = { isApproved: true }
  if (productId) where.productId = productId

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

  return success({ items, nextCursor, hasMore })
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
