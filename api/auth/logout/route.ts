import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, clearAuthCookies } from '@/lib/auth'
import { success, error } from '@/lib/api-response'

export async function POST(_req: NextRequest) {
  try {
    const session = await getSession()
    if (session) {
      await prisma.session.deleteMany({ where: { userId: session.userId } })
    }

    const res = success({ message: 'Выход выполнен' })
    clearAuthCookies({
      cookies: { set: (name: string, value: string, opts: Record<string, unknown>) => res.cookies.set(name, value, opts) },
    })

    return res
  } catch (e) {
    console.error('Logout error:', e)
    return error('Ошибка выхода', 500)
  }
}
