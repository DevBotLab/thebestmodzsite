import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, notFound } from '@/lib/api-response'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { tgUsername: true, firstName: true } },
      product: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!review) return notFound()

  const [likesCount, dislikesCount] = await Promise.all([
    prisma.reviewLike.count({ where: { reviewId: review.id, type: 'LIKE' } }),
    prisma.reviewLike.count({ where: { reviewId: review.id, type: 'DISLIKE' } }),
  ])

  let userLike: string | null = null
  if (session) {
    const existing = await prisma.reviewLike.findUnique({
      where: { reviewId_userId: { reviewId: review.id, userId: session.userId } },
    })
    userLike = existing?.type ?? null
  }

  return success({
    ...review,
    likes: likesCount,
    dislikes: dislikesCount,
    userLike,
  })
}
