'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    siteName: '',
    supportContact: '',
    minDeposit: 100,
    minWithdrawal: 100,
    currency: 'RUB',
    telegramBotLink: '',
    welcomeBonus: 0,
    maintenanceMode: false,
    orderAutoComplete: false,
  })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(res => {
        if (res.success) setForm((prev) => ({ ...prev, ...res.data }))
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Настройки сохранены')
      setForm((prev) => ({ ...prev, ...data.data }))
    } else toast.error(data.error || 'Ошибка')
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-6 max-w-2xl">
      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4">Основные настройки</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Название сайта</label>
              <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Валюта</label>
              <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Контакт поддержки</label>
              <input value={form.supportContact} onChange={(e) => setForm({ ...form, supportContact: e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Telegram Bot Username</label>
              <input value={form.telegramBotLink} onChange={(e) => setForm({ ...form, telegramBotLink: e.target.value })} placeholder="@username" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Мин. депозит</label>
              <input type="number" value={form.minDeposit} onChange={(e) => setForm({ ...form, minDeposit: +e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Мин. вывод</label>
              <input type="number" value={form.minWithdrawal} onChange={(e) => setForm({ ...form, minWithdrawal: +e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Приветственный бонус</label>
              <input type="number" value={form.welcomeBonus} onChange={(e) => setForm({ ...form, welcomeBonus: +e.target.value })} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Режим обслуживания</label>
              <button
                onClick={() => setForm({ ...form, maintenanceMode: !form.maintenanceMode })}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.maintenanceMode ? 'bg-red-500' : 'bg-dark-300'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Авто-завершение заказов</label>
              <button
                onClick={() => setForm({ ...form, orderAutoComplete: !form.orderAutoComplete })}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.orderAutoComplete ? 'bg-lime-500' : 'bg-dark-300'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.orderAutoComplete ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
