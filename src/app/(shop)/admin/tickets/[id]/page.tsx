'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Send, XCircle, UserCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Message {
  id: string
  text: string
  isAdmin: boolean
  createdAt: string
  user: { tgUsername: string | null; firstName: string | null }
}

interface Ticket {
  id: string
  subject: string
  status: string
  createdAt: string
  user: { tgId: string; tgUsername: string | null; firstName: string | null }
  messages: Message[]
}

export default function AdminTicketChatPage() {
  const params = useParams()
  const id = params.id as string
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const load = () => {
    fetch(`/api/admin/tickets/${id}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setTicket(res.data)
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    const res = await fetch(`/api/tickets/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      setText('')
      load()
    } else toast.error(data.error || 'Ошибка')
    setSending(false)
  }

  const handleTake = async () => {
    const res = await fetch(`/api/admin/tickets/${id}/take`, { method: 'POST' })
    const data = await res.json()
    if (data.success) { toast.success('Тикет взят в работу'); load() }
    else toast.error(data.error || 'Ошибка')
  }

  const handleClose = async () => {
    const res = await fetch(`/api/tickets/${id}/close`, { method: 'POST' })
    const data = await res.json()
    if (data.success) { toast.success('Тикет закрыт'); load() }
    else toast.error(data.error || 'Ошибка')
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>
  if (!ticket) return <p className="text-center text-gray-400 py-20">Тикет не найден</p>

  const statusLabels: Record<string, string> = { OPEN: 'Открыт', IN_PROGRESS: 'В работе', CLOSED: 'Закрыт' }
  const statusColors: Record<string, string> = { OPEN: 'text-yellow-400', IN_PROGRESS: 'text-blue-400', CLOSED: 'text-gray-400' }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/admin/tickets" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">{ticket.subject}</h2>
          <p className="text-xs text-gray-400">
            {ticket.user?.tgUsername || ticket.user?.firstName || '—'} ·{' '}
            <span className={statusColors[ticket.status]}>{statusLabels[ticket.status] || ticket.status}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {ticket.status === 'OPEN' && (
            <button onClick={handleTake} className="btn-primary text-sm flex items-center gap-1">
              <UserCheck className="w-4 h-4" /> Взять
            </button>
          )}
          {ticket.status !== 'CLOSED' && (
            <button onClick={handleClose} className="btn-danger text-sm flex items-center gap-1">
              <XCircle className="w-4 h-4" /> Закрыть
            </button>
          )}
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {ticket.messages.map((msg) => {
            const isAdmin = msg.isAdmin
            return (
              <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${isAdmin ? 'bg-purple-600/20 border border-purple-500/20' : 'bg-dark-200 border border-white/5'}`}>
                  <p className="text-xs text-gray-500 mb-1">
                    {isAdmin ? 'Администратор' : msg.user?.firstName || msg.user?.tgUsername || 'Пользователь'}
                  </p>
                  <p className="text-sm text-white whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-1 text-right">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </GlassCard>

      {ticket.status !== 'CLOSED' && (
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Введите сообщение..."
            rows={2}
            className="flex-1 bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none"
          />
          <button onClick={handleSend} disabled={sending || !text.trim()} className="btn-primary flex items-center gap-1">
            <Send className="w-4 h-4" /> {sending ? '...' : 'Отправить'}
          </button>
        </div>
      )}
    </div>
  )
}
