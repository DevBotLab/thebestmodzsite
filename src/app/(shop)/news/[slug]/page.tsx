'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Loader2 } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

interface NewsItem {
  id: string
  title: string
  content: string
  createdAt: string
}

export default function NewsDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [news, setNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/news/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Новость не найдена')
        return r.json()
      })
      .then(setNews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">{error || 'Новость не найдена'}</h2>
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
          {new Date(news.createdAt).toLocaleDateString('ru-RU')}
        </div>
        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
          {news.content}
        </div>
      </GlassCard>
    </div>
  )
}