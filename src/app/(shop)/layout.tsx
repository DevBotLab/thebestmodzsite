'use client'

import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  )
}
