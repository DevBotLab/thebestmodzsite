'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

const pageKeys = [
  { key: 'offer', label: 'Оферта' },
  { key: 'privacy', label: 'Политика конфиденциальности' },
  { key: 'about', label: 'О нас' },
]

export default function AdminPagesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [pages, setPages] = useState<Record<string, string>>({ offer: '', privacy: '', about: '' })

  useEffect(() => {
    fetch('/api/admin/pages')
      .then(r => r.json())
      .then(res => {
        if (res.success) setPages((prev) => ({ ...prev, ...res.data }))
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (key: string) => {
    setSaving(key)
    const res = await fetch('/api/admin/pages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, content: pages[key] }),
    })
    const data = await res.json()
    if (data.success) toast.success('Сохранено')
    else toast.error(data.error || 'Ошибка')
    setSaving(null)
  }

  const handleChange = (key: string, value: string) => {
    setPages((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-6">
      {pageKeys.map(({ key, label }) => (
        <GlassCard key={key}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{label}</h3>
            <button onClick={() => handleSave(key)} disabled={saving === key} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving === key ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
          <textarea
            value={pages[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder="HTML-содержимое страницы..."
            rows={16}
            className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
          />
        </GlassCard>
      ))}
    </div>
  )
}
