import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, error, validationError } from '@/lib/api-response'
import { exportSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const format = searchParams.get('format') ?? 'json'

  const parsed = exportSchema.safeParse({ type, format })
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  let data: any[] = []
  let filename = ''

  if (parsed.data.type === 'orders') {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { tgId: true, tgUsername: true } },
        product: { select: { name: true } },
        tariff: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    data = orders.map((o) => ({
      id: o.id,
      userId: o.userId,
      tgUsername: o.user?.tgUsername ?? '',
      tgId: o.user?.tgId ?? '',
      product: o.product?.name ?? '',
      tariff: o.tariff?.name ?? '',
      totalPrice: Number(o.totalPrice),
      status: o.status,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt.toISOString(),
    }))
    filename = 'orders'
  } else if (parsed.data.type === 'users') {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    })
    data = users.map((u) => ({
      id: u.id,
      tgId: u.tgId ?? '',
      tgUsername: u.tgUsername ?? '',
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      balance: Number(u.balance),
      referralCode: u.referralCode ?? '',
      referralPercent: u.referralPercent,
      isBlocked: u.isBlocked,
      isAdmin: u.isAdmin,
      orderCount: u._count.orders,
      createdAt: u.createdAt.toISOString(),
    }))
    filename = 'users'
  } else if (parsed.data.type === 'products') {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        tariffs: true,
        _count: { select: { orders: true, keys: true } },
      },
      orderBy: { name: 'asc' },
    })
    data = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name ?? '',
      platform: p.platform ?? '',
      sortOrder: p.sortOrder,
      tariffs: p.tariffs.map((t) => ({ name: t.name, days: t.days, price: Number(t.price) })),
      orderCount: p._count.orders,
      keyCount: p._count.keys,
      createdAt: p.createdAt.toISOString(),
    }))
    filename = 'products'
  }

  if (parsed.data.format === 'csv') {
    const headers = Object.keys(data[0] ?? {})
    const csvRows = [headers.join(',')]
    for (const row of data) {
      const values = headers.map((h) => {
        const val = row[h]
        const str = val != null ? String(val) : ''
        return "\"" + str.replace(/"/g, '""') + "\""
      })
      csvRows.push(values.join(','))
    }
    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': "attachment; filename=\"" + filename + "_" + new Date().toISOString().split('T')[0] + ".csv\"",
      },
    })
  }

  return success(data)
}
