import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, validationError } from '@/lib/api-response'
import { z } from 'zod'

const createRoleSchema = z.object({
  name: z.string().min(2).max(100),
  permissions: z.array(z.string()).optional().default([]),
})

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const roles = await prisma.adminRole.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: 'asc' },
  })

  return success(roles)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const body = await req.json()
  const parsed = createRoleSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const role = await prisma.adminRole.create({ data: parsed.data })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'ROLE_CREATE',
      details: { roleId: role.id, name: parsed.data.name },
    },
  })

  return success(role, 201)
}
