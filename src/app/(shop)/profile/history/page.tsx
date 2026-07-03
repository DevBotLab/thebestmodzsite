'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Package, ChevronDown } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

interface Order {
  id: string
  number: number
  date: string
  status: 'active' | 'completed' | 'cancelled'
  amount: number
  paymentMethod: string
  productName: string
}

const mockOrders: Order[] = Array.from({ length: 25 }, (_, i) => ({
  id: `order-${i + 1}`,
  number: 1000 + i,
  date: new Date(Date.now() - i * 86400000).toLocaleDateString('ru-RU'),
  status: ['active', 'completed', 'cancelled'][i % 3] as Order['status'],
  amount: Math.floor(Math.random() * 2000) + 50,
  paymentMethod: ['СБП', 'Карта РФ', 'CryptoBot', 'PayPal'][i % 4],
  productName: ['Jarvis', 'ZoloCheat', 'Z Mod', 'Falcon'][i % 4],
}))

const statusColors: Record<string, string> = {
  active: 'text-lime-400 bg-lime-500/10',
  completed: 'text-blue-400 bg-blue-500/10',
  cancelled: 'text-red-400 bg-red-500/10',
}

const statusLabels: Record<string, string> = {
  active: 'Активен',
  completed: 'Завершён',
  cancelled: 'Отменён',
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    setLoading(true)
    setTimeout(() => {
      const end = page * 10
      const newOrders = mockOrders.slice(0, end)
      setOrders(newOrders)
      setPage((p) => p + 1)
      setLoading(false)
      if (end >= mockOrders.length) setHasMore(false)
    }, 500)
  }, [loading, hasMore, page])

  useEffect(() => {
    loadMore()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div>
      <BreadCrumbs items={[{ label: 'Профиль', href: '/profile' }, { label: 'История покупок' }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">История покупок</h1>
        <BackButton />
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <GlassCard key={order.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white">Заказ #{order.number}</span>
                </div>
                <p className="text-sm text-gray-400">{order.productName}</p>
                <p className="text-xs text-gray-500">{order.date}</p>
              </div>
              <div className="text-right">
                <span className="text-lime-400 font-bold">{order.amount} ₽</span>
                <p className="text-xs text-gray-500">{order.paymentMethod}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
              {order.status === 'active' && (
                <Link href={`/support?order=${order.id}`} className="text-xs text-purple-400 hover:text-purple-300">
                  Управлять заказом #{order.number}
                </Link>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      <div ref={loaderRef} className="py-8 text-center">
        {loading && <ChevronDown className="w-6 h-6 animate-bounce text-purple-400 mx-auto" />}
        {!hasMore && <p className="text-gray-500 text-sm">Все заказы загружены</p>}
      </div>
    </div>
  )
}
