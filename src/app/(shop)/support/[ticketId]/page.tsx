'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Send, XCircle } from 'lucide-react'
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

const mockMessages: Message[] = [
  { id: '1', text: 'Здравствуйте! У меня проблема с ключом Jarvis, он не активируется.', isAdmin: false, createdAt: '01.07.2026 14:30' },
  { id: '2', text: 'Здравствуйте! Какая ошибка появляется при активации?', isAdmin: true, createdAt: '01.07.2026 14:35' },
  { id: '3', text: 'Пишет "Invalid key format"', isAdmin: false, createdAt: '01.07.2026 14:40' },
  { id: '4', text: 'Попробуйте скопировать ключ без лишних пробелов. Если не поможет, вышлем новый ключ.', isAdmin: true, createdAt: '01.07.2026 14:45' },
]

export default function TicketChatPage() {
  const params = useParams()
  const ticketId = params.ticketId as string
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [input, setInput] = useState('')
  const [isClosed, setIsClosed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: String(Date.now()),
      text: input,
      isAdmin: false,
      createdAt: new Date().toLocaleString('ru-RU'),
    }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
  }

  const closeTicket = () => {
    setIsClosed(true)
    toast.success('Тикет закрыт')
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
          {messages.map((msg) => (
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
          ))}
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
            <button onClick={sendMessage} className="btn-primary px-4">
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
