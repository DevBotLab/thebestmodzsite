'use client'
import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        На главную
      </Link>
      {children}
    </div>
  )
}
