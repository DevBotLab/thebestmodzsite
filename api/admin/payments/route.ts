import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, validationError } from '@/lib/api-response'
import { z } from 'zod'

const updatePaymentMethodSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(100).optional(),
  isActive: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const methods = await prisma.paymentMethod.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return success(methods)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = updatePaymentMethodSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const { id, ...data } = parsed.data

  const method = await prisma.paymentMethod.update({
    where: { id },
    data,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'PAYMENT_METHOD_UPDATE',
      details: { methodId: id, changes: data },
    },
  })

  return success(method)
}
