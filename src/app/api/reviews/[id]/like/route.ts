import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api-response'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return unauthorized()

  const { id } = params
  const body = await req.json()
  const { type } = body

  if (type !== 'LIKE' && type !== 'DISLIKE') {
    return error('Тип должен быть LIKE или DISLIKE', 400)
  }

  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) return error('Отзыв не найден', 404)

  const existing = await prisma.reviewLike.findUnique({
    where: { reviewId_userId: { reviewId: id, userId: session.userId } },
  })

  if (existing) {
    if (existing.type === type) {
      await prisma.reviewLike.delete({ where: { id: existing.id } })
    } else {
      await prisma.reviewLike.update({
        where: { id: existing.id },
        data: { type },
      })
    }
  } else {
    await prisma.reviewLike.create({
      data: { reviewId: id, userId: session.userId, type },
    })
  }

  const [likes, dislikes] = await Promise.all([
    prisma.reviewLike.count({ where: { reviewId: id, type: 'LIKE' } }),
    prisma.reviewLike.count({ where: { reviewId: id, type: 'DISLIKE' } }),
  ])

  return success({ likes, dislikes })
}
