'use client'
import { X, LogIn, Loader2, ExternalLink } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { executeRecaptcha } from '@/lib/useRecaptcha'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

const api = (path: string, options?: RequestInit) =>
  fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options })

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<'login' | 'code' | 'complete'>('login')
  const [code, setCode] = useState('')
  const [authLink, setAuthLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)

  const reset = useCallback(() => {
    setStep('login')
    setCode('')
    setAuthLink('')
    setLoading(false)
    setPolling(false)
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
      setCode(data.code)
      setAuthLink(data.authLink)
      setStep('code')
      setPolling(true)
    } catch {
      toast.error('Ошибка при создании запроса')
    } finally {
      setLoading(false)
    }
  }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-8 w-full max-w-md mx-4 relative">
        <button onClick={() => { reset(); onClose() }} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <LogIn className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h2 className="text-2xl font-heading text-white">Вход в аккаунт</h2>
          {step === 'login' && <p className="text-gray-400 mt-2">Авторизуйтесь через Telegram</p>}
          {step === 'code' && <p className="text-gray-400 mt-2">Нажмите кнопку ниже, чтобы открыть Telegram бота</p>}
        </div>

        {step === 'login' && (
          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            Войти через Telegram
          </button>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            <a
              href={authLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Открыть Telegram
            </a>
            <p className="text-sm text-gray-400 text-center">
              Отправьте боту команду <code className="text-purple-400 bg-white/5 px-2 py-0.5 rounded">/auth{code}</code>
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
