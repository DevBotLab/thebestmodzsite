import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized, notFound } from '@/lib/api-response'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    })

    if (!ticket) return notFound('Тикет не найден')
    if (ticket.userId !== session.userId) return unauthorized('Это не ваш тикет')
    if (ticket.status === 'CLOSED') return error('Тикет уже закрыт', 400)

    const updated = await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: 'CLOSED' },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'TICKET_CLOSED',
        details: { ticketId: ticket.id },
        ip: req.headers.get('x-forwarded-for') || null,
      },
    })

    return success(updated)
  } catch (e) {
    console.error('Ticket close error:', e)
    return error('Ошибка закрытия тикета', 500)
  }
}
