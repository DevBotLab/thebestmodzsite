'use client'

import { useParams } from 'next/navigation'
import { Calendar, Newspaper } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

const newsContent: Record<string, { title: string; date: string; content: string }> = {
  'news-1': {
    title: 'Обновление Jarvis 4.2 — Новые функции',
    date: '01.07.2026',
    content: `Мы рады сообщить о выходе обновления Jarvis 4.2! В этой версии мы добавили множество новых функций и улучшений.

Новые возможности:
• Улучшенный Aimbot с настройками чувствительности
• Новый ESP с отображением предметов
• Антибан-система V3
• Оптимизация производительности
• Исправлены ошибки предыдущей версии

Обновление уже доступно для всех пользователей с активной подпиской. Для обновления достаточно перезапустить чит.`,
  },
}

export default function NewsDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const news = newsContent[slug]

  if (!news) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Новость не найдена</h2>
        <div className="mt-4"><BackButton /></div>
      </div>
    )
  }

  return (
    <div>
      <BreadCrumbs items={[{ label: 'Новости', href: '/news' }, { label: news.title }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">{news.title}</h1>
        <BackButton />
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4" />
          {news.date}
        </div>
        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
          {news.content}
        </div>
      </GlassCard>
    </div>
  )
}
