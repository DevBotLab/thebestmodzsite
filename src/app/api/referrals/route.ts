import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, unauthorized } from '@/lib/api-response'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { referralCode: true },
  })

  if (!user) return unauthorized()

  const [referrals, transactions] = await Promise.all([
    prisma.referral.count({ where: { referrerId: session.userId } }),
    prisma.referralTransaction.aggregate({
      where: { referral: { referrerId: session.userId } },
      _sum: { amount: true },
    }),
  ])

  const totalEarned = parseFloat((transactions._sum.amount || 0).toString())
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''

  return success({
    count: referrals,
    totalEarned,
    referralLink: user.referralCode ? `${siteUrl}/?ref=${user.referralCode}` : null,
  })
}
