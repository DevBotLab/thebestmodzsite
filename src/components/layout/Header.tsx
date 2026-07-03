'use client'

import { Menu, LogIn, User, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AuthModal } from '../ui/AuthModal'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onMenuToggle && (
              <button onClick={onMenuToggle} className="text-gray-400 hover:text-white lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-lime-400" />
              <span className="font-heading text-sm text-white hidden sm:block">TheBestMods</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/catalog" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Каталог</Link>
            <Link href="/reviews" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Отзывы</Link>
            <Link href="/news" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Новости</Link>
            <Link href="/support" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Поддержка</Link>
            <Link href="/cheats" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Статус читов</Link>
          </nav>
          <button
            onClick={() => setAuthOpen(true)}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:block">Войти</span>
            <LogIn className="w-4 h-4" />
          </button>
        </div>
      </header>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
