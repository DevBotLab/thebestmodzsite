'use client'

import { LogIn, User, ShoppingBag, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AuthModal } from '../ui/AuthModal'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [authOpen, setAuthOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-dark/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-purple-500/5'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onMenuToggle && (
              <button onClick={onMenuToggle} className="text-gray-400 hover:text-white lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-lime-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-gradient-simple font-bold text-lg tracking-tight">TheBestMods</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/catalog" className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200">
              Каталог
            </Link>
            <Link href="/news" className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200">
              Новости
            </Link>
            <Link href="/reviews" className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200">
              Отзывы
            </Link>
            <Link href="/support" className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200">
              Поддержка
            </Link>
            <Link href="/prices" className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all duration-200">
              Цены
            </Link>
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
