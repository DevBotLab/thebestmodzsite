'use client'

import Link from 'next/link'
import { Skull, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-4">
      <Skull className="w-24 h-24 text-purple-500 mb-6 animate-pulse" />
      <h1 className="font-heading text-8xl text-white mb-4" style={{ fontSize: '6rem' }}>404</h1>
      <p className="text-2xl text-gray-300 font-heading text-center mb-2">🔫 Миссия провалена</p>
      <p className="text-gray-500 mb-8 text-center">Страница не найдена или была уничтожена</p>
      <Link href="/" className="btn-primary flex items-center gap-2">
        <Home className="w-5 h-5" />
        Вернуться на главную
      </Link>
    </div>
  )
}
