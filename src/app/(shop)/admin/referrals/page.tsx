'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Save, Trophy, Users } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface ReferralSettings {
  defaultPercent: number
  transferCommission: number
}

export default function AdminReferralsPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<ReferralSettings>({ defaultPercent: 5, transferCommission: 0 })
  const [form, setForm] = useState({ defaultPercent: 5, transferCommission: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/referrals/settings')
      .then(r => r.json())
      .then(res => {
        if (res.success) { setSettings(res.data); setForm({ defaultPercent: res.data.defaultPercent, transferCommission: res.data.transferCommission }) }
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/referrals/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Настройки сохранены')
      setSettings(data.data)
    } else toast.error(data.error || 'Ошибка')
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" /> Настройки рефералов
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Процент рефереру по умолчанию</label>
            <div className="flex gap-2 items-center">
              <input type="number" value={form.defaultPercent} onChange={(e) => setForm({ ...form, defaultPercent: +e.target.value })} min={0} max={100} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <span className="text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Комиссия при переводе</label>
            <div className="flex gap-2 items-center">
              <input type="number" value={form.transferCommission} onChange={(e) => setForm({ ...form, transferCommission: +e.target.value })} min={0} max={100} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <span className="text-gray-400">%</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> Топ рефереров
        </h3>
        <p className="text-gray-400 text-sm">Статистика по рефералам будет доступна после добавления API эндпоинта.</p>
      </GlassCard>
    </div>
  )
}
