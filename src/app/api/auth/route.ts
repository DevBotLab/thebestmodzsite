import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { createToken, setAuthCookies } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { success, error, unauthorized } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return error('Неверный код', 400)

    const { code } = parsed.data
    const tgId = await redis.get(`auth_code:${code}`)
    if (!tgId) return unauthorized('Код недействителен или истёк')

    const user = await prisma.user.upsert({
      where: { tgId },
      update: {},
      create: { tgId },
    })

    if (user.isBlocked) return error('Ваш аккаунт заблокирован', 403)

    const tokens = await createToken({ id: user.id, isAdmin: user.isAdmin })
    const res = success({ user: mapUser(user) })

    setAuthCookies(
      { cookies: { set: (name: string, value: string, opts: Record<string, unknown>) => res.cookies.set(name, value, opts) } },
      tokens
    )

    await redis.del(`auth_code:${code}`)

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'AUTH_LOGIN', ip: req.headers.get('x-forwarded-for') || null },
    })

    return res
  } catch (e) {
    console.error('Auth error:', e)
    return error('Внутренняя ошибка сервера', 500)
  }
}

function mapUser(u: { id: string; tgId: string | null; tgUsername: string | null; firstName: string | null; lastName: string | null; balance: { toString: () => string }; referralCode: string | null; isBlocked: boolean; isAdmin: boolean; createdAt: Date }) {
  return {
    id: u.id,
    tgId: u.tgId,
    tgUsername: u.tgUsername,
    firstName: u.firstName,
    lastName: u.lastName,
    balance: parseFloat(u.balance.toString()),
    referralCode: u.referralCode,
    isBlocked: u.isBlocked,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt,
  }
}
