'use client'

import Link from 'next/link'
import { Shield, Zap, HeadphonesIcon, Gift, ArrowRight } from 'lucide-react'
import { BannerCarousel } from '@/components/ui/BannerCarousel'
import { GlassCard } from '@/components/ui/GlassCard'

const advantages = [
  { icon: Shield, title: '100% безопасность', desc: 'Все ключи проверены и гарантируют отсутствие банов при правильном использовании' },
  { icon: Zap, title: 'Мгновенная выдача', desc: 'После оплаты ключ приходит моментально в личный кабинет' },
  { icon: HeadphonesIcon, title: 'Поддержка 24/7', desc: 'Круглосуточная поддержка через Telegram и тикет-систему' },
  { icon: Gift, title: 'Реферальная система', desc: 'Получай 10% от покупок приглашённых друзей' },
]

export default function HomePage() {
  return (
    <div className="space-y-10 md:space-y-16">
      <section className="relative pt-6 md:pt-12 pb-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="badge-purple">Premium</span>
            <span className="badge-lime">Акция</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Магазин читов для{' '}
            <span className="text-gradient">твоих игр</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            PUBG MOBILE, Mobile Legends, Standoff 2 и другие игры. Мгновенная выдача, 100% безопасность, поддержка 24/7.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/catalog" className="btn-primary inline-flex items-center gap-2 text-base">
              Перейти в каталог
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/reviews" className="btn-outline text-base">
              Отзывы
            </Link>
          </div>
        </div>
      </section>

      <BannerCarousel />

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-1 rounded-full bg-purple-500" />
          <h2 className="section-title">Почему мы?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {advantages.map((adv) => {
            const Icon = adv.icon
            return (
              <GlassCard key={adv.title}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-lime-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">{adv.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{adv.desc}</p>
              </GlassCard>
            )
          })}
        </div>
      </section>

      <section className="glass-card-premium p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Готов начать?</h2>
        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          Выбери подходящий чит из каталога и получи доступ к эксклюзивным функциям уже сегодня
        </p>
        <Link href="/catalog" className="btn-lime inline-flex items-center gap-2 text-base px-8 py-3.5">
          Открыть каталог
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}
