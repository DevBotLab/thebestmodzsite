'use client'

import { ShoppingCart, Star, MessageCircle, User, Shield, Newspaper } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/catalog', label: 'Купить ключ', icon: ShoppingCart },
  { href: '/reviews', label: 'Отзывы', icon: Star },
  { href: '/support', label: 'Поддержка', icon: MessageCircle },
  { href: '/profile', label: 'Профиль', icon: User },
  { href: '/cheats', label: 'Статус читов', icon: Shield },
  { href: '/news', label: 'Новости', icon: Newspaper },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors min-w-0 ${
                isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight text-center truncate w-full">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
