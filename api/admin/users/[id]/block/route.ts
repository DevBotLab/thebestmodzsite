import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, validationError } from '@/lib/api-response'
import { z } from 'zod'

const blockUserSchema = z.object({
  reason: z.string().min(1).max(500),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return notFound('Пользователь не найден')
  if (user.isBlocked) return unauthorized('Пользователь уже заблокирован')

  const body = await req.json()
  const parsed = blockUserSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  await prisma.user.update({
    where: { id },
    data: { isBlocked: true, blockReason: parsed.data.reason },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'USER_BLOCK',
      details: { targetUserId: id, reason: parsed.data.reason },
    },
  })

  return success({ blocked: true, reason: parsed.data.reason })
}
