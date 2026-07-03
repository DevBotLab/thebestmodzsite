'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

export default function AdminNewsEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', content: '', image: '', published: false })

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/news/${id}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setForm({
            title: res.data.title,
            slug: res.data.slug,
            content: res.data.content || '',
            image: res.data.image || '',
            published: res.data.published,
          })
        } else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9а-яё\s]/gi, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({ ...prev, title, slug: prev.slug || generateSlug(title) }))
  }

  const handleSave = async () => {
    if (!form.title) { toast.error('Введите заголовок'); return }
    setSaving(true)
    const url = isNew ? '/api/admin/news' : `/api/admin/news/${id}`
    const method = isNew ? 'POST' : 'PUT'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(isNew ? 'Создано' : 'Сохранено')
      if (isNew) router.push(`/admin/news/${data.data.id}`)
    } else toast.error(data.error || 'Ошибка')
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/admin/news" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-white flex-1">{isNew ? 'Создание новости' : 'Редактирование новости'}</h2>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      <GlassCard>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Заголовок</label>
            <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Заголовок" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Slug</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug-novosti" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Изображение (URL)</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Содержание</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Текст новости..." rows={12} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400">Опубликовать:</label>
            <button
              onClick={() => setForm({ ...form, published: !form.published })}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.published ? 'bg-lime-500' : 'bg-dark-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.published ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
