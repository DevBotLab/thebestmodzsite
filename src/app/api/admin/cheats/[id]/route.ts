import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, forbidden, notFound, validationError } from '@/lib/api-response'
import { updateCheatStatusSchema } from '@/lib/validations'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  const { id } = await params

  const existing = await prisma.cheatStatus.findUnique({ where: { id } })
  if (!existing) return notFound('Запись читов не найдена')

  const body = await req.json()
  const parsed = updateCheatStatusSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>)

  const cheat = await prisma.cheatStatus.update({
    where: { id },
    data: parsed.data,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'CHEAT_UPDATE',
      details: { cheatId: id, changes: parsed.data },
    },
  })

  return success(cheat)
}
