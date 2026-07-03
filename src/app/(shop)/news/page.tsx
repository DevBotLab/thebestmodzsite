'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Newspaper, ChevronDown, Calendar } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

interface NewsItem {
  id: string
  title: string
  content: string
  createdAt: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '10' })
      if (cursor) params.set('cursor', cursor)
      const res = await fetch(`/api/news?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка')
      setNews((prev) => [...prev, ...data.items])
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch {
      setError('Не удалось загрузить новости')
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [loading, hasMore, cursor])

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

  if (initialLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading text-white">Новости</h1>
          <BackButton />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <GlassCard key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-5 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-1/4" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    )
  }

  if (error && news.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading text-white">Новости</h1>
          <BackButton />
        </div>
        <div className="text-center py-20">
          <p className="text-red-400">{error}</p>
          <button onClick={() => { setError(''); setInitialLoading(true); loadMore() }} className="btn-primary mt-4">
            Повторить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Новости</h1>
        <BackButton />
      </div>

      {news.length === 0 ? (
        <div className="text-center py-20">
          <Newspaper className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Новостей пока нет</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <GlassCard>
                <div className="flex items-start gap-3">
                  <Newspaper className="w-6 h-6 text-purple-400 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{item.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}

      <div ref={loaderRef} className="py-8 text-center">
        {loading && <ChevronDown className="w-6 h-6 animate-bounce text-purple-400 mx-auto" />}
        {!hasMore && news.length > 0 && <p className="text-gray-500 text-sm">Все новости загружены</p>}
      </div>
    </div>
  )
}
