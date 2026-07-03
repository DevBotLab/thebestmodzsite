'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Users, ShoppingCart, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardData {
  stats: {
    totalUsers: number
    totalOrders: number
    revenueToday: number
    revenueWeek: number
    revenueMonth: number
    onlineUsers: number
  }
  recentOrders: {
    id: string
    user: { tgUsername: string | null; firstName: string | null }
    product: { name: string }
    totalPrice: number
    status: string
    createdAt: string
  }[]
  salesChart: { date: string; amount: number }[]
}

const statusColors: Record<string, string> = {
  CREATED: 'text-gray-400',
  AWAITING_PAYMENT: 'text-yellow-400',
  PAID: 'text-blue-400',
  CHECKING: 'text-purple-400',
  COMPLETED: 'text-lime-400',
  CANCELLED: 'text-red-400',
  REFUNDED: 'text-orange-400',
}

const statusLabels: Record<string, string> = {
  CREATED: 'Создан',
  AWAITING_PAYMENT: 'Ожидает оплаты',
  PAID: 'Оплачен',
  CHECKING: 'Проверка',
  COMPLETED: 'Выполнен',
  CANCELLED: 'Отменён',
  REFUNDED: 'Возврат',
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data)
        else toast.error(res.error || 'Ошибка загрузки')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  if (!data) return <p className="text-center text-gray-400 py-20">Нет данных</p>

  const statCards = [
    { label: 'Пользователей', value: data.stats.totalUsers, icon: Users, color: 'text-purple-400' },
    { label: 'Заказов всего', value: data.stats.totalOrders, icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'Доход сегодня', value: `${data.stats.revenueToday.toLocaleString()} ₽`, icon: DollarSign, color: 'text-lime-400' },
    { label: 'Доход за неделю', value: `${data.stats.revenueWeek.toLocaleString()} ₽`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Доход за месяц', value: `${data.stats.revenueMonth.toLocaleString()} ₽`, icon: TrendingUp, color: 'text-yellow-400' },
    { label: 'Онлайн', value: data.stats.onlineUsers, icon: Activity, color: 'text-cyan-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <GlassCard key={card.label}>
              <div className="flex items-center gap-3">
                <Icon className="w-8 h-8" />
                <div>
                  <p className="text-xs text-gray-400">{card.label}</p>
                  <p className="text-xl font-bold text-white">{card.value}</p>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>

      <GlassCard>
        <h2 className="text-lg font-bold text-white mb-4">График продаж</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.salesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#1A1A26',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: 8,
                  color: '#fff',
                }}
              />
              <Bar dataKey="amount" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-bold text-white mb-4">Последние заказы</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-white/5">
                <th className="text-left py-2 px-3">ID</th>
                <th className="text-left py-2 px-3">Пользователь</th>
                <th className="text-left py-2 px-3">Товар</th>
                <th className="text-right py-2 px-3">Сумма</th>
                <th className="text-left py-2 px-3">Статус</th>
                <th className="text-left py-2 px-3">Дата</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-dark-200">
                  <td className="py-2 px-3 text-purple-400 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                  <td className="py-2 px-3 text-white">{order.user.tgUsername || order.user.firstName || '—'}</td>
                  <td className="py-2 px-3 text-gray-300">{order.product.name}</td>
                  <td className="py-2 px-3 text-right text-lime-400">{order.totalPrice.toLocaleString()} ₽</td>
                  <td className="py-2 px-3">
                    <span className={`${statusColors[order.status] || 'text-gray-400'} text-xs font-medium`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
