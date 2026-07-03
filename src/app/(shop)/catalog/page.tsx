'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'

const categories = [
  { name: 'PUBG MOBILE', slug: 'pubg-mobile', icon: '🔫', desc: 'Читы для PUBG Mobile всех версий' },
  { name: 'MOBILE LEGENDS', slug: 'mobile-legends', icon: '⚔️', desc: 'Скины и читы для MLBB' },
  { name: 'СТЭНДОФФ 2', slug: 'standoff-2', icon: '🔪', desc: 'Читы для Standoff 2' },
  { name: 'СЕРТИФИКАТ (GBox)', slug: 'gbox-certificate', icon: '📜', desc: 'Сертификаты для GBox' },
  { name: 'ПАНЕЛЬ ОТ ЧИТОВ', slug: 'panel', icon: '🖥️', desc: 'Админ-панели для читов' },
]

export default function CatalogPage() {
  return (
    <div>
      <h1 className="text-3xl font-heading text-white mb-8">Каталог товаров</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/catalog/${cat.slug}`}>
            <GlassCard className="h-full flex flex-col items-center text-center">
              <span className="text-5xl mb-4">{cat.icon}</span>
              <h2 className="text-xl font-bold text-white mb-2">{cat.name}</h2>
              <p className="text-sm text-gray-400">{cat.desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
