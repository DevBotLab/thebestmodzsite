'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Cheat {
  id: string
  gameName: string
  cheatName: string
  platform: string | null
  status: string
  updatedAt: string
}

const statusConfig: Record<string, { label: string; emoji: string; color: string }> = {
  SAFE: { label: 'Безопасно', emoji: '🟢', color: 'text-lime-400 bg-lime-400/10' },
  RISKY: { label: 'Рискованно', emoji: '🟡', color: 'text-yellow-400 bg-yellow-400/10' },
  DANGER: { label: 'Опасно', emoji: '🔴', color: 'text-red-400 bg-red-400/10' },
  UPDATING: { label: 'Обновляется', emoji: '⚫', color: 'text-gray-400 bg-gray-400/10' },
}

const statuses = ['SAFE', 'RISKY', 'DANGER', 'UPDATING']

export default function AdminCheatsPage() {
  const [cheats, setCheats] = useState<Cheat[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ gameName: '', cheatName: '', platform: '', status: 'SAFE' })

  const load = () => {
    setLoading(true)
    fetch('/api/admin/cheats')
      .then(r => r.json())
      .then(res => {
        if (res.success) setCheats(res.data)
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (cheatId: string, newStatus: string) => {
    const prev = cheats.find((c) => c.id === cheatId)?.status
    setCheats((prevCheats) => prevCheats.map((c) => c.id === cheatId ? { ...c, status: newStatus } : c))
    const res = await fetch(`/api/admin/cheats/${cheatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Статус обновлён')
    } else {
      toast.error(data.error || 'Ошибка')
      setCheats((prevCheats) => prevCheats.map((c) => c.id === cheatId ? { ...c, status: prev || c.status } : c))
    }
  }

  const handleAdd = async () => {
    if (!form.gameName || !form.cheatName) { toast.error('Заполните обязательные поля'); return }
    const res = await fetch('/api/admin/cheats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Чит добавлен')
      setShowAdd(false)
      setForm({ gameName: '', cheatName: '', platform: '', status: 'SAFE' })
      load()
    } else toast.error(data.error || 'Ошибка')
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="text-left py-3 px-4">Игра</th>
              <th className="text-left py-3 px-4">Чит</th>
              <th className="text-left py-3 px-4">Платформа</th>
              <th className="text-left py-3 px-4">Статус</th>
              <th className="text-left py-3 px-4">Обновлён</th>
            </tr>
          </thead>
          <tbody>
            {cheats.map((cheat) => (
              <tr key={cheat.id} className="border-b border-white/5 hover:bg-dark-200">
                <td className="py-3 px-4 text-white font-medium">{cheat.gameName}</td>
                <td className="py-3 px-4 text-gray-300">{cheat.cheatName}</td>
                <td className="py-3 px-4 text-gray-300">{cheat.platform || '—'}</td>
                <td className="py-3 px-4">
                  <select
                    value={cheat.status}
                    onChange={(e) => handleStatusChange(cheat.id, e.target.value)}
                    className={`text-sm font-medium rounded-lg px-2 py-1 border-0 cursor-pointer ${statusConfig[cheat.status]?.color || 'text-gray-400'}`}
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{statusConfig[s]?.emoji} {statusConfig[s]?.label}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">{new Date(cheat.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {cheats.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500">Нет записей</td></tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Добавить чит</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.gameName} onChange={(e) => setForm({ ...form, gameName: e.target.value })} placeholder="Название игры" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <input value={form.cheatName} onChange={(e) => setForm({ ...form, cheatName: e.target.value })} placeholder="Название чита" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Платформа" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                {statuses.map((s) => <option key={s} value={s}>{statusConfig[s]?.emoji} {statusConfig[s]?.label}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
              <button onClick={handleAdd} className="btn-primary text-sm">Добавить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
