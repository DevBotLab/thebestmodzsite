import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis =
  globalForRedis.redis ??
  new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null
      return Math.min(times * 200, 2000)
    },
    enableOfflineQueue: false,
  })

redis.on('error', (err) => {
  console.error('Redis connection error:', err)
})

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
