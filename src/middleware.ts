import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000

const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/telegram',
  '/api/auth/refresh',
  '/api/products',
  '/api/categories',
  '/api/banners',
  '/api/news',
  '/api/cheat-statuses',
  '/api/reviews',
]

// In-memory rate limiter for Edge runtime
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>()
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function isPublicApi(pathname: string): boolean {
  return publicPaths.some((p) => pathname.startsWith(p))
}

function isAdminApi(pathname: string): boolean {
  return pathname.startsWith('/api/admin/')
}

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith('/api/auth/')
}

function getIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

function checkRateLimit(
  store: Map<string, { count: number; resetAt: number }>,
  key: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

let expectedHash: string | null = null
async function getExpectedSecretHash(): Promise<string> {
  if (expectedHash) return expectedHash
  expectedHash = await hashString(process.env.ADMIN_SECRET_PATH || 'admin-fallback')
  return expectedHash
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin') || ''
  const isApiRequest = pathname.startsWith('/api/')

  // Handle CORS preflight
  if (request.method === 'OPTIONS' && origin) {
    if (origin === CORS_ORIGIN) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': CORS_ORIGIN,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
    return new NextResponse(null, { status: 204 })
  }

  // CORS check for API requests
  if (isApiRequest && origin && origin !== CORS_ORIGIN) {
    return new NextResponse(JSON.stringify({ error: 'CORS origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Admin secret path check (timing-safe)
  if (pathname.startsWith('/admin/')) {
    const pathParts = pathname.split('/').filter(Boolean)
    if (pathParts.length >= 2) {
      const candidateSecret = pathParts[1]
      const expectedHashVal = await getExpectedSecretHash()
      const candidateHash = await hashString(candidateSecret)
      if (!timingSafeCompare(expectedHashVal, candidateHash)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } else {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Rate limiting for all /api/ requests
  if (isApiRequest) {
    const ip = getIp(request)
    let maxReqs = 60
    let windowMs = 60000
    let store: Map<string, { count: number; resetAt: number }> = ipRequestCounts

    if (pathname.startsWith('/api/auth/')) {
      maxReqs = 10
      windowMs = 60000
    } else if (pathname.startsWith('/api/admin/')) {
      maxReqs = 30
      windowMs = 60000
    }

    const result = checkRateLimit(store, `ip:${ip}:${pathname}`, maxReqs, windowMs)
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      })
    }
  }

  // Strict login rate limit: 5 attempts per 15 minutes per IP
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const ip = getIp(request)
    const result = checkRateLimit(loginAttempts, `login:${ip}`, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS)
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: 'Too Many Login Attempts. Try again later.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      })
    }
  }

  // Block repeated failed auth attempts
  if (isAuthPath && request.method !== 'POST' && pathname !== '/api/auth/refresh') {
    const ip = getIp(request)
    const failedKey = `failed:${ip}`
    const now = Date.now()
    const failedEntry = loginAttempts.get(failedKey)

    if (failedEntry && failedEntry.count >= 10 && now < failedEntry.resetAt) {
      return new NextResponse(JSON.stringify({ error: 'Access Denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Auth check for admin API routes (edge-compatible using jose)
  if (isAdminApi(pathname) && !pathname.endsWith('/api/admin/auth/login') && !pathname.endsWith('/api/admin/auth/refresh')) {
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      const { payload } = await jwtVerify(accessToken, JWT_SECRET)
      const isAdmin = (payload as Record<string, unknown>).isAdmin === true

      if (!isAdmin) {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } catch {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Auth check for non-public API routes
  if (isApiRequest && !isPublicApi(pathname) && !isAdminApi(pathname)) {
    const accessToken = request.cookies.get('access_token')?.value
    if (!accessToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      await jwtVerify(accessToken, JWT_SECRET)
    } catch {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Security headers
  const response = NextResponse.next()

  // HSTS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  // Content-Security-Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; frame-src https://www.google.com/recaptcha/; connect-src 'self' https:; media-src 'self'"
  )

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY')

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // CORS headers for API responses
  if (isApiRequest && origin === CORS_ORIGIN) {
    response.headers.set('Access-Control-Allow-Origin', CORS_ORIGIN)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
}
