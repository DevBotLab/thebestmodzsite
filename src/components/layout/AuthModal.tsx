'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Copy, Check, Bot, Terminal } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/useAuthStore'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const BOT_USERNAME = 'thebestmods_bot'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authCode, setAuthCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const { login } = useAuthStore()

  useEffect(() => {
    if (isOpen) {
      setAuthCode(generateCode())
      setCopied(false)
      setIsChecking(false)
    }
  }, [isOpen])

  const handleCopy = useCallback(async () => {
    const command = `/auth ${authCode}`
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      toast.success('Код скопирован!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Не удалось скопировать')
    }
  }, [authCode])

  const handleCheck = useCallback(async () => {
    setIsChecking(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode }),
      })
      const data = await res.json()
      if (data.success) {
        login(data.user)
        toast.success('Успешная авторизация!')
        onClose()
      } else {
        toast.error('Код ещё не подтверждён. Отправьте команду в бота.')
      }
    } catch {
      toast.error('Ошибка проверки. Попробуйте ещё раз.')
    } finally {
      setIsChecking(false)
    }
  }, [authCode, login, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="glass-card-accent w-full max-w-md p-6 animate-slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-500/10">
            <Bot className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="font-heading text-sm text-purple-400">
              Авторизация
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Для входа используйте Telegram бота
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">
              Бот
            </label>
            <a
              href={`https://t.me/${BOT_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-purple-400 hover:text-purple-300 hover:border-purple-500/30 transition-all text-sm"
            >
              <Bot className="w-4 h-4" />
              @{BOT_USERNAME}
            </a>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">
              Команда для авторизации
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-lime-400">
                <Terminal className="w-4 h-4 text-zinc-500" />
                /auth {authCode}
              </div>
              <button
                onClick={handleCopy}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-lime-400" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-500 text-center">
            Отправьте эту команду в бота Telegram, затем нажмите &laquo;Я подтвердил&raquo;
          </p>

          <button
            onClick={handleCheck}
            disabled={isChecking}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Проверка...
              </>
            ) : (
              'Я подтвердил'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
