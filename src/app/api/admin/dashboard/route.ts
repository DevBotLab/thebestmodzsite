import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden } from '@/lib/api-response'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalUsers,
    newUsersToday,
    totalOrders,
    ordersToday,
    ordersByStatus,
    revenueData,
    revenueWeek,
    revenueMonth,
    topProducts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    Promise.all(
      (['CREATED', 'AWAITING_PAYMENT', 'PAID', 'CHECKING', 'COMPLETED', 'CANCELLED', 'REFUNDED'] as const).map(
        async (status) => {
          const count = await prisma.order.count({ where: { status } })
          return { status, count }
        }
      )
    ),
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED' },
    }),
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED', createdAt: { gte: startOfWeek } },
    }),
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
    }),
    prisma.order.groupBy({
      by: ['productId'],
      _sum: { totalPrice: true },
      _count: { id: true },
      where: { status: 'COMPLETED' },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 5,
    }),
  ])

  const topProductIds = topProducts.map((p) => p.productId)
  const products = topProductIds.length > 0
    ? await prisma.product.findMany({ where: { id: { in: topProductIds } }, select: { id: true, name: true } })
    : []

  const productMap = new Map(products.map((p) => [p.id, p.name]))

  const totalRevenue = revenueData._sum.totalPrice ?? 0
  const revenueTodayAgg = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: { status: 'COMPLETED', createdAt: { gte: startOfToday } },
  })

  const last7Days: { date: string; amount: number; orders: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(startOfToday)
    date.setDate(date.getDate() - i)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const dayData = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: date, lt: nextDate },
      },
    })

    last7Days.push({
      date: date.toISOString().split('T')[0],
      amount: Number(dayData._sum.totalPrice ?? 0),
      orders: dayData._count.id,
    })
  }

  const last30Days: { date: string; amount: number; orders: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(startOfToday)
    date.setDate(date.getDate() - i)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const dayData = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: date, lt: nextDate },
      },
    })

    last30Days.push({
      date: date.toISOString().split('T')[0],
      amount: Number(dayData._sum.totalPrice ?? 0),
      orders: dayData._count.id,
    })
  }

  return success({
    totalUsers,
    newUsersToday,
    totalOrders,
    ordersToday,
    totalRevenue: Number(totalRevenue),
    revenueToday: Number(revenueTodayAgg._sum.totalPrice ?? 0),
    revenueWeek: Number(revenueWeek._sum.totalPrice ?? 0),
    revenueMonth: Number(revenueMonth._sum.totalPrice ?? 0),
    ordersByStatus,
    salesGraphData: { last7Days, last30Days },
    topProducts: topProducts.map((p) => ({
      id: p.productId,
      name: productMap.get(p.productId) ?? 'Unknown',
      total: Number(p._sum.totalPrice ?? 0),
      orders: p._count.id,
    })),
  })
}
