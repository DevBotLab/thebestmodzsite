import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const parentId = req.nextUrl.searchParams.get('parentId')

  const where: Record<string, unknown> = {}
  if (parentId === 'null' || parentId === '') {
    where.parentId = null
  } else if (parentId) {
    where.parentId = parentId
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      _count: { select: { products: true, children: true } },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return success(categories)
}
