import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound } from '@/lib/api-response'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return notFound('Пользователь не найден')
  if (!user.isBlocked) return unauthorized('Пользователь не заблокирован')

  await prisma.user.update({
    where: { id },
    data: { isBlocked: false, blockReason: null },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'USER_UNBLOCK',
      details: { targetUserId: id },
    },
  })

  return success({ unblocked: true })
}
