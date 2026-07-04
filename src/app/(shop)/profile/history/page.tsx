'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Package, ChevronDown, Loader2 } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

interface OrderItem {
  id: string
  totalPrice: number
  status: string
  createdAt: string
  product: { id: string; name: string }
  tariff: { id: string; name: string }
}

const statusColors: Record<string, string> = {
  CREATED: 'text-yellow-400 bg-yellow-500/10',
  AWAITING_PAYMENT: 'text-orange-400 bg-orange-500/10',
  PAID: 'text-lime-400 bg-lime-500/10',
  CHECKING: 'text-blue-400 bg-blue-500/10',
  COMPLETED: 'text-green-400 bg-green-500/10',
  CANCELLED: 'text-red-400 bg-red-500/10',
  REFUNDED: 'text-gray-400 bg-gray-500/10',
}

const statusLabels: Record<string, string> = {
  CREATED: 'Создан',
  AWAITING_PAYMENT: 'Ожидает оплаты',
  PAID: 'Оплачен',
  CHECKING: 'Проверяется',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
  REFUNDED: 'Возврат',
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '10' })
      if (cursor) params.set('cursor', cursor)
      const res = await fetch(`/api/orders?${params}`)
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Ошибка')
      const data = d.data
      setOrders((prev) => [...prev, ...data.items])
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch {
      setError('Не удалось загрузить заказы')
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [loading, hasMore, cursor])

  useEffect(() => { loadMore() }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div>
        <BreadCrumbs items={[{ label: 'Профиль', href: '/profile' }, { label: 'История покупок' }]} />
        <div className="text-center py-20">
          <p className="text-red-400">{error}</p>
          <button onClick={() => { setError(''); setCursor(null); setHasMore(true); setTimeout(() => loadMore(), 0) }} className="btn-primary mt-4">
            Повторить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <BreadCrumbs items={[{ label: 'Профиль', href: '/profile' }, { label: 'История покупок' }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">История покупок</h1>
        <BackButton />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">У вас пока нет заказов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <GlassCard key={order.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white">{order.product.name}</span>
                  </div>
                  <p className="text-sm text-gray-400">{order.tariff.name}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className="text-right">
                  <span className="text-lime-400 font-bold">{order.totalPrice} ₽</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status] || ''}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <div ref={loaderRef} className="py-8 text-center">
        {loading && <ChevronDown className="w-6 h-6 animate-bounce text-purple-400 mx-auto" />}
        {!hasMore && orders.length > 0 && <p className="text-gray-500 text-sm">Все заказы загружены</p>}
      </div>
    </div>
  )
}