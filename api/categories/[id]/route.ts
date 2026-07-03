import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, notFound } from '@/lib/api-response'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      children: { orderBy: { sortOrder: 'asc' } },
      products: {
        include: { tariffs: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { products: true } },
    },
  })

  if (!category) return notFound('Категория не найдена')

  return success(category)
}
