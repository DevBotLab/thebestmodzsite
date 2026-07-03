import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, validationError } from '@/lib/api-response'
import { z } from 'zod'

const updateRoleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  permissions: z.array(z.string()).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.adminRole.findUnique({ where: { id } })
  if (!existing) return notFound('Роль не найдена')

  const body = await req.json()
  const parsed = updateRoleSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const role = await prisma.adminRole.update({
    where: { id },
    data: parsed.data,
    include: { _count: { select: { users: true } } },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'ROLE_UPDATE',
      details: { roleId: id, changes: parsed.data },
    },
  })

  return success(role)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.adminRole.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  })
  if (!existing) return notFound('Роль не найдена')

  if (existing._count.users > 0) {
    return unauthorized('Нельзя удалить роль, назначенную пользователям')
  }

  await prisma.adminRole.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'ROLE_DELETE',
      details: { roleId: id, name: existing.name },
    },
  })

  return success({ deleted: true })
}
