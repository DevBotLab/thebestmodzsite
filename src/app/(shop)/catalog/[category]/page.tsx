'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { ProductDetailModal } from '@/components/ui/ProductDetailModal'
import { apiFetch } from '@/lib/api'

const platformLabel: Record<string, string> = {
  Android_NoRoot: 'Android',
  Android_Root: 'Android Root',
  iOS: 'iOS',
  Panel: 'Panel',
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.category as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    async function load() {
      try {
        const catRes = await apiFetch<any>('/categories')
        const cats: any[] = catRes.data || []
        const found = cats.find((c: any) => c.slug === slug)
        if (!found) {
          setError('Категория не найдена')
          return
        }
        setCategory(found)

        const prodRes = await apiFetch<any>(`/products?categoryId=${found.id}`)
        setProducts(prodRes.data?.items || [])
      } catch {
        setError('Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const handleBuy = (tariffId: string) => {
    // TODO: integrate auth check & purchase flow
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">{error}</h2>
        <Link href="/catalog" className="btn-primary inline-flex items-center gap-2 mt-4">
          ← Назад ко всем категориям
        </Link>
      </div>
    )
  }

  return (
    <div>
      <BreadCrumbs items={[{ label: category?.name || slug }]} />

      <h1 className="text-3xl font-heading text-white mb-8">{category?.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <GlassCard key={product.id} onClick={() => setSelectedProduct(product)}>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    {product.category.name}
                  </span>
                )}
                {product.platform && (
                  <span className="text-xs text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded-full">
                    {platformLabel[product.platform] || product.platform}
                  </span>
                )}
              </div>
              {product.tariffs && product.tariffs.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lime-400 font-bold text-lg">
                    от {Math.min(...product.tariffs.map((t: any) => Number(t.price)))} ₽
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.tariffs.length} тариф{product.tariffs.length > 1 ? 'ов' : ''}
                  </span>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-400">В этой категории пока нет товаров</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link href="/catalog" className="btn-ghost inline-flex items-center gap-2">
          ← Назад ко всем категориям
        </Link>
      </div>

      <ProductDetailModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onBuy={handleBuy}
      />
    </div>
  )
}
