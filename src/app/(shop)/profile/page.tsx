'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Wallet, History, Repeat, Gift, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { AuthModal } from '@/components/ui/AuthModal'

const mockUser = {
  firstName: 'Игрок',
  tgId: '123456789',
  balance: 2500,
}

export default function ProfilePage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <User className="w-16 h-16 text-purple-400 mb-4" />
        <h1 className="text-2xl font-heading text-white mb-2">Профиль</h1>
        <p className="text-gray-400 mb-6">Войдите, чтобы увидеть профиль</p>
        <button onClick={() => setAuthOpen(true)} className="btn-primary">
          Войти через Telegram
        </button>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    )
  }

  const menuItems = [
    { href: '/profile/history', icon: History, label: 'История покупок', desc: 'Просмотр всех заказов' },
    { href: '/payment', icon: Wallet, label: 'Пополнить баланс', desc: 'Выбор способа оплаты' },
    { href: '/profile/transfer', icon: Repeat, label: 'Перекинуть баланс', desc: 'Перевод другому пользователю' },
    { href: '/profile/referrals', icon: Gift, label: 'Реферальная система', desc: 'Зарабатывай с друзьями' },
  ]

  return (
    <div>
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{mockUser.firstName}</h1>
            <p className="text-sm text-gray-400">TG ID: {mockUser.tgId}</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-dark-300 rounded-xl">
          <span className="text-gray-400">Баланс</span>
          <span className="text-2xl font-heading text-lime-400">{mockUser.balance} ₽</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <GlassCard className="flex items-center gap-4">
                <Icon className="w-8 h-8 text-purple-400" />
                <div className="flex-1">
                  <h3 className="font-bold text-white">{item.label}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500" />
              </GlassCard>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
