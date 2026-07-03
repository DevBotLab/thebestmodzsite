'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Upload } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Product {
  id: string
  name: string
  tariffs: { id: string; name: string; days: number; price: number }[]
  keys: { id: string; isUsed: boolean }[]
}

export default function AdminKeysPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedTariff, setSelectedTariff] = useState('')
  const [keyText, setKeyText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState({ total: 0, used: 0, left: 0 })

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(res => {
        if (res.success) setProducts(res.data)
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedProduct) {
      setStats({ total: 0, used: 0, left: 0 })
      return
    }
    const product = products.find((p) => p.id === selectedProduct)
    if (product) {
      const total = product.keys.length
      const used = product.keys.filter((k) => k.isUsed).length
      setStats({ total, used, left: total - used })
    }
  }, [selectedProduct, products])

  const handleProductChange = async (productId: string) => {
    setSelectedProduct(productId)
    setSelectedTariff('')
    if (productId) {
      const res = await fetch(`/api/admin/products/${productId}`).then(r => r.json())
      if (res.success) {
        setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, tariffs: res.data.tariffs, keys: res.data.keys } : p))
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedProduct || !selectedTariff || !keyText.trim()) {
      toast.error('Выберите товар, тариф и введите ключи')
      return
    }
    const keys = keyText.trim().split('\n').map((k) => k.trim()).filter(Boolean)
    if (!keys.length) { toast.error('Нет ключей'); return }

    setUploading(true)
    const res = await fetch(`/api/admin/products/${selectedProduct}/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tariffId: selectedTariff, keys }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`Загружено ${data.data.uploaded} ключей`)
      setKeyText('')
      await handleProductChange(selectedProduct)
    } else toast.error(data.error || 'Ошибка')
    setUploading(false)
  }

  const tariffNameMap: Record<string, string> = {
    DAY_1: '1 день', DAY_3: '3 дня', DAY_7: '7 дней',
    DAY_30: '30 дней', DAY_60: '60 дней',
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  const currentProduct = products.find((p) => p.id === selectedProduct)

  return (
    <div className="space-y-6 max-w-2xl">
      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4">Загрузка ключей</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Товар</label>
            <select value={selectedProduct} onChange={(e) => handleProductChange(e.target.value)} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="">Выберите товар</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {currentProduct && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">Тариф</label>
              <select value={selectedTariff} onChange={(e) => setSelectedTariff(e.target.value)} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Выберите тариф</option>
                {currentProduct.tariffs.map((t) => (
                  <option key={t.id} value={t.id}>{tariffNameMap[t.name] || t.name} — {Number(t.price).toLocaleString()} ₽</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Ключи (каждый с новой строки)</label>
            <textarea value={keyText} onChange={(e) => setKeyText(e.target.value)} rows={10} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono" />
          </div>
          <button onClick={handleUpload} disabled={uploading || !selectedProduct || !selectedTariff} className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" /> {uploading ? 'Загрузка...' : 'Загрузить ключи'}
          </button>
        </div>
      </GlassCard>

      {selectedProduct && (
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4">Статистика ключей</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400">Всего</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-dark-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400">Использовано</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.used}</p>
            </div>
            <div className="bg-dark-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400">Осталось</p>
              <p className="text-2xl font-bold text-lime-400">{stats.left}</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
