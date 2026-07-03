import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, error, validationError } from '@/lib/api-response'
import { createCategorySchema } from '@/lib/validations'

const updateCategorySchema = createCategorySchema.partial()

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) return notFound('Категория не найдена')

  const body = await req.json()
  const parsed = updateCategorySchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  if (parsed.data.parentId === id) {
    return error('Категория не может быть родителем самой себя')
  }

  if (parsed.data.parentId) {
    const childIds = await getChildCategoryIds(id)
    if (childIds.has(parsed.data.parentId)) {
      return error('Нельзя назначить дочернюю категорию родителем')
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'CATEGORY_UPDATE',
      details: { categoryId: id, changes: parsed.data },
    },
  })

  return success(category)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) return notFound('Категория не найдена')

  const childCount = await prisma.category.count({ where: { parentId: id } })
  if (childCount > 0) {
    return error('Удалите сначала дочерние категории', 409)
  }

  const productCount = await prisma.product.count({ where: { categoryId: id } })
  if (productCount > 0) {
    return error('В категории есть продукты', 409)
  }

  await prisma.category.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'CATEGORY_DELETE',
      details: { categoryId: id, name: existing.name },
    },
  })

  return success({ deleted: true })
}

async function getChildCategoryIds(parentId: string): Promise<Set<string>> {
  const ids = new Set<string>()
  const children = await prisma.category.findMany({ where: { parentId }, select: { id: true } })
  for (const child of children) {
    ids.add(child.id)
    const grandChildren = await getChildCategoryIds(child.id)
    for (const gc of grandChildren) ids.add(gc)
  }
  return ids
}
