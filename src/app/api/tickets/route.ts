import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api-response'
import { createTicketSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = createTicketSchema.safeParse(body)
    if (!parsed.success) return error('Некорректные данные тикета', 400)

    const { subject, text } = parsed.data

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.userId,
        subject,
        status: 'OPEN',
        messages: {
          create: {
            userId: session.userId,
            text,
          },
        },
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'TICKET_CREATED',
        details: { ticketId: ticket.id, subject },
        ip: req.headers.get('x-forwarded-for') || null,
      },
    })

    return success(ticket, 201)
  } catch (e) {
    console.error('Ticket create error:', e)
    return error('Ошибка создания тикета', 500)
  }
}
