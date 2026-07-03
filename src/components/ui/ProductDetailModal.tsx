'use client'
import { X, ShoppingCart } from 'lucide-react'

interface Tariff {
  id: string
  name: string
  days: number
  price: number
}

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    description?: string
    platform?: string
    category?: { name: string }
    tariffs: Tariff[]
  } | null
  onBuy: (tariffId: string) => void
}

import { useState } from 'react'

export function ProductDetailModal({ isOpen, onClose, product, onBuy }: ProductDetailModalProps) {
  const [selectedTariff, setSelectedTariff] = useState('')

  if (!isOpen || !product) return null

  if (!selectedTariff && product.tariffs.length > 0) {
    // Initialize after first render
  }

  const selected = product.tariffs.find(t => t.id === (selectedTariff || product.tariffs[0]?.id))
  const activeId = selectedTariff || product.tariffs[0]?.id || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-4xl bg-dark-200 border border-white/10 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.category && (
                <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  {product.category.name}
                </span>
              )}
              {product.platform && (
                <span className="text-xs text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded-full">
                  {product.platform}
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-heading text-white mb-4">{product.name}</h2>
            <p className="text-gray-400 leading-relaxed">
              {product.description || 'Нет описания'}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Выберите тариф</h3>
            <div className="space-y-3">
              {product.tariffs.map((tariff) => (
                <button
                  key={tariff.id}
                  onClick={() => setSelectedTariff(tariff.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    activeId === tariff.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-dark-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      activeId === tariff.id ? 'border-purple-500' : 'border-gray-600'
                    }`}>
                      {activeId === tariff.id && <div className="w-3 h-3 rounded-full bg-purple-500" />}
                    </div>
                    <div className="text-left">
                      <span className="text-white font-medium">{tariff.days} дней</span>
                      <span className="text-xs text-gray-500 ml-2">{tariff.name.replace('DAY_', '')}</span>
                    </div>
                  </div>
                  <span className="text-lime-400 font-bold">{Number(tariff.price)} ₽</span>
                </button>
              ))}
            </div>
            {product.tariffs.length === 0 && (
              <p className="text-gray-500 text-center py-4">Тарифы не указаны</p>
            )}
            {selected && (
              <div className="mt-6 p-4 bg-dark-300 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Итого:</span>
                  <span className="text-2xl font-bold text-lime-400">{Number(selected.price)} ₽</span>
                </div>
                <button
                  onClick={() => onBuy(selected.id)}
                  className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Купить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
