import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, validationError } from '@/lib/api-response'
import { z } from 'zod'

const updateTariffSchema = z.object({
  name: z.enum(['DAY_1', 'DAY_3', 'DAY_7', 'DAY_30', 'DAY_60']).optional(),
  days: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; tariffId: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id, tariffId } = await params

  const tariff = await prisma.productTariff.findFirst({ where: { id: tariffId, productId: id } })
  if (!tariff) return notFound('Тариф не найден')

  const body = await req.json()
  const parsed = updateTariffSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const updated = await prisma.productTariff.update({
    where: { id: tariffId },
    data: parsed.data,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'TARIFF_UPDATE',
      details: { productId: id, tariffId, changes: parsed.data },
    },
  })

  return success(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; tariffId: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id, tariffId } = await params

  const tariff = await prisma.productTariff.findFirst({ where: { id: tariffId, productId: id } })
  if (!tariff) return notFound('Тариф не найден')

  const orderCount = await prisma.order.count({ where: { tariffId } })
  if (orderCount > 0) {
    return unauthorized('Нельзя удалить тариф, по которому есть заказы')
  }

  await prisma.productTariff.delete({ where: { id: tariffId } })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'TARIFF_DELETE',
      details: { productId: id, tariffId },
    },
  })

  return success({ deleted: true })
}
