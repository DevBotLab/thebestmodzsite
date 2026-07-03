'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Newspaper, ChevronDown, Calendar } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

interface NewsItem {
  id: string
  title: string
  slug: string
  content: string
  date: string
}

const mockNews: NewsItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `news-${i + 1}`,
  title: [
    'Обновление Jarvis 4.2 — Новые функции',
    'ZoloCheat получил антибан-систему',
    'ML Bot теперь доступен на iOS',
    'Скидка 30% на все тарифы Falcon',
    'Новый чит для Standoff 2 — Force',
    'Обновление системы оплаты',
    'Технические работы 05.07',
    'Реферальная программа: новые условия',
  ][i % 8],
  slug: `news-${i + 1}`,
  content: 'Полный текст новости будет здесь. В этой секции отображается анонс новости, а при клике открывается полная версия с подробностями.',
  date: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString('ru-RU'),
}))

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    setLoading(true)
    setTimeout(() => {
      const end = page * 10
      setNews(mockNews.slice(0, end))
      setPage((p) => p + 1)
      setLoading(false)
      if (end >= mockNews.length) setHasMore(false)
    }, 500)
  }, [loading, hasMore, page])

  useEffect(() => {
    loadMore()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Новости</h1>
        <BackButton />
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <Link key={item.id} href={`/news/${item.slug}`}>
            <GlassCard>
              <div className="flex items-start gap-3">
                <Newspaper className="w-6 h-6 text-purple-400 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      <div ref={loaderRef} className="py-8 text-center">
        {loading && <ChevronDown className="w-6 h-6 animate-bounce text-purple-400 mx-auto" />}
        {!hasMore && <p className="text-gray-500 text-sm">Все новости загружены</p>}
      </div>
    </div>
  )
}
