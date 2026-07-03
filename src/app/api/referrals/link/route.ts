import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, unauthorized } from '@/lib/api-response'
import { randomBytes } from 'crypto'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()

  let user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return unauthorized()

  if (!user.referralCode) {
    const code = randomBytes(8).toString('hex')
    user = await prisma.user.update({
      where: { id: session.userId },
      data: { referralCode: code },
    })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
  return success({
    link: `${siteUrl}/?ref=${user.referralCode}`,
    code: user.referralCode,
  })
}
