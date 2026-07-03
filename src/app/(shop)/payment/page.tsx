'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import { apiFetch } from '@/lib/api'

export default function PaymentPage() {
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/payments').then((data: any) => {
      setMethods(data.methods || data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Выбор способа оплаты</h1>
        <BackButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {methods.map((method) => (
          <Link key={method.code} href={`/payment/${method.code}`}>
            <GlassCard className="flex items-center gap-4 hover-lift">
              <span className="text-3xl">{method.icon || '💳'}</span>
              <div>
                <h3 className="font-bold text-white">{method.name}</h3>
                <p className="text-sm text-gray-400">{method.desc || ''}</p>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
