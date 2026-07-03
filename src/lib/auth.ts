import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret')
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
const SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS || '24', 10)
const MAX_SESSIONS = 5

export interface TokenPayload {
  userId: string
  tgId: string | null
  isAdmin: boolean
}

export function checkIsAdmin(tgId: string | null | undefined): boolean {
  if (!tgId) return false
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim()).filter(Boolean)
  return adminIds.includes(tgId)
}

export async function createToken(user: { id: string; tgId: string | null; isAdmin: boolean }) {
  const accessToken = await new SignJWT({ userId: user.id, tgId: user.tgId, isAdmin: user.isAdmin } satisfies TokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRES)
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({ userId: user.id, tgId: user.tgId, isAdmin: user.isAdmin } satisfies TokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES)
    .sign(REFRESH_SECRET)

  // Enforce max concurrent sessions
  const activeSessions = await prisma.session.count({ where: { userId: user.id } })
  if (activeSessions >= MAX_SESSIONS) {
    const oldestSessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      take: activeSessions - MAX_SESSIONS + 1,
    })
    await prisma.session.deleteMany({
      where: { id: { in: oldestSessions.map(s => s.id) } },
    })
  }

  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
    },
  })

  return { accessToken, refreshToken }
}

export async function verifyToken(token: string, isRefresh = false): Promise<TokenPayload | null> {
  try {
    const secret = isRefresh ? REFRESH_SECRET : JWT_SECRET
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) return null
  return verifyToken(accessToken)
}

export async function getServerSession(): Promise<{ user: { id: string; tgId: string | null; isAdmin: boolean } } | null> {
  const payload = await getSession()
  if (!payload) return null
  return { user: { id: payload.userId, tgId: payload.tgId, isAdmin: payload.isAdmin } }
}

export async function refreshSession(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  const payload = await verifyToken(refreshToken, true)
  if (!payload) return null

  // Verify session exists and is not expired
  const session = await prisma.session.findUnique({ where: { token: refreshToken } })
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  // Delete old session (refresh token rotation)
  await prisma.session.delete({ where: { id: session.id } })

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) return null

  return createToken({ id: user.id, tgId: user.tgId, isAdmin: checkIsAdmin(user.tgId) })
}

export function setAuthCookies(
  res: { cookies: { set: (name: string, value: string, opts: Record<string, unknown>) => void } },
  tokens: { accessToken: string; refreshToken: string }
) {
  const isProduction = process.env.NODE_ENV === 'production'

  res.cookies.set('access_token', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60,
  })

  res.cookies.set('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
  })
}

export function clearAuthCookies(
  res: { cookies: { set: (name: string, value: string, opts: Record<string, unknown>) => void } }
) {
  res.cookies.set('access_token', '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 })
  res.cookies.set('refresh_token', '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 })
}
