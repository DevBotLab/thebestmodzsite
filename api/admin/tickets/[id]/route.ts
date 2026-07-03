import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound } from '@/lib/api-response'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, tgId: true, tgUsername: true, firstName: true, lastName: true, isBlocked: true } },
      messages: {
        include: {
          user: { select: { id: true, tgUsername: true, firstName: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!ticket) return notFound('Тикет не найден')

  return success(ticket)
}
