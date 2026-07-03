import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success } from '@/lib/api-response'

export async function GET(_req: NextRequest) {
  const methods = await prisma.paymentMethod.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  return success(methods)
}
