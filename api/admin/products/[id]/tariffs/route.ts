import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, validationError } from '@/lib/api-response'
import { z } from 'zod'

const createTariffSchema = z.object({
  name: z.enum(['DAY_1', 'DAY_3', 'DAY_7', 'DAY_30', 'DAY_60']),
  days: z.number().int().positive(),
  price: z.number().positive(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return notFound('Продукт не найден')

  const body = await req.json()
  const parsed = createTariffSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const tariff = await prisma.productTariff.create({
    data: { productId: id, ...parsed.data },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'TARIFF_CREATE',
      details: { productId: id, tariffId: tariff.id, ...parsed.data },
    },
  })

  return success(tariff, 201)
}
