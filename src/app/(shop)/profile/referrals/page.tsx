'use client'

import { useState, useEffect } from 'react'
import { Gift, Copy, Users, TrendingUp, Loader2 } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import toast from 'react-hot-toast'

export default function ReferralsPage() {
  const [data, setData] = useState<{ count: number; totalEarned: number; referralLink: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/referrals')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data)
        else toast.error(d.error || 'Ошибка загрузки')
      })
      .catch(() => toast.error('Ошибка соединения'))
      .finally(() => setLoading(false))
  }, [])

  const copyLink = () => {
    if (!data?.referralLink) return
    navigator.clipboard.writeText(data.referralLink)
    toast.success('Ссылка скопирована!')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div>
      <BreadCrumbs items={[{ label: 'Профиль', href: '/profile' }, { label: 'Рефералы' }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Реферальная система</h1>
        <BackButton />
      </div>

      <GlassCard className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-8 h-8 text-lime-400" />
          <div>
            <h2 className="font-bold text-white">Приглашай друзей и зарабатывай</h2>
            <p className="text-sm text-gray-400">Получай 10% от каждой покупки приглашённого</p>
          </div>
        </div>
        {data?.referralLink ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={data.referralLink}
              readOnly
              className="flex-1 bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
            />
            <button onClick={copyLink} className="btn-primary flex items-center gap-2 px-4">
              <Copy className="w-4 h-4" />
              Копировать
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Реферальная ссылка пока недоступна</p>
        )}
      </GlassCard>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassCard className="text-center p-4">
          <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-heading text-white">{data?.count || 0}</p>
          <p className="text-xs text-gray-400">Рефералов</p>
        </GlassCard>
        <GlassCard className="text-center p-4">
          <TrendingUp className="w-6 h-6 text-lime-400 mx-auto mb-2" />
          <p className="text-2xl font-heading text-lime-400">{data?.totalEarned || 0} ₽</p>
          <p className="text-xs text-gray-400">Заработано</p>
        </GlassCard>
      </div>
    </div>
  )
}