'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { MessageSquare } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Ticket {
  id: string
  subject: string
  status: string
  createdAt: string
  updatedAt: string
  user: { tgId: string; tgUsername: string | null; firstName: string | null }
  _count: { messages: number }
}

const statusColors: Record<string, string> = {
  OPEN: 'text-yellow-400 bg-yellow-400/10',
  IN_PROGRESS: 'text-blue-400 bg-blue-400/10',
  CLOSED: 'text-gray-400 bg-gray-400/10',
}

const statusLabels: Record<string, string> = {
  OPEN: 'Открыт',
  IN_PROGRESS: 'В работе',
  CLOSED: 'Закрыт',
}

export default function AdminTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState('all')

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (filterStatus !== 'all') params.set('status', filterStatus)

    fetch(`/api/admin/tickets?${params}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) { setTickets(res.data.items); setTotalPages(res.data.totalPages) }
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, filterStatus])

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }} className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="all">Все статусы</option>
          <option value="OPEN">Открыт</option>
          <option value="IN_PROGRESS">В работе</option>
          <option value="CLOSED">Закрыт</option>
        </select>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Пользователь</th>
              <th className="text-left py-3 px-4">Тема</th>
              <th className="text-left py-3 px-4">Статус</th>
              <th className="text-center py-3 px-4">Сообщений</th>
              <th className="text-left py-3 px-4">Дата</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-white/5 hover:bg-dark-200 cursor-pointer"
                onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
              >
                <td className="py-3 px-4 text-purple-400 font-mono text-xs">#{ticket.id.slice(0, 8)}</td>
                <td className="py-3 px-4 text-white">{ticket.user?.tgUsername || ticket.user?.firstName || '—'}</td>
                <td className="py-3 px-4 text-gray-300">{ticket.subject}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
                    {statusLabels[ticket.status] || ticket.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="flex items-center justify-center gap-1 text-gray-400">
                    <MessageSquare className="w-3 h-3" /> {ticket._count.messages}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">{new Date(ticket.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-gray-500">Нет тикетов</td></tr>
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
