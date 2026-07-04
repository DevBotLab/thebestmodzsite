'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingCart, Loader2, Heart } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { PaymentModal } from '@/components/ui/PaymentModal'
import { BackButton } from '@/components/layout/BackButton'
import toast from 'react-hot-toast'

interface Tariff {
  id: string
  name: string
  slug: string
  days: number
  price: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  tariffs: Tariff[]
  platform: string | null
  category: { id: string; name: string; slug: string }
}

const platformSlugToEnum: Record<string, string> = {
  'android-no-root': 'Android_NoRoot',
  'android-root': 'Android_Root',
  'ios': 'iOS',
  'panel': 'Panel',
  'android': 'Android_NoRoot',
}

export default function ProductPage() {
  const params = useParams()
  const category = params.category as string
  const subcategory = params.subcategory as string
  const productSlug = params.product as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTariff, setSelectedTariff] = useState<{ name: string; price: number } | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const platform = platformSlugToEnum[subcategory]
    const params = new URLSearchParams({ limit: '50' })
    if (platform) params.set('platform', platform)

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error || 'Ошибка')
        const found = d.data.items.find((p: Product) => p.slug === productSlug)
        if (found) setProduct(found)
      })
      .catch(() => toast.error('Не удалось загрузить товар'))
      .finally(() => setLoading(false))
  }, [productSlug, subcategory])

  const handleBuy = (tariff: Tariff) => {
    setSelectedTariff({ name: tariff.name, price: tariff.price })
    setPaymentOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Товар не найден</h2>
        <div className="mt-4"><BackButton /></div>
      </div>
    )
  }

  return (
    <div>
      <BreadCrumbs
        items={[
          { label: product.category.name, href: `/catalog/${product.category.slug}` },
          { label: subcategory, href: `/catalog/${product.category.slug}/${subcategory}` },
          { label: product.name },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading text-white">{product.name}</h1>
          {product.description && <p className="text-gray-400 mt-1">{product.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setIsFavorite(!isFavorite); toast.success(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное') }}
            className="btn-ghost"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <BackButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {product.tariffs.map((tariff) => (
          <GlassCard key={tariff.id} className="flex flex-col items-center text-center">
            <h3 className="text-xl font-bold text-white mb-2">{tariff.name}</h3>
            <p className="text-3xl font-heading text-lime-400 mb-4">{tariff.price} ₽</p>
            <p className="text-sm text-gray-400 mb-4">{tariff.days === 9999 ? 'Бессрочно' : `${tariff.days} дней`}</p>
            <button
              onClick={() => handleBuy(tariff)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Купить
            </button>
          </GlassCard>
        ))}
      </div>

      {selectedTariff && (
        <PaymentModal
          isOpen={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          productName={product.name}
          tariffName={selectedTariff.name}
          price={selectedTariff.price}
        />
      )}
    </div>
  )
}