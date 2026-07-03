import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, notFound } from '@/lib/api-response'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      tariffs: { orderBy: { price: 'asc' } },
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, firstName: true, tgUsername: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true, orders: true, favorites: true } },
    },
  })

  if (!product) return notFound('Товар не найден')

  return success(product)
}
