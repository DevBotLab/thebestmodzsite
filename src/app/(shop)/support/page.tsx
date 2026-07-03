'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Plus, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import toast from 'react-hot-toast'

interface Ticket {
  id: string
  subject: string
  status: 'open' | 'in_progress' | 'closed'
  createdAt: string
  lastMessage: string
}

const mockTickets: Ticket[] = [
  { id: '1', subject: 'Проблема с ключом Jarvis', status: 'open', createdAt: '01.07.2026', lastMessage: '3 часа назад' },
  { id: '2', subject: 'Вопрос по оплате', status: 'in_progress', createdAt: '28.06.2026', lastMessage: '1 день назад' },
  { id: '3', subject: 'Смена тарифа', status: 'closed', createdAt: '20.06.2026', lastMessage: '10 дней назад' },
]

const statusIcons = {
  open: Circle,
  in_progress: Clock,
  closed: CheckCircle2,
}

const statusColors: Record<string, string> = {
  open: 'text-lime-400',
  in_progress: 'text-yellow-400',
  closed: 'text-gray-500',
}

const statusLabels: Record<string, string> = {
  open: 'Открыт',
  in_progress: 'В работе',
  closed: 'Закрыт',
}

export default function SupportPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const createTicket = () => {
    if (!subject || !message) {
      toast.error('Заполните все поля')
      return
    }
    toast.success('Тикет создан!')
    setShowCreate(false)
    setSubject('')
    setMessage('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Поддержка</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Создать тикет
          </button>
          <BackButton />
        </div>
      </div>

      <div className="space-y-3">
        {mockTickets.map((ticket) => {
          const StatusIcon = statusIcons[ticket.status]
          return (
            <Link key={ticket.id} href={`/support/${ticket.id}`}>
              <GlassCard>
                <div className="flex items-start gap-3">
                  <StatusIcon className={`w-5 h-5 mt-1 ${statusColors[ticket.status]}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{ticket.subject}</h3>
                    <p className="text-sm text-gray-400">Создан: {ticket.createdAt}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[ticket.status]} bg-white/5`}>
                        {statusLabels[ticket.status]}
                      </span>
                      <span className="text-xs text-gray-500">{ticket.lastMessage}</span>
                    </div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                </div>
              </GlassCard>
            </Link>
          )
        })}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Создать тикет</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Тема обращения"
                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите проблему"
                rows={4}
                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1">Отмена</button>
                <button onClick={createTicket} className="btn-primary flex-1">Отправить</button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
