'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

interface ProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  platform: string | null
  category: { id: string; slug: string; name: string }
}

const platformSlugToEnum: Record<string, string> = {
  'android-no-root': 'Android_NoRoot',
  'android-root': 'Android_Root',
  'ios': 'iOS',
  'panel': 'Panel',
  'android': 'Android_NoRoot',
}

const subcategoryNames: Record<string, string> = {
  'android-no-root': 'Android • Без Рут',
  'ios': 'iOS • iPad • iPhone',
  'android-root': 'Android • Рут',
  'android': 'Android',
}

export default function SubcategoryPage() {
  const params = useParams()
  const category = params.category as string
  const subcategory = params.subcategory as string

  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState(category)

  useEffect(() => {
    const platform = platformSlugToEnum[subcategory]
    const query = new URLSearchParams({ limit: '50' })
    if (platform) query.set('platform', platform)

    fetch(`/api/products?${query}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProducts(d.data.items)
          if (d.data.items.length > 0) {
            setCategoryName(d.data.items[0].category.name)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [subcategory])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div>
      <BreadCrumbs
        items={[
          { label: categoryName, href: `/catalog/${category}` },
          { label: subcategoryNames[subcategory] || subcategory },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">{subcategoryNames[subcategory] || subcategory}</h1>
        <BackButton />
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/catalog/${category}/${subcategory}/${product.slug}`}>
              <GlassCard>
                <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                {product.description && <p className="text-sm text-gray-400">{product.description}</p>}
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>В этой категории пока нет товаров</p>
        </div>
      )}
    </div>
  )
}