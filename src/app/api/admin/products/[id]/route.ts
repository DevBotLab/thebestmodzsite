import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, error, notFound, validationError } from '@/lib/api-response'
import { updateProductSchema } from '@/lib/validations'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      tariffs: true,
      keys: { select: { id: true, tariffId: true, isUsed: true, orderId: true, createdAt: true } },
      _count: { select: { orders: true } },
    },
  })

  if (!product) return notFound('Продукт не найден')

  return success(product)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) return notFound('Продукт не найден')

  const body = await req.json()
  const parsed = updateProductSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
    include: { category: true, tariffs: true },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'PRODUCT_UPDATE',
      details: { productId: id, changes: parsed.data },
    },
  })

  return success(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) return notFound('Продукт не найден')

  const orderCount = await prisma.order.count({ where: { productId: id } })
  if (orderCount > 0) {
    return error('Нельзя удалить продукт, по которому есть заказы', 409)
  }

  await prisma.product.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'PRODUCT_DELETE',
      details: { productId: id, name: existing.name },
    },
  })

  return success({ deleted: true })
}
