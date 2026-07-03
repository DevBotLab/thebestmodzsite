'use client'

import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  )
}
