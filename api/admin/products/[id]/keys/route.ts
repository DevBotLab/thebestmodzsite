import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import { success, unauthorized, forbidden, notFound, validationError } from '@/lib/api-response'
import { uploadKeysSchema } from '@/lib/validations'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return notFound('Продукт не найден')

  const body = await req.json()
  const parsed = uploadKeysSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const { tariffId, keys } = parsed.data

  const tariff = await prisma.productTariff.findFirst({ where: { id: tariffId, productId: id } })
  if (!tariff) return notFound('Тариф не найден')

  const keysData = keys.map((key) => ({
    productId: id,
    tariffId,
    key: encrypt(key),
  }))

  await prisma.productKey.createMany({ data: keysData })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'KEYS_UPLOAD',
      details: { productId: id, tariffId, count: keys.length },
    },
  })

  return success({ uploaded: keys.length }, 201)
}
