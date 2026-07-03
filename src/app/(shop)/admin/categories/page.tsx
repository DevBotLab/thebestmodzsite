'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit3, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parentId: string | null
  sortOrder: number
  children: Category[]
  _count: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [flat, setFlat] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', parentId: '', sortOrder: 0 })

  const load = () => {
    setLoading(true)
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(res => {
        if (res.success) { setCategories(res.data.items); setFlat(res.data.flat) }
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const openAdd = (parentId = '') => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', icon: '', parentId, sortOrder: 0 })
    setShowModal(true)
  }

  const openEdit = (cat: any) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '', parentId: cat.parentId || '', sortOrder: cat.sortOrder })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error('Заполните название и slug'); return }
    const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories'
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
    if (!confirm('Удалить категорию?')) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { toast.success('Удалено'); load() }
    else toast.error(data.error || 'Ошибка')
  }

  const renderTree = (items: Category[], depth = 0) => {
    return items.map((cat) => (
      <div key={cat.id}>
        <div
          className="flex items-center gap-2 py-2.5 px-3 hover:bg-dark-200 border-b border-white/5 cursor-pointer"
          style={{ paddingLeft: 12 + depth * 24 }}
        >
          <button onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-white">
            {cat.children.length > 0 ? (
              expanded.has(cat.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : <span className="w-4" />}
          </button>
          {cat.icon && <span className="text-lg">{cat.icon}</span>}
          <span className="text-white flex-1">{cat.name}</span>
          <span className="text-xs text-gray-500">Slug: {cat.slug}</span>
          <span className="text-xs text-gray-500">Порядок: {cat.sortOrder}</span>
          <span className="text-xs text-gray-500">Товаров: {cat._count.products}</span>
          <button onClick={() => openAdd(cat.id)} className="text-purple-400 hover:text-purple-300 p-1" title="Добавить подкатегорию">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => openEdit(cat)} className="text-blue-400 hover:text-blue-300 p-1">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-300 p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {expanded.has(cat.id) && cat.children.length > 0 && renderTree(cat.children, depth + 1)}
      </div>
    ))
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openAdd()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Добавить корневую
        </button>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        {categories.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Нет категорий</p>
        ) : renderTree(categories)}
      </GlassCard>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Редактировать' : 'Создать'} категорию</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Описание" rows={2} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Иконка (emoji)" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Корневая категория</option>
                {flat.filter((c) => c.id !== editing?.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} placeholder="Порядок сортировки" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
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
