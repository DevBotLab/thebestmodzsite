import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, error } from '@/lib/api-response'

export async function GET() {
  const session = await getSession()
  if (!session) return unauthorized()

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      tgId: true,
      tgUsername: true,
      firstName: true,
      lastName: true,
      balance: true,
      role: { select: { name: true } },
      createdAt: true,
    },
  })
  if (!user) return unauthorized()

  return success(user)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const { firstName, lastName, tgUsername } = body

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { firstName, lastName, tgUsername },
    select: {
      id: true,
      tgId: true,
      tgUsername: true,
      firstName: true,
      lastName: true,
      balance: true,
      role: { select: { name: true } },
      createdAt: true,
    },
  })

  return success(user)
}
