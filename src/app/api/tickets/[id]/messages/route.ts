import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized, notFound } from '@/lib/api-response'
import { sendMessageSchema } from '@/lib/validations'

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
    if (ticket.status === 'CLOSED') return error('Тикет закрыт', 400)

    const body = await req.json()
    const parsed = sendMessageSchema.safeParse(body)
    if (!parsed.success) return error('Некорректное сообщение', 400)

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        userId: session.userId,
        text: parsed.data.text,
      },
    })

    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'IN_PROGRESS' },
    })

    return success(message, 201)
  } catch (e) {
    console.error('Ticket message error:', e)
    return error('Ошибка отправки сообщения', 500)
  }
}
