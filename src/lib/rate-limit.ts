import { redis } from './redis'

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  blocked?: boolean
}

function getConfigForPath(pathname: string): { interval: number; maxRequests: number } {
  if (pathname.startsWith('/api/auth/')) {
    return { interval: 60, maxRequests: 10 }
  }
  if (pathname.startsWith('/api/admin/')) {
    return { interval: 60, maxRequests: 30 }
  }
  return { interval: 60, maxRequests: 60 }
}

export async function rateLimit(
  key: string,
  pathOrConfig?: string | { maxRequests?: number; interval?: number }
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000)
  const ipKey = key.split(':')[0]

  // Check if IP is blocked
  const blockKey = `ratelimit:blocked:${ipKey}`
  const ttl = await redis.ttl(blockKey)
  if (ttl > 0) {
    return { success: false, remaining: 0, reset: now + ttl, blocked: true }
  }

  let interval: number
  let maxRequests: number

  if (typeof pathOrConfig === 'string') {
    const cfg = getConfigForPath(pathOrConfig)
    interval = cfg.interval
    maxRequests = cfg.maxRequests
  } else if (pathOrConfig) {
    interval = pathOrConfig.interval ?? 60
    maxRequests = pathOrConfig.maxRequests ?? 60
  } else {
    interval = 60
    maxRequests = 60
  }

  const windowStart = now - interval
  const redisKey = `ratelimit:${key}`

  const multi = redis.multi()
  multi.zremrangebyscore(redisKey, 0, windowStart)
  multi.zcard(redisKey)
  multi.zadd(redisKey, now, `${now}:${Math.random()}`)
  multi.expire(redisKey, interval)

  const results = await multi.exec()
  const requestCount = (results?.[1]?.[1] as number) ?? 0

  if (requestCount > maxRequests) {
    const violationKey = `ratelimit:violations:${ipKey}`
    const violations = await redis.incr(violationKey)
    await redis.expire(violationKey, 3600)

    if (violations >= 3) {
      await redis.set(blockKey, '1', 'EX', 3600)
      await redis.del(violationKey)
      return { success: false, remaining: 0, reset: now + 3600, blocked: true }
    }

    return { success: false, remaining: 0, reset: now + interval }
  }

  const violationKey = `ratelimit:violations:${ipKey}`
  await redis.del(violationKey)

  return { success: true, remaining: maxRequests - requestCount, reset: now + interval }
}
