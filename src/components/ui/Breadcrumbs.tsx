'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels: Record<string, string> = {
  catalog: 'Каталог',
  news: 'Новости',
  profile: 'Профиль',
  support: 'Поддержка',
  reviews: 'Отзывы',
  status: 'Статус',
  cart: 'Корзина',
  favorites: 'Избранное',
  orders: 'Заказы',
  settings: 'Настройки',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    return { href, label, isLast: index === segments.length - 1 }
  })

  if (segments.length === 0) return null

  return (
    <nav className="flex items-center gap-1.5 text-xs min-w-0 overflow-x-auto">
      <Link
        href="/"
        className="flex items-center gap-1 text-zinc-500 hover:text-purple-400 transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1.5 shrink-0">
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          {crumb.isLast ? (
            <span className="text-purple-400 font-medium truncate max-w-[120px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-zinc-500 hover:text-zinc-300 transition-colors truncate max-w-[120px]"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
