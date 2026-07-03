'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { PaymentModal } from '@/components/ui/PaymentModal'
import { BackButton } from '@/components/layout/BackButton'
import toast from 'react-hot-toast'

const productTariffs: Record<string, { name: string; slug: string; days: number; price: number }[]> = {
  'jarvis': [
    { name: '1 день', slug: '1-day', days: 1, price: 50 },
    { name: '7 дней', slug: '7-days', days: 7, price: 200 },
    { name: '30 дней', slug: '30-days', days: 30, price: 500 },
    { name: 'Навсегда', slug: 'forever', days: 9999, price: 1500 },
  ],
  'zolocheat': [
    { name: '1 день', slug: '1-day', days: 1, price: 70 },
    { name: '7 дней', slug: '7-days', days: 7, price: 300 },
    { name: '30 дней', slug: '30-days', days: 30, price: 700 },
    { name: 'Навсегда', slug: 'forever', days: 9999, price: 2000 },
  ],
  'z-mod': [
    { name: '7 дней', slug: '7-days', days: 7, price: 250 },
    { name: '30 дней', slug: '30-days', days: 30, price: 600 },
  ],
  'falcon': [
    { name: '1 день', slug: '1-day', days: 1, price: 40 },
    { name: '7 дней', slug: '7-days', days: 7, price: 150 },
    { name: '30 дней', slug: '30-days', days: 30, price: 400 },
  ],
  'ml-bot': [
    { name: '7 дней', slug: '7-days', days: 7, price: 300 },
    { name: '30 дней', slug: '30-days', days: 30, price: 800 },
  ],
  'xx-mod': [
    { name: '7 дней', slug: '7-days', days: 7, price: 200 },
    { name: '30 дней', slug: '30-days', days: 30, price: 500 },
  ],
}

const productNames: Record<string, string> = {
  'jarvis': 'Jarvis',
  'zolocheat': 'ZoloCheat',
  'z-mod': 'Z Mod',
  'falcon': 'Falcon',
  'ml-bot': 'ML Bot',
  'xx-mod': 'XX Mod',
}

export default function ProductPage() {
  const params = useParams()
  const category = params.category as string
  const subcategory = params.subcategory as string
  const product = params.product as string

  const [isFavorite, setIsFavorite] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState<{ name: string; price: number } | null>(null)

  const tariffs = productTariffs[product] ?? []
  const name = productNames[product] || product

  const categoryNames: Record<string, string> = {
    'pubg-mobile': 'PUBG MOBILE',
    'mobile-legends': 'MOBILE LEGENDS',
  }

  const subcategoryNames: Record<string, string> = {
    'android-no-root': 'Android • Без Рут',
    'ios': 'iOS • iPad • iPhone',
    'android-root': 'Android • Рут',
    'android': 'Android',
  }

  const handleBuy = (tariff: { name: string; price: number }) => {
    setSelectedTariff(tariff)
    setPaymentOpen(true)
  }

  return (
    <div>
      <BreadCrumbs
        items={[
          { label: categoryNames[category] || category, href: `/catalog/${category}` },
          { label: subcategoryNames[subcategory] || subcategory, href: `/catalog/${category}/${subcategory}` },
          { label: name },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading text-white">{name}</h1>
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
        {tariffs.map((tariff) => (
          <GlassCard key={tariff.slug} className="flex flex-col items-center text-center">
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
          productName={name}
          tariffName={selectedTariff.name}
          price={selectedTariff.price}
        />
      )}
    </div>
  )
}
