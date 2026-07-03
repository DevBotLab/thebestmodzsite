import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success } from '@/lib/api-response'

export async function GET(_req: NextRequest) {
  const statuses = await prisma.cheatStatus.findMany({
    orderBy: [{ gameName: 'asc' }, { cheatName: 'asc' }],
  })

  const grouped: Record<string, typeof statuses> = {}
  for (const s of statuses) {
    if (!grouped[s.gameName]) grouped[s.gameName] = []
    grouped[s.gameName].push(s)
  }

  return success(grouped)
}
