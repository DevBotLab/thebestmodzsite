import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  })

// Log slow queries (>1s)
prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn(`[SLOW QUERY] ${e.duration}ms: ${e.query}`)
  }
})

// Connection pool: max 10 (set via DATABASE_URL ?connection_limit=10)
// Handle connection errors
prisma.$connect()
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Prisma] Connected to database')
    }
  })
  .catch((err) => {
    console.error('[Prisma] Failed to connect to database:', err)
    process.exit(1)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
