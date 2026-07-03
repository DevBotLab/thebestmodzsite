'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Search, X, Shield, ShieldOff, DollarSign } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface User {
  id: string
  tgId: string
  tgUsername: string | null
  firstName: string | null
  lastName: string | null
  balance: number
  referralCode: string | null
  referralPercent: number
  isBlocked: boolean
  blockReason: string | null
  isAdmin: boolean
  createdAt: string
  _count: { orders: number; supportTickets: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [balanceAmount, setBalanceAmount] = useState(0)
  const [blockReason, setBlockReason] = useState('')
  const [showBlock, setShowBlock] = useState(false)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)

    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) { setUsers(res.data.items); setTotalPages(res.data.totalPages) }
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleSearch = () => { setPage(1); load() }

  const openUser = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`).then(r => r.json())
    if (res.success) { setSelected(res.data); setBalanceAmount(0); setBlockReason(''); setShowBlock(false) }
    else toast.error(res.error || 'Ошибка')
  }

  const handleBalance = async () => {
    if (!balanceAmount || !selected) return
    const res = await fetch(`/api/admin/users/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: balanceAmount }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Баланс обновлён')
      setSelected((prev: any) => ({ ...prev, balance: data.data.balance }))
    } else toast.error(data.error || 'Ошибка')
  }

  const handleBlock = async () => {
    if (!selected || !blockReason) { toast.error('Укажите причину'); return }
    const res = await fetch(`/api/admin/users/${selected.id}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: blockReason }),
    })
    const data = await res.json()
    if (data.success) { toast.success('Пользователь заблокирован'); setSelected((prev: any) => ({ ...prev, isBlocked: true, blockReason })); setShowBlock(false); load() }
    else toast.error(data.error || 'Ошибка')
  }

  const handleUnblock = async () => {
    if (!selected) return
    const res = await fetch(`/api/admin/users/${selected.id}/unblock`, { method: 'POST' })
    const data = await res.json()
    if (data.success) { toast.success('Пользователь разблокирован'); setSelected((prev: any) => ({ ...prev, isBlocked: false, blockReason: null })); load() }
    else toast.error(data.error || 'Ошибка')
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Имя, username, TG ID..." className="bg-dark-200 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white w-64" />
        </div>
        <button onClick={handleSearch} className="btn-primary text-sm">Поиск</button>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="text-left py-3 px-4">TG ID</th>
              <th className="text-left py-3 px-4">Username</th>
              <th className="text-left py-3 px-4">Имя</th>
              <th className="text-right py-3 px-4">Баланс</th>
              <th className="text-right py-3 px-4">Заказы</th>
              <th className="text-right py-3 px-4">Рефералы</th>
              <th className="text-left py-3 px-4">Дата</th>
              <th className="text-left py-3 px-4">Статус</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-dark-200 cursor-pointer" onClick={() => openUser(user.id)}>
                <td className="py-3 px-4 text-gray-300 font-mono text-xs">{user.tgId || '—'}</td>
                <td className="py-3 px-4 text-white">{user.tgUsername ? `@${user.tgUsername}` : '—'}</td>
                <td className="py-3 px-4 text-gray-300">{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '—'}</td>
                <td className="py-3 px-4 text-right text-lime-400">{user.balance.toLocaleString()} ₽</td>
                <td className="py-3 px-4 text-right text-gray-300">{user._count.orders}</td>
                <td className="py-3 px-4 text-right text-gray-300">{user.referralCode || '—'}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  {user.isBlocked ? (
                    <span className="text-red-400 text-xs font-medium bg-red-400/10 px-2 py-0.5 rounded-full">Заблокирован</span>
                  ) : (
                    <span className="text-lime-400 text-xs font-medium bg-lime-400/10 px-2 py-0.5 rounded-full">Активен</span>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-gray-500">Нет пользователей</td></tr>
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
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Пользователь</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-400">TG ID:</span><p className="text-white font-mono text-xs">{selected.tgId || '—'}</p></div>
                <div><span className="text-gray-400">Username:</span><p className="text-white">{selected.tgUsername ? `@${selected.tgUsername}` : '—'}</p></div>
                <div><span className="text-gray-400">Имя:</span><p className="text-white">{selected.firstName || '—'}</p></div>
                <div><span className="text-gray-400">Баланс:</span><p className="text-lime-400">{Number(selected.balance).toLocaleString()} ₽</p></div>
                <div><span className="text-gray-400">Заказов:</span><p className="text-white">{selected._count?.orders || 0}</p></div>
                <div><span className="text-gray-400">Тикетов:</span><p className="text-white">{selected._count?.supportTickets || 0}</p></div>
                <div><span className="text-gray-400">Рефералов:</span><p className="text-white">{selected._count?.referralsMade || 0}</p></div>
                <div><span className="text-gray-400">Реф. процент:</span><p className="text-white">{selected.referralPercent}%</p></div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <label className="text-gray-400 text-xs block mb-1">Изменить баланс:</label>
                <div className="flex gap-2">
                  <input type="number" value={balanceAmount} onChange={(e) => setBalanceAmount(+e.target.value)} placeholder="Новый баланс" className="flex-1 bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                  <button onClick={handleBalance} className="btn-primary text-sm flex items-center gap-1"><DollarSign className="w-4 h-4" /> Установить</button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                {selected.isBlocked ? (
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 text-sm">Заблокирован: {selected.blockReason}</span>
                    <button onClick={handleUnblock} className="btn-primary text-sm flex items-center gap-1"><ShieldOff className="w-4 h-4" /> Разблокировать</button>
                  </div>
                ) : (
                  <div>
                    {showBlock ? (
                      <div className="space-y-2">
                        <textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Причина блокировки" rows={2} className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                        <div className="flex gap-2">
                          <button onClick={handleBlock} className="btn-danger text-sm">Заблокировать</button>
                          <button onClick={() => setShowBlock(false)} className="px-3 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowBlock(true)} className="btn-danger text-sm flex items-center gap-1"><Shield className="w-4 h-4" /> Заблокировать</button>
                    )}
                  </div>
                )}
              </div>

              {selected.recentOrders?.length > 0 && (
                <div className="border-t border-white/5 pt-3">
                  <p className="text-gray-400 text-xs mb-2">Последние заказы:</p>
                  {selected.recentOrders.map((o: any) => (
                    <div key={o.id} className="flex justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-white">{o.product?.name || '—'}</span>
                      <span className="text-lime-400">{Number(o.totalPrice).toLocaleString()} ₽</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
