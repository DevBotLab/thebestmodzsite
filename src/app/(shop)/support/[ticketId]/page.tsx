'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Send, XCircle, Loader2 } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import toast from 'react-hot-toast'

interface Message {
  id: string
  text: string
  isAdmin: boolean
  createdAt: string
}

export default function TicketChatPage() {
  const params = useParams()
  const ticketId = params.ticketId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/tickets/${ticketId}/messages`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMessages(d.data)
        else toast.error(d.error || 'Ошибка загрузки')
      })
      .catch(() => toast.error('Ошибка соединения'))
      .finally(() => setLoading(false))
  }, [ticketId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      })
      const d = await res.json()
      if (d.success) {
        setMessages((prev) => [...prev, d.data])
        setInput('')
      } else {
        toast.error(d.error || 'Ошибка отправки')
      }
    } catch {
      toast.error('Ошибка отправки')
    } finally {
      setSending(false)
    }
  }

  const closeTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/close`, { method: 'POST' })
      const d = await res.json()
      if (d.success) {
        setIsClosed(true)
        toast.success('Тикет закрыт')
      } else {
        toast.error(d.error || 'Ошибка')
      }
    } catch {
      toast.error('Ошибка')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div>
      <BreadCrumbs items={[{ label: 'Поддержка', href: '/support' }, { label: `Тикет #${ticketId}` }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading text-white">Тикет #{ticketId}</h1>
        <div className="flex items-center gap-3">
          {!isClosed && (
            <button onClick={closeTicket} className="btn-ghost flex items-center gap-2 text-red-400">
              <XCircle className="w-4 h-4" />
              Закрыть тикет
            </button>
          )}
          <BackButton />
        </div>
      </div>

      <GlassCard className="h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Сообщений пока нет</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.isAdmin
                      ? 'bg-dark-300 text-white rounded-tl-sm'
                      : 'bg-purple-600 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{msg.createdAt}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {!isClosed && (
          <div className="flex gap-2 p-4 border-t border-white/10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Введите сообщение..."
              className="flex-1 bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button onClick={sendMessage} disabled={sending} className="btn-primary px-4 disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  )
}