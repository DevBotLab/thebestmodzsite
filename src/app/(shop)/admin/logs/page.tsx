'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface LogEntry {
  id: string
  userId: string
  action: string
  ip: string | null
  details: any
  createdAt: string
  user: { tgUsername: string | null; firstName: string | null } | null
}

const actionOptions = [
  'all', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE',
  'CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DELETE',
  'ORDER_STATUS_UPDATE',
  'USER_UPDATE', 'USER_BLOCK', 'USER_UNBLOCK',
  'TICKET_TAKE',
  'CHEATS_BATCH_UPDATE', 'CHEAT_UPDATE',
  'NEWS_CREATE', 'NEWS_UPDATE', 'NEWS_DELETE',
  'BANNER_CREATE', 'BANNER_UPDATE', 'BANNER_DELETE',
  'PAYMENT_METHOD_UPDATE',
  'REFERRAL_SETTINGS_UPDATE',
  'SETTINGS_UPDATE',
  'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE',
  'PAGE_UPDATE',
  'TARIFF_CREATE', 'TARIFF_UPDATE', 'TARIFF_DELETE',
  'KEYS_UPLOAD',
]

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterAction, setFilterAction] = useState('all')
  const [filterUser, setFilterUser] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '30' })
    if (filterAction !== 'all') params.set('action', filterAction)
    if (filterUser) params.set('userId', filterUser)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)

    fetch(`/api/admin/logs?${params}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) { setLogs(res.data.items); setTotalPages(res.data.totalPages) }
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, filterAction])

  const handleSearch = () => { setPage(1); load() }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1) }} className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white max-w-[200px]">
          {actionOptions.map((a) => <option key={a} value={a}>{a === 'all' ? 'Все действия' : a}</option>)}
        </select>
        <input value={filterUser} onChange={(e) => setFilterUser(e.target.value)} placeholder="ID пользователя" className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-40" />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <button onClick={handleSearch} className="btn-primary text-sm flex items-center gap-1"><Search className="w-4 h-4" /> Поиск</button>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="text-left py-3 px-4">Дата</th>
              <th className="text-left py-3 px-4">Пользователь</th>
              <th className="text-left py-3 px-4">Действие</th>
              <th className="text-left py-3 px-4">IP</th>
              <th className="text-left py-3 px-4">Детали</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/5 hover:bg-dark-200">
                <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="py-3 px-4 text-white text-xs">{log.user?.tgUsername || log.user?.firstName || log.userId.slice(0, 8) || '—'}</td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">{log.action}</span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs font-mono">{log.ip || '—'}</td>
                <td className="py-3 px-4 text-gray-400 text-xs max-w-[300px] truncate">
                  {log.details ? JSON.stringify(log.details).slice(0, 100) : '—'}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500">Нет записей</td></tr>
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
    </div>
  )
}
