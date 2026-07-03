import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api-response'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    await prisma.favoriteProduct.upsert({
      where: { userId_productId: { userId: session.userId, productId: params.id } },
      update: {},
      create: { userId: session.userId, productId: params.id },
    })

    return success({ message: 'Добавлено в избранное' })
  } catch (e) {
    console.error('Favorite error:', e)
    return error('Ошибка добавления в избранное', 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    await prisma.favoriteProduct.deleteMany({
      where: { userId: session.userId, productId: params.id },
    })

    return success({ message: 'Удалено из избранного' })
  } catch (e) {
    console.error('Unfavorite error:', e)
    return error('Ошибка удаления из избранного', 500)
  }
}
