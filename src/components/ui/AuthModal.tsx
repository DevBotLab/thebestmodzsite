'use client'
import { X, LogIn, Loader2, ExternalLink, Copy, Check, Send, Bot } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { executeRecaptcha } from '@/lib/useRecaptcha'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

const api = (path: string, options?: RequestInit) =>
  fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options })

function openTelegram(botUsername: string, text: string) {
  const webUrl = `https://t.me/${botUsername}?start=auth${text}`
  const appUrl = `tg://resolve?domain=${botUsername}&start=auth${text}`
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (isMobile) {
    window.location.href = appUrl
    setTimeout(() => window.open(webUrl, '_blank'), 500)
  } else {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = appUrl
    document.body.appendChild(iframe)
    setTimeout(() => {
      document.body.removeChild(iframe)
      window.open(webUrl, '_blank', 'noopener')
    }, 800)
  }
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<'login' | 'code' | 'complete'>('login')
  const [code, setCode] = useState('')
  const [botUsername, setBotUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [copied, setCopied] = useState(false)

  const reset = useCallback(() => {
    setStep('login')
    setCode('')
    setBotUsername('')
    setLoading(false)
    setPolling(false)
    setCopied(false)
  }, [])

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  const handleLogin = async () => {
    setLoading(true)
    try {
      const captchaToken = await executeRecaptcha('auth_login')
      const res = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ captchaToken }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка')
      setCode(data.data.code)
      setBotUsername(data.data.botUsername)
      setStep('code')
      setPolling(true)
    } catch {
      toast.error('Ошибка при создании запроса')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = useCallback(async () => {
    const command = `/auth${code}`
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      toast.success('Команда скопирована!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Не удалось скопировать')
    }
  }, [code])

  useEffect(() => {
    if (!polling || !code) return
    const interval = setInterval(async () => {
      try {
        const res = await api('/api/auth/check-code', { method: 'POST', body: JSON.stringify({ code }) })
        const data = await res.json()
        if (data.status !== 'pending') {
          clearInterval(interval)
          setPolling(false)
          setStep('complete')
          const captchaToken2 = await executeRecaptcha('auth_complete')
          const body: Record<string, unknown> = { code }
          if (captchaToken2) body.captchaToken = captchaToken2
          const completeRes = await api('/api/auth', { method: 'POST', body: JSON.stringify(body) })
          if (!completeRes.ok) {
            const errData = await completeRes.json()
            toast.error(errData.error || 'Ошибка авторизации')
            reset()
            return
          }
          toast.success('Успешный вход!')
          window.location.reload()
        }
      } catch {
        // keep polling
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [polling, code, reset])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="glass-card p-8 w-full max-w-md mx-4 relative">
        <button onClick={() => { reset(); onClose() }} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <LogIn className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h2 className="text-2xl font-heading text-white">Вход в аккаунт</h2>
          {step === 'login' && <p className="text-gray-400 mt-2">Авторизуйтесь через Telegram</p>}
          {step === 'code' && <p className="text-gray-400 mt-2">Отправьте команду боту в Telegram</p>}
        </div>

        {step === 'login' && (
          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            Войти через Telegram
          </button>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Команда для бота</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-lime-400 break-all select-all">
                  /auth{code}
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-lime-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => openTelegram(botUsername, code)}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              <Send className="w-4 h-4" />
              Открыть Telegram
            </button>

            <p className="text-xs text-zinc-500 text-center">
              Если не открывается, найдите бота в поиске: <span className="text-purple-400">@{botUsername}</span>
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Ожидание авторизации...
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
            <p className="text-gray-400 mt-2">Завершение авторизации...</p>
          </div>
        )}
      </div>
    </div>
  )
}
