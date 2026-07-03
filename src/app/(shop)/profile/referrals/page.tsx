'use client'

import { useState } from 'react'
import { Gift, Copy, Users, TrendingUp, Trophy, ExternalLink } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import toast from 'react-hot-toast'

const mockReferralLink = 'https://t.me/TheBestModsBot?start=ref_ABC123'

const mockTopReferrers = [
  { name: 'Player1', count: 15, earnings: 7500 },
  { name: 'Player2', count: 12, earnings: 6000 },
  { name: 'Player3', count: 10, earnings: 5000 },
  { name: 'Player4', count: 8, earnings: 4000 },
  { name: 'Player5', count: 6, earnings: 3000 },
  { name: 'Player6', count: 5, earnings: 2500 },
  { name: 'Player7', count: 4, earnings: 2000 },
  { name: 'Player8', count: 3, earnings: 1500 },
  { name: 'Player9', count: 2, earnings: 1000 },
  { name: 'Player10', count: 1, earnings: 500 },
]

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState<'referrals' | 'earnings' | 'top'>('referrals')

  const copyLink = () => {
    navigator.clipboard.writeText(mockReferralLink)
    toast.success('Ссылка скопирована!')
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
        <div className="flex gap-2">
          <input
            type="text"
            value={mockReferralLink}
            readOnly
            className="flex-1 bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
          />
          <button onClick={copyLink} className="btn-primary flex items-center gap-2 px-4">
            <Copy className="w-4 h-4" />
            Копировать
          </button>
        </div>
      </GlassCard>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'referrals', label: 'Рефералы', icon: Users },
          { key: 'earnings', label: 'Начисления', icon: TrendingUp },
          { key: 'top', label: 'Топ 10', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                activeTab === tab.key ? 'bg-purple-600 text-white' : 'bg-dark-300 text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'top' && (
        <div className="space-y-2">
          {mockTopReferrers.map((ref, i) => (
            <GlassCard key={i} className="flex items-center gap-4">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                i === 0 ? 'bg-yellow-500 text-black' :
                i === 1 ? 'bg-gray-300 text-black' :
                i === 2 ? 'bg-amber-700 text-white' :
                'bg-dark-300 text-gray-400'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-white">{ref.name}</p>
                <p className="text-xs text-gray-500">{ref.count} рефералов</p>
              </div>
              <span className="text-lime-400 font-bold">{ref.earnings} ₽</span>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p>У вас пока нет рефералов</p>
          <p className="text-sm">Поделитесь ссылкой и начните зарабатывать</p>
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="text-center py-12 text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p>История начислений пуста</p>
        </div>
      )}
    </div>
  )
}
