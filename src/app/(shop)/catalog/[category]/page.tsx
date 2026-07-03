'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProductCard } from '@/components/ui/ProductCard'
import { useState } from 'react'

const categoryData: Record<string, { name: string; subcategories?: { name: string; slug: string }[]; platforms?: { name: string; slug: string }[]; products?: { name: string; slug: string; desc?: string; price?: number }[] }> = {
  'pubg-mobile': {
    name: 'PUBG MOBILE',
    platforms: [
      { name: 'Android • Без Рут', slug: 'android-no-root' },
      { name: 'iOS • iPad • iPhone', slug: 'ios' },
      { name: 'Android • Рут', slug: 'android-root' },
    ],
  },
  'mobile-legends': {
    name: 'MOBILE LEGENDS',
    platforms: [
      { name: 'Android', slug: 'android' },
      { name: 'iOS', slug: 'ios' },
    ],
  },
  'standoff-2': {
    name: 'СТЭНДОФФ 2',
    platforms: [
      { name: 'Android', slug: 'android' },
    ],
  },
  'gbox-certificate': {
    name: 'СЕРТИФИКАТ (GBox)',
    subcategories: [
      { name: 'GBox Certificate', slug: 'gbox-cert' },
    ],
  },
  'panel': {
    name: 'ПАНЕЛЬ ОТ ЧИТОВ',
    subcategories: [
      { name: 'Admin Panels', slug: 'admin-panels' },
    ],
  },
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string
  const data = categoryData[category]
  const [favorites, setFavorites] = useState<string[]>([])

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Категория не найдена</h2>
        <Link href="/catalog" className="btn-primary inline-flex items-center gap-2 mt-4">
          ← Назад ко всем категориям
        </Link>
      </div>
    )
  }

  const toggleFavorite = (slug: string) => {
    setFavorites((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug])
  }

  return (
    <div>
      <BreadCrumbs items={[{ label: data.name }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading text-white">{data.name}</h1>
        <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
      </div>

      {data.subcategories && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.subcategories.map((sub) => (
            <Link key={sub.slug} href={`/catalog/${category}/${sub.slug}`}>
              <GlassCard>
                <h3 className="text-lg font-bold text-white">{sub.name}</h3>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}

      {data.platforms && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Выберите платформу</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.platforms.map((p) => (
              <Link key={p.slug} href={`/catalog/${category}/${p.slug}`}>
                <GlassCard>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      )}

      {data.products && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Товары</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.products.map((p) => (
              <ProductCard
                key={p.slug}
                name={p.name}
                slug={p.slug}
                description={p.desc}
                category={category}
                subcategory=""
                price={p.price}
                isFavorite={favorites.includes(p.slug)}
                onToggleFavorite={() => toggleFavorite(p.slug)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/catalog" className="btn-ghost inline-flex items-center gap-2">
          ← Назад ко всем категориям
        </Link>
      </div>
    </div>
  )
}
