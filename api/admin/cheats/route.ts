import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, validationError } from '@/lib/api-response'
import { z } from 'zod'

const batchUpdateCheatsSchema = z.object({
  cheats: z.array(
    z.object({
      id: z.string().min(1),
      status: z.enum(['SAFE', 'RISKY', 'DANGER', 'UPDATING']),
    })
  ).min(1),
})

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { searchParams } = new URL(_req.url)
  const gameName = searchParams.get('gameName')
  const platform = searchParams.get('platform')

  const where: any = {}
  if (gameName) where.gameName = { contains: gameName, mode: 'insensitive' }
  if (platform) where.platform = platform

  const cheats = await prisma.cheatStatus.findMany({
    where,
    orderBy: [{ gameName: 'asc' }, { cheatName: 'asc' }],
  })

  return success(cheats)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = batchUpdateCheatsSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const results = []
  for (const cheat of parsed.data.cheats) {
    const updated = await prisma.cheatStatus.update({
      where: { id: cheat.id },
      data: { status: cheat.status },
    })
    results.push(updated)
  }

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'CHEATS_BATCH_UPDATE',
      details: { count: results.length, cheats: parsed.data.cheats },
    },
  })

  return success(results)
}
