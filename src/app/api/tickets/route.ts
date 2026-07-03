import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api-response'
import { z } from 'zod'

const createTicketSchema = z.object({
  subject: z.string().min(2).max(200),
  text: z.string().min(1).max(5000),
})

export async function GET() {
  const session = await getSession()
  if (!session) return unauthorized()

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })

  const items = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status.toLowerCase(),
    createdAt: t.createdAt.toISOString(),
    lastMessage: t.messages[0]?.text?.slice(0, 100) || '',
  }))

  return success({ items })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createTicketSchema.safeParse(body)
  if (!parsed.success) return error('Неверные данные', 400)

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.userId,
      subject: parsed.data.subject,
      messages: {
        create: {
          userId: session.userId,
          text: parsed.data.text,
          isAdmin: false,
        },
      },
    },
  })

  return success(ticket, 201)
}
