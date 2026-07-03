import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, unauthorized } from '@/lib/api-response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, tgId: true, tgUsername: true, firstName: true, lastName: true,
        balance: true, referralCode: true, isBlocked: true, isAdmin: true, createdAt: true,
      },
    })

    if (!user || user.isBlocked) return unauthorized('Пользователь не найден или заблокирован')

    return success({
      ...user,
      balance: parseFloat(user.balance.toString()),
    })
  } catch {
    return unauthorized()
  }
}
