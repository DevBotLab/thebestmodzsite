'use client'

import { GlassCard } from './GlassCard'
import { Heart, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface ProductCardProps {
  name: string
  slug: string
  description?: string | null
  category: string
  subcategory: string
  price?: number
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function ProductCard({
  name,
  slug,
  description,
  category,
  subcategory,
  price,
  isFavorite = false,
  onToggleFavorite,
}: ProductCardProps) {
  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Link href={`/catalog/${category}/${subcategory}/${slug}`} className="flex-1">
          <h3 className="text-lg font-bold text-white hover:text-purple-400 transition-colors">{name}</h3>
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </Link>
        {onToggleFavorite && (
          <button onClick={onToggleFavorite} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
        )}
      </div>
      {price && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-lime-400 font-bold text-lg">{price} ₽</span>
          <Link
            href={`/catalog/${category}/${subcategory}/${slug}`}
            className="btn-primary text-sm flex items-center gap-2 py-2 px-4"
          >
            <ShoppingCart className="w-4 h-4" />
            Купить
          </Link>
        </div>
      )}
    </GlassCard>
  )
}
