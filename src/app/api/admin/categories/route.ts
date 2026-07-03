import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, validationError } from '@/lib/api-response'
import { createCategorySchema } from '@/lib/validations'

function buildTree(categories: any[], parentId: string | null = null): any[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .map((c) => ({
      ...c,
      children: buildTree(categories, c.id),
    }))
}

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })

  const tree = buildTree(categories)

  return success({ items: tree, flat: categories })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = createCategorySchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const category = await prisma.category.create({ data: parsed.data })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'CATEGORY_CREATE',
      details: { categoryId: category.id, name: parsed.data.name },
    },
  })

  return success(category, 201)
}
