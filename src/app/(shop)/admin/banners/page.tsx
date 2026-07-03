'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit3, Trash2, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Banner {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', sortOrder: 0, isActive: true })

  const load = () => {
    setLoading(true)
    fetch('/api/admin/banners')
      .then(r => r.json())
      .then(res => {
        if (res.success) setBanners(res.data)
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', imageUrl: '', linkUrl: '', sortOrder: 0, isActive: true })
    setShowModal(true)
  }

  const openEdit = (banner: Banner) => {
    setEditing(banner)
    setForm({ title: banner.title, imageUrl: banner.imageUrl, linkUrl: banner.linkUrl || '', sortOrder: banner.sortOrder, isActive: banner.isActive })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) { toast.error('Заполните название и URL изображения'); return }
    const url = editing ? `/api/admin/banners/${editing.id}` : '/api/admin/banners'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(editing ? 'Сохранено' : 'Создано')
      setShowModal(false)
      load()
    } else toast.error(data.error || 'Ошибка')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить баннер?')) return
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { toast.success('Удалено'); load() }
    else toast.error(data.error || 'Ошибка')
  }

  const handleToggle = async (banner: Banner) => {
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !banner.isActive }),
    })
    const data = await res.json()
    if (data.success) {
      setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
      toast.success(banner.isActive ? 'Деактивирован' : 'Активирован')
    } else toast.error(data.error || 'Ошибка')
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Добавить баннер
        </button>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="w-24 py-3 px-4">Превью</th>
              <th className="text-left py-3 px-4">Заголовок</th>
              <th className="text-left py-3 px-4">Ссылка</th>
              <th className="text-center py-3 px-4">Порядок</th>
              <th className="text-center py-3 px-4">Активен</th>
              <th className="w-24 py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-b border-white/5 hover:bg-dark-200">
                <td className="py-3 px-4">
                  <img src={banner.imageUrl} alt={banner.title} className="w-16 h-10 object-cover rounded" />
                </td>
                <td className="py-3 px-4 text-white">{banner.title}</td>
                <td className="py-3 px-4 text-gray-400 text-xs truncate max-w-[200px]">{banner.linkUrl || '—'}</td>
                <td className="py-3 px-4 text-center text-gray-300">{banner.sortOrder}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleToggle(banner)}
                    className={`relative w-10 h-5 rounded-full transition-colors inline-block ${banner.isActive ? 'bg-lime-500' : 'bg-dark-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${banner.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(banner)} className="text-blue-400 hover:text-blue-300 p-1">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(banner.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-gray-500">Нет баннеров</td></tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{editing ? 'Редактировать' : 'Добавить'} баннер</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Заголовок" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL изображения" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="Ссылка (опционально)" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} placeholder="Порядок" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-400">Активен:</label>
                <button
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-lime-500' : 'bg-dark-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
              <button onClick={handleSave} className="btn-primary text-sm">{editing ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
