'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Settings, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface PaymentMethod {
  id: string
  name: string
  code: string
  isActive: boolean
  config: any
  sortOrder: number
}

export default function AdminPaymentsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<PaymentMethod | null>(null)
  const [configText, setConfigText] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/payments')
      .then(r => r.json())
      .then(res => {
        if (res.success) setMethods(res.data)
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (method: PaymentMethod) => {
    const res = await fetch('/api/admin/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: method.id, isActive: !method.isActive }),
    })
    const data = await res.json()
    if (data.success) {
      setMethods((prev) => prev.map((m) => m.id === method.id ? { ...m, isActive: !m.isActive } : m))
      toast.success(method.isActive ? 'Деактивирован' : 'Активирован')
    } else toast.error(data.error || 'Ошибка')
  }

  const openConfig = (method: PaymentMethod) => {
    setSelected(method)
    setConfigText(JSON.stringify(method.config || {}, null, 2))
    setShowModal(true)
  }

  const handleSaveConfig = async () => {
    if (!selected) return
    try {
      JSON.parse(configText)
    } catch {
      toast.error('Некорректный JSON')
      return
    }
    const res = await fetch('/api/admin/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, config: JSON.parse(configText) }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Конфигурация сохранена')
      setShowModal(false)
      load()
    } else toast.error(data.error || 'Ошибка')
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="text-left py-3 px-4">Название</th>
              <th className="text-left py-3 px-4">Код</th>
              <th className="text-center py-3 px-4">Активен</th>
              <th className="text-right py-3 px-4">Порядок</th>
              <th className="w-24 py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {methods.map((method) => (
              <tr key={method.id} className="border-b border-white/5 hover:bg-dark-200">
                <td className="py-3 px-4 text-white font-medium">{method.name}</td>
                <td className="py-3 px-4 text-gray-400 text-xs font-mono">{method.code}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleToggle(method)}
                    className={`relative w-10 h-5 rounded-full transition-colors inline-block ${method.isActive ? 'bg-lime-500' : 'bg-dark-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${method.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </td>
                <td className="py-3 px-4 text-right text-gray-300">{method.sortOrder}</td>
                <td className="py-3 px-4">
                  <button onClick={() => openConfig(method)} className="text-purple-400 hover:text-purple-300 p-1">
                    <Settings className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {methods.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500">Нет методов оплаты</td></tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      {showModal && selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Настройка: {selected.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <label className="text-xs text-gray-400 block">JSON конфигурация:</label>
              <textarea value={configText} onChange={(e) => setConfigText(e.target.value)} rows={12} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
              <button onClick={handleSaveConfig} className="btn-primary text-sm">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
