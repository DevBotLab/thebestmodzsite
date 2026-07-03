import Redis from 'ioredis'

let _redis: Redis | null = null

function createRedis(): Redis {
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
  const instance = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null
      return Math.min(times * 200, 2000)
    },
    enableOfflineQueue: false,
  })
  instance.on('error', (err) => {
    console.error('Redis connection error:', err)
  })
  return instance
}

export function getRedis(): Redis {
  if (!_redis) {
    _redis = createRedis()
  }
  return _redis
}
