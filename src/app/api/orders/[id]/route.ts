import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, unauthorized, notFound } from '@/lib/api-response'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return unauthorized()

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      product: { include: { category: true } },
      tariff: true,
      payments: { include: { method: true } },
      balanceTransactions: true,
    },
  })

  if (!order) return notFound('Заказ не найден')
  if (order.userId !== session.userId) return unauthorized()

  return success(order)
}
