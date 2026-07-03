'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import { Check } from 'lucide-react'

const tariffs = [
  { name: '1 день', price: '99 ₽', days: 1, popular: false },
  { name: '3 дня', price: '199 ₽', days: 3, popular: false },
  { name: '7 дней', price: '399 ₽', days: 7, popular: true },
  { name: '30 дней', price: '999 ₽', days: 30, popular: false },
  { name: '60 дней', price: '1499 ₽', days: 60, popular: false },
]

export default function PricesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Цены</h1>
        <BackButton />
      </div>

      <p className="text-gray-400 mb-8">Выберите подходящий тариф для доступа к читам. Цены указаны за один товар.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {tariffs.map((t) => (
          <GlassCard key={t.days} className={`relative ${t.popular ? 'ring-2 ring-purple-500' : ''}`}>
            {t.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Популярный
              </span>
            )}
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
              <p className="text-3xl font-bold text-purple-400 mb-4">{t.price}</p>
              <ul className="text-sm text-gray-400 space-y-2 mb-6 text-left">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-lime-400 shrink-0" />
                  Полный доступ
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-lime-400 shrink-0" />
                  Обновления
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-lime-400 shrink-0" />
                  Поддержка
                </li>
              </ul>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
