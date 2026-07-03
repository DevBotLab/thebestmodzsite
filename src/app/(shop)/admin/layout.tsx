'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Ticket,
  Shield, Newspaper, Image, CreditCard, Link2, Settings, ShieldCheck,
  ScrollText, FileText, Menu, X
} from 'lucide-react'
import { BackButton } from '@/components/layout/BackButton'

const menuItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Товары', icon: Package },
  { href: '/admin/categories', label: 'Категории', icon: FolderTree },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/tickets', label: 'Тикеты', icon: Ticket },
  { href: '/admin/cheats', label: 'Статусы читов', icon: Shield },
  { href: '/admin/news', label: 'Новости', icon: Newspaper },
  { href: '/admin/banners', label: 'Баннеры', icon: Image },
  { href: '/admin/payments', label: 'Платежи', icon: CreditCard },
  { href: '/admin/referrals', label: 'Рефералы', icon: Link2 },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
  { href: '/admin/roles', label: 'Роли', icon: ShieldCheck },
  { href: '/admin/logs', label: 'Логи', icon: ScrollText },
  { href: '/admin/pages', label: 'Страницы', icon: FileText },
]

const sectionNames: Record<string, string> = {
  '': 'Дашборд',
  products: 'Товары',
  categories: 'Категории',
  orders: 'Заказы',
  users: 'Пользователи',
  tickets: 'Тикеты',
  cheats: 'Статусы читов',
  news: 'Новости',
  banners: 'Баннеры',
  payments: 'Платежи',
  referrals: 'Рефералы',
  settings: 'Настройки',
  roles: 'Роли',
  logs: 'Логи',
  pages: 'Страницы',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const segments = pathname.split('/').filter(Boolean)
  const sectionKey = segments[segments.length - 1] === 'admin' ? '' : segments[segments.length - 1]
  const sectionName = sectionNames[sectionKey] || 'Админ-панель'

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-dark">
      <div className="flex">
        <aside className={
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex-shrink-0
          bg-dark-100 border-r border-white/5 overflow-y-auto
          transition-transform duration-300
          
        }>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <Link href="/admin" className="text-lg font-heading text-lime-400">Admin</Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={lex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 bg-dark/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-4 px-4 py-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
                <Menu className="w-5 h-5" />
              </button>
              <BackButton />
              <h1 className="text-lg font-bold text-white">{sectionName}</h1>
            </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
