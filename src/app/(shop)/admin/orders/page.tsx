'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Search, Download, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Order {
  id: string
  userId: string
  totalPrice: number
  status: string
  paymentMethod: string | null
  createdAt: string
  user: { tgId: string; tgUsername: string | null; firstName: string | null; lastName: string | null }
  product: { id: string; name: string; slug: string }
  tariff: { id: string; name: string; days: number }
  payments: { id: string; status: string; amount: number; createdAt: string }[]
}

const statusColors: Record<string, string> = {
  CREATED: 'text-yellow-400 bg-yellow-400/10',
  AWAITING_PAYMENT: 'text-orange-400 bg-orange-400/10',
  PAID: 'text-blue-400 bg-blue-400/10',
  CHECKING: 'text-purple-400 bg-purple-400/10',
  COMPLETED: 'text-lime-400 bg-lime-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
  REFUNDED: 'text-orange-400 bg-orange-400/10',
}

const statusLabels: Record<string, string> = {
  CREATED: 'Создан', AWAITING_PAYMENT: 'Ожидает оплаты', PAID: 'Оплачен',
  CHECKING: 'Проверка', COMPLETED: 'Выполнен', CANCELLED: 'Отменён', REFUNDED: 'Возврат',
}

const statuses = ['all', 'CREATED', 'AWAITING_PAYMENT', 'PAID', 'CHECKING', 'COMPLETED', 'CANCELLED', 'REFUNDED']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    if (search) params.set('userId', search)

    fetch(`/api/admin/orders?${params}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) { setOrders(res.data.items); setTotalPages(res.data.totalPages) }
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, filterStatus])

  const handleSearch = () => { setPage(1); load() }

  const handleStatusUpdate = async () => {
    if (!selected || !newStatus) return
    setUpdating(true)
    const res = await fetch(`/api/admin/orders/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Статус обновлён')
      setSelected(data.data)
      setOrders((prev) => prev.map((o) => o.id === selected.id ? { ...o, status: newStatus } : o))
    } else toast.error(data.error || 'Ошибка')
    setUpdating(false)
  }

  const handleExport = () => {
    window.open('/api/admin/export?type=orders&format=csv', '_blank')
  }

  const tariffNameMap: Record<string, string> = {
    DAY_1: '1 день', DAY_3: '3 дня', DAY_7: '7 дней',
    DAY_30: '30 дней', DAY_60: '60 дней',
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }} className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
            {statuses.map((s) => <option key={s} value={s}>{s === 'all' ? 'Все статусы' : statusLabels[s] || s}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ID пользователя" className="bg-dark-200 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white w-48" />
          </div>
          <button onClick={handleSearch} className="btn-primary text-sm">Поиск</button>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> Экспорт CSV
        </button>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Пользователь</th>
              <th className="text-left py-3 px-4">Товар</th>
              <th className="text-left py-3 px-4">Тариф</th>
              <th className="text-right py-3 px-4">Сумма</th>
              <th className="text-left py-3 px-4">Статус</th>
              <th className="text-left py-3 px-4">Дата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/5 hover:bg-dark-200 cursor-pointer"
                onClick={() => { setSelected(order); setNewStatus(order.status) }}
              >
                <td className="py-3 px-4 text-purple-400 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                <td className="py-3 px-4 text-white">{order.user?.tgUsername || order.user?.firstName || '—'}</td>
                <td className="py-3 px-4 text-gray-300">{order.product?.name || '—'}</td>
                <td className="py-3 px-4 text-gray-300">{tariffNameMap[order.tariff?.name] || order.tariff?.name || '—'}</td>
                <td className="py-3 px-4 text-right text-lime-400">{Number(order.totalPrice).toLocaleString()} ₽</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || 'text-gray-400'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-gray-500">Нет заказов</td></tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-sm ${p === page ? 'bg-purple-600 text-white' : 'bg-dark-200 text-gray-400 hover:text-white'}`}>{p}</button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Заказ #{selected.id.slice(0, 8)}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Пользователь:</span><span className="text-white">{selected.user?.tgUsername || selected.user?.firstName || '—'} (TG: {selected.user?.tgId || '—'})</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Товар:</span><span className="text-white">{selected.product?.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Тариф:</span><span className="text-white">{tariffNameMap[selected.tariff?.name] || selected.tariff?.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Сумма:</span><span className="text-lime-400">{Number(selected.totalPrice).toLocaleString()} ₽</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Метод оплаты:</span><span className="text-white">{selected.paymentMethod || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Дата:</span><span className="text-white">{new Date(selected.createdAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Текущий статус:</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[selected.status] || 'text-gray-400'}`}>
                  {statusLabels[selected.status] || selected.status}
                </span>
              </div>
              <div className="pt-3 border-t border-white/5">
                <label className="text-gray-400 text-xs block mb-1">Изменить статус:</label>
                <div className="flex gap-2">
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="flex-1 bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                    {statuses.filter((s) => s !== 'all').map((s) => <option key={s} value={s}>{statusLabels[s] || s}</option>)}
                  </select>
                  <button onClick={handleStatusUpdate} disabled={updating || newStatus === selected.status} className="btn-primary text-sm">{updating ? '...' : 'Обновить'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
