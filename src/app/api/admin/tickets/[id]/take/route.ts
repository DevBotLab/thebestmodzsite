import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, error } from '@/lib/api-response'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const ticket = await prisma.supportTicket.findUnique({ where: { id } })
  if (!ticket) return notFound('Тикет не найден')

  if (ticket.status === 'CLOSED') {
    return error('Нельзя взять в работу закрытый тикет')
  }

  if (ticket.status === 'IN_PROGRESS') {
    return error('Тикет уже в работе')
  }

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: { status: 'IN_PROGRESS' },
  })

  await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      userId: session.userId,
      isAdmin: true,
      text: 'Администратор принял тикет в работу.',
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'TICKET_TAKE',
      details: { ticketId: id },
    },
  })

  return success(updated)
}
