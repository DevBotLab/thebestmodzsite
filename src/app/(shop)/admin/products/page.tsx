'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Search, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Product {
  id: string
  name: string
  slug: string
  category: { name: string }
  platform: string | null
  sortOrder: number
  createdAt: string
  tariffs: { price: number }[]
}

interface Category {
  id: string
  name: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', categoryId: '', platform: '', sortOrder: 0 })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([pRes, cRes]) => {
      if (pRes.success) setProducts(pRes.data)
      if (cRes.success) setCategories(cRes.data)
    }).catch(() => toast.error('Ошибка загрузки'))
    .finally(() => setLoading(false))
  }, [])

  const handleAdd = async () => {
    if (!form.name || !form.slug || !form.categoryId) {
      toast.error('Заполните обязательные поля')
      return
    }
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Товар создан')
      setShowAdd(false)
      setForm({ name: '', slug: '', description: '', categoryId: '', platform: '', sortOrder: 0 })
      setProducts((prev) => [...prev, data.data])
    } else {
      toast.error(data.error || 'Ошибка')
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    if (!confirm(`Удалить ${selectedIds.length} товаров?`)) return
    for (const id of selectedIds) {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    }
    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)))
    setSelectedIds([])
    toast.success('Удалено')
  }

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCat && p.category.id !== filterCat) return false
    if (filterPlatform && p.platform !== filterPlatform) return false
    return true
  })

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="bg-dark-200 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white w-48"
            />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
            <option value="">Все категории</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
            <option value="">Все платформы</option>
            <option value="Android_NoRoot">Android NoRoot</option>
            <option value="Android_Root">Android Root</option>
            <option value="iOS">iOS</option>
            <option value="Panel">Panel</option>
          </select>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="btn-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Удалить ({selectedIds.length})
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Добавить товар
          </button>
        </div>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="w-10 py-3 px-4"><input type="checkbox" className="rounded" /></th>
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Название</th>
              <th className="text-left py-3 px-4">Категория</th>
              <th className="text-right py-3 px-4">Цена (мин)</th>
              <th className="text-left py-3 px-4">Платформа</th>
              <th className="text-left py-3 px-4">Дата</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr
                key={product.id}
                className="border-b border-white/5 hover:bg-dark-200 cursor-pointer"
                onClick={() => router.push(`/admin/products/${product.id}`)}
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="rounded"
                  />
                </td>
                <td className="py-3 px-4 text-purple-400 font-mono text-xs">#{product.id.slice(0, 8)}</td>
                <td className="py-3 px-4 text-white font-medium">{product.name}</td>
                <td className="py-3 px-4 text-gray-300">{product.category.name}</td>
                <td className="py-3 px-4 text-right text-lime-400">
                  {product.tariffs.length > 0
                    ? `${Math.min(...product.tariffs.map((t) => Number(t.price))).toLocaleString()} ₽`
                    : '—'}
                </td>
                <td className="py-3 px-4 text-gray-300">{product.platform?.replace('_', ' ') || '—'}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">{new Date(product.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Добавить товар</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Описание" rows={3} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Категория</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Платформа</option>
                <option value="Android_NoRoot">Android NoRoot</option>
                <option value="Android_Root">Android Root</option>
                <option value="iOS">iOS</option>
                <option value="Panel">Panel</option>
              </select>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} placeholder="Порядок" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
              <button onClick={handleAdd} className="btn-primary text-sm">Создать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
