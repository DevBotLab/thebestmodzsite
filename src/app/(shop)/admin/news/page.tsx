'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Edit3, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface NewsItem {
  id: string
  title: string
  slug: string
  published: boolean
  createdAt: string
}

export default function AdminNewsListPage() {
  const router = useRouter()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/news')
      .then(r => r.json())
      .then(res => {
        if (res.success) setNews(res.data)
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (item: NewsItem) => {
    const res = await fetch(`/api/admin/news/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !item.published }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(item.published ? 'Снято с публикации' : 'Опубликовано')
      setNews((prev) => prev.map((n) => n.id === item.id ? { ...n, published: !n.published } : n))
    } else toast.error(data.error || 'Ошибка')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить новость?')) return
    const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { toast.success('Удалено'); setNews((prev) => prev.filter((n) => n.id !== id)) }
    else toast.error(data.error || 'Ошибка')
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => router.push('/admin/news/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Создать
        </button>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="text-left py-3 px-4">Заголовок</th>
              <th className="text-left py-3 px-4">Slug</th>
              <th className="text-left py-3 px-4">Дата</th>
              <th className="text-left py-3 px-4">Статус</th>
              <th className="w-24 py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-dark-200 cursor-pointer" onClick={() => router.push(`/admin/news/${item.id}`)}>
                <td className="py-3 px-4 text-white font-medium">{item.title}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">{item.slug}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(item) }}
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.published ? 'text-lime-400 bg-lime-400/10' : 'text-gray-400 bg-gray-400/10'}`}
                  >
                    {item.published ? 'Опубликован' : 'Черновик'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => router.push(`/admin/news/${item.id}`)} className="text-blue-400 hover:text-blue-300 p-1">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {news.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500">Нет новостей</td></tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  )
}
