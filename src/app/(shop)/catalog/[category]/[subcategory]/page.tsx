'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

const cheatProducts: Record<string, { name: string; slug: string; desc: string }[]> = {
  'android-no-root': [
    { name: 'Jarvis', slug: 'jarvis', desc: 'Многофункциональный чит для PUBG Mobile' },
    { name: 'ZoloCheat', slug: 'zolocheat', desc: 'Премиум чит с Aimbot и ESP' },
    { name: 'Z Mod', slug: 'z-mod', desc: 'Популярный мод с расширенными функциями' },
    { name: 'Falcon', slug: 'falcon', desc: 'Быстрый и незаметный чит' },
  ],
  'ios': [
    { name: 'ZoloCheat', slug: 'zolocheat', desc: 'Премиум чит для iOS' },
    { name: 'Jarvis', slug: 'jarvis', desc: 'Чит для iOS устройств' },
  ],
  'android-root': [
    { name: 'Jarvis', slug: 'jarvis', desc: 'Чит с Root доступом' },
    { name: 'Falcon', slug: 'falcon', desc: 'Falcon для Root устройств' },
  ],
  'android': [
    { name: 'ML Bot', slug: 'ml-bot', desc: 'Бот для Mobile Legends' },
    { name: 'XX Mod', slug: 'xx-mod', desc: 'Мод с дополнительными функциями' },
  ],
}

export default function SubcategoryPage() {
  const params = useParams()
  const category = params.category as string
  const subcategory = params.subcategory as string

  const categoryNames: Record<string, string> = {
    'pubg-mobile': 'PUBG MOBILE',
    'mobile-legends': 'MOBILE LEGENDS',
    'standoff-2': 'СТЭНДОФФ 2',
  }

  const subcategoryNames: Record<string, string> = {
    'android-no-root': 'Android • Без Рут',
    'ios': 'iOS • iPad • iPhone',
    'android-root': 'Android • Рут',
    'android': 'Android',
  }

  const products = cheatProducts[subcategory] ?? []

  return (
    <div>
      <BreadCrumbs
        items={[
          { label: categoryNames[category] || category, href: `/catalog/${category}` },
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
            <Link key={product.slug} href={`/catalog/${category}/${subcategory}/${product.slug}`}>
              <GlassCard>
                <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                <p className="text-sm text-gray-400">{product.desc}</p>
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
