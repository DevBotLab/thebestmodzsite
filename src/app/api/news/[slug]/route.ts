import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, notFound } from '@/lib/api-response'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const article = await prisma.news.findUnique({
    where: { id: params.slug },
  })

  if (!article || !article.isPublished) return notFound('Новость не найдена')

  return success(article)
}
