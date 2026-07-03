'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { apiFetch } from '@/lib/api'

export default function CatalogPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<any>('/categories')
      .then(res => setCategories(res.data || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-heading text-white mb-8">Каталог товаров</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="w-12 h-12 bg-white/10 rounded-full mx-auto mb-4" />
              <div className="h-6 bg-white/10 rounded w-2/3 mx-auto mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-heading text-white mb-8">Каталог товаров</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/catalog/${cat.slug}`}>
            <GlassCard className="h-full flex flex-col items-center text-center">
              {cat.icon && <span className="text-5xl mb-4">{cat.icon}</span>}
              <h2 className="text-xl font-bold text-white mb-2">{cat.name}</h2>
              {cat.description && <p className="text-sm text-gray-400">{cat.description}</p>}
              {cat._count?.products > 0 && (
                <span className="text-xs text-gray-500 mt-2">{cat._count.products} товаров</span>
              )}
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
