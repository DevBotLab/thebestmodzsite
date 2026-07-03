'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, Trash2, Plus, Upload, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Tariff {
  id: string
  name: string
  days: number
  price: number
}

interface ProductKey {
  id: string
  tariffId: string
  isUsed: boolean
  createdAt: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  category: { id: string; name: string }
  platform: string | null
  sortOrder: number
  tariffs: Tariff[]
  keys: ProductKey[]
}

interface Category {
  id: string
  name: string
}

export default function AdminProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name: '', slug: '', description: '', categoryId: '', platform: '', sortOrder: 0 })

  const [tariffModal, setTariffModal] = useState(false)
  const [tariffForm, setTariffForm] = useState({ name: 'DAY_1', days: 1, price: 0 })

  const [keyTariffId, setKeyTariffId] = useState('')
  const [keyText, setKeyText] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([pRes, cRes]) => {
      if (pRes.success) {
        setProduct(pRes.data)
        setForm({
          name: pRes.data.name,
          slug: pRes.data.slug,
          description: pRes.data.description || '',
          categoryId: pRes.data.categoryId,
          platform: pRes.data.platform || '',
          sortOrder: pRes.data.sortOrder,
        })
      } else toast.error(pRes.error || 'Ошибка загрузки')
      if (cRes.success) setCategories(cRes.data)
    }).catch(() => toast.error('Ошибка загрузки'))
    .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Сохранено')
      setProduct((prev) => prev ? { ...prev, ...data.data } : prev)
    } else toast.error(data.error || 'Ошибка')
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Удалить товар?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      toast.success('Удалено')
      router.push('/admin/products')
    } else toast.error(data.error || 'Ошибка')
  }

  const handleAddTariff = async () => {
    const res = await fetch(`/api/admin/products/${id}/tariffs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tariffForm),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Тариф добавлен')
      setTariffModal(false)
      setTariffForm({ name: 'DAY_1', days: 1, price: 0 })
      setProduct((prev) => prev ? { ...prev, tariffs: [...prev.tariffs, data.data] } : prev)
    } else toast.error(data.error || 'Ошибка')
  }

  const handleDeleteTariff = async (tariffId: string) => {
    if (!confirm('Удалить тариф?')) return
    const res = await fetch(`/api/admin/products/${id}/tariffs/${tariffId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      toast.success('Тариф удалён')
      setProduct((prev) => prev ? { ...prev, tariffs: prev.tariffs.filter((t) => t.id !== tariffId) } : prev)
    } else toast.error(data.error || 'Ошибка')
  }

  const handleUploadKeys = async () => {
    if (!keyTariffId || !keyText.trim()) {
      toast.error('Выберите тариф и введите ключи')
      return
    }
    const keys = keyText.trim().split('\n').map((k) => k.trim()).filter(Boolean)
    if (!keys.length) { toast.error('Нет ключей'); return }
    setUploading(true)
    const res = await fetch(`/api/admin/products/${id}/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tariffId: keyTariffId, keys }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`Загружено ${data.data.uploaded} ключей`)
      setKeyText('')
      const pRes = await fetch(`/api/admin/products/${id}`).then(r => r.json())
      if (pRes.success) setProduct(pRes.data)
    } else toast.error(data.error || 'Ошибка')
    setUploading(false)
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>
  if (!product) return <p className="text-center text-gray-400 py-20">Товар не найден</p>

  const totalKeys = product.keys.length
  const usedKeys = product.keys.filter((k) => k.isUsed).length
  const leftKeys = totalKeys - usedKeys

  const tariffNameMap: Record<string, string> = {
    DAY_1: '1 день', DAY_3: '3 дня', DAY_7: '7 дней',
    DAY_30: '30 дней', DAY_60: '60 дней',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Редактирование: {product.name}</h2>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Удалить
          </button>
        </div>
      </div>

      <GlassCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Описание" rows={3} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div className="space-y-3">
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
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} placeholder="Порядок сортировки" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Тарифы</h3>
          <button onClick={() => setTariffModal(true)} className="btn-primary text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Добавить тариф
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-white/5">
                <th className="text-left py-2 px-3">Название</th>
                <th className="text-left py-2 px-3">Дней</th>
                <th className="text-right py-2 px-3">Цена</th>
                <th className="w-20 py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {product.tariffs.map((tariff) => (
                <tr key={tariff.id} className="border-b border-white/5 hover:bg-dark-200">
                  <td className="py-2 px-3 text-white">{tariffNameMap[tariff.name] || tariff.name}</td>
                  <td className="py-2 px-3 text-gray-300">{tariff.days}</td>
                  <td className="py-2 px-3 text-right text-lime-400">{Number(tariff.price).toLocaleString()} ₽</td>
                  <td className="py-2 px-3">
                    <button onClick={() => handleDeleteTariff(tariff.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {product.tariffs.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-500">Нет тарифов</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4">Ключи</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-dark-200 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Всего</p>
            <p className="text-xl font-bold text-white">{totalKeys}</p>
          </div>
          <div className="bg-dark-200 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Использовано</p>
            <p className="text-xl font-bold text-yellow-400">{usedKeys}</p>
          </div>
          <div className="bg-dark-200 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Осталось</p>
            <p className="text-xl font-bold text-lime-400">{leftKeys}</p>
          </div>
        </div>
        <div className="space-y-3">
          <select value={keyTariffId} onChange={(e) => setKeyTariffId(e.target.value)} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
            <option value="">Выберите тариф</option>
            {product.tariffs.map((t) => (
              <option key={t.id} value={t.id}>{tariffNameMap[t.name] || t.name} — {Number(t.price).toLocaleString()} ₽</option>
            ))}
          </select>
          <textarea value={keyText} onChange={(e) => setKeyText(e.target.value)} placeholder="Ключи (каждый с новой строки)" rows={6} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono" />
          <button onClick={handleUploadKeys} disabled={uploading} className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" /> {uploading ? 'Загрузка...' : 'Загрузить ключи'}
          </button>
        </div>
      </GlassCard>

      {tariffModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setTariffModal(false)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Добавить тариф</h3>
              <button onClick={() => setTariffModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <select value={tariffForm.name} onChange={(e) => setTariffForm({ ...tariffForm, name: e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="DAY_1">1 день</option>
                <option value="DAY_3">3 дня</option>
                <option value="DAY_7">7 дней</option>
                <option value="DAY_30">30 дней</option>
                <option value="DAY_60">60 дней</option>
              </select>
              <input type="number" value={tariffForm.days} onChange={(e) => setTariffForm({ ...tariffForm, days: +e.target.value })} placeholder="Количество дней" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <input type="number" value={tariffForm.price} onChange={(e) => setTariffForm({ ...tariffForm, price: +e.target.value })} placeholder="Цена" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setTariffModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
              <button onClick={handleAddTariff} className="btn-primary text-sm">Добавить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
