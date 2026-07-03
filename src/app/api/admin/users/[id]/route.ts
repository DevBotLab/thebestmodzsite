import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, validationError } from '@/lib/api-response'
import { z } from 'zod'

const updateUserSchema = z.object({
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  tgUsername: z.string().max(100).optional().nullable(),
  balance: z.number().min(0).optional(),
  referralPercent: z.number().int().min(0).max(100).optional(),
  roleId: z.string().optional().nullable(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      tgId: true,
      tgUsername: true,
      firstName: true,
      lastName: true,
      balance: true,
      referralCode: true,
      referralPercent: true,
      isBlocked: true,
      blockReason: true,
      isAdmin: true,
      roleId: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      _count: {
        select: {
          orders: true,
          supportTickets: true,
          balanceTransactions: true,
          referralsMade: true,
        },
      },
    },
  })

  if (!user) return notFound('Пользователь не найден')

  const recentOrders = await prisma.order.findMany({
    where: { userId: id },
    include: { product: { select: { id: true, name: true } }, tariff: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const recentTransactions = await prisma.balanceTransaction.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return success({
    ...user,
    balance: Number(user.balance),
    recentOrders,
    recentTransactions: recentTransactions.map((t) => ({ ...t, amount: Number(t.amount) })),
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) return notFound('Пользователь не найден')

  const body = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const updateData: any = { ...parsed.data }
  if (updateData.balance !== undefined) {
    updateData.balance = updateData.balance
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      tgId: true,
      tgUsername: true,
      firstName: true,
      lastName: true,
      balance: true,
      referralPercent: true,
      roleId: true,
      isBlocked: true,
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'USER_UPDATE',
      details: { targetUserId: id, changes: parsed.data },
    },
  })

  return success({ ...user, balance: Number(user.balance) })
}
