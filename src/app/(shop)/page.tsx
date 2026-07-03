'use client'

import Link from 'next/link'
import { Shield, Zap, HeadphonesIcon, Gift } from 'lucide-react'
import { BannerCarousel } from '@/components/ui/BannerCarousel'
import { StatsGraph } from '@/components/ui/StatsGraph'
import { GlassCard } from '@/components/ui/GlassCard'

const advantages = [
  { icon: Shield, title: '100% безопасность', desc: 'Все ключи проверены и гарантируют отсутствие банов при правильном использовании' },
  { icon: Zap, title: 'Мгновенная выдача', desc: 'После оплаты ключ приходит моментально в личный кабинет' },
  { icon: HeadphonesIcon, title: 'Поддержка 24/7', desc: 'Круглосуточная поддержка через Telegram и тикет-систему' },
  { icon: Gift, title: 'Реферальная система', desc: 'Получай 10% от покупок приглашённых друзей' },
]

const resources = [
  { title: 'Telegram Канал', url: 'https://t.me/thebestmods' },
  { title: 'Telegram Чат', url: 'https://t.me/thebestmods_chat' },
  { title: 'YouTube', url: 'https://youtube.com/@thebestmods' },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-3xl md:text-5xl font-heading text-white mb-4">
          TheBestMods
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Магазин читов и ключей для PUBG MOBILE, Mobile Legends, Standoff 2 и других игр
        </p>
      </section>

      <BannerCarousel />

      <StatsGraph />

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Почему мы?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {advantages.map((adv) => {
            const Icon = adv.icon
            return (
              <GlassCard key={adv.title}>
                <Icon className="w-10 h-10 text-purple-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">{adv.title}</h3>
                <p className="text-sm text-gray-400">{adv.desc}</p>
              </GlassCard>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Официальные ресурсы</h2>
        <div className="flex flex-wrap gap-3">
          {resources.map((r) => (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              {r.title}
            </a>
          ))}
        </div>
      </section>

      <div className="text-center py-6">
        <Link href="/catalog" className="btn-lime text-lg px-10 py-4 inline-flex items-center gap-2">
          🌀 Открыть меню магазина
        </Link>
      </div>
    </div>
  )
}
