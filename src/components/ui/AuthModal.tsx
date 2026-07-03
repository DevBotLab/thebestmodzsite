'use client'

import { X, LogIn } from 'lucide-react'
import { useState } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tgId, setTgId] = useState('')

  if (!isOpen) return null

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/telegram`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-8 w-full max-w-md mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <LogIn className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h2 className="text-2xl font-heading text-white">Вход в аккаунт</h2>
          <p className="text-gray-400 mt-2">Авторизуйтесь через Telegram</p>
        </div>
        <button onClick={handleLogin} className="btn-primary w-full flex items-center justify-center gap-2">
          <LogIn className="w-5 h-5" />
          Войти через Telegram
        </button>
      </div>
    </div>
  )
}
