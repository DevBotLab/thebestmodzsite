import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const news = await prisma.news.findUnique({ where: { id } })

  if (!news) {
    return NextResponse.json({ error: 'Новость не найдена' }, { status: 404 })
  }

  return NextResponse.json(news)
}