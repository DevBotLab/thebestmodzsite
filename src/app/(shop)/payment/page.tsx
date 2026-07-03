'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'

const paymentMethods = [
  { code: 'sbp', name: 'СБП', icon: '🏦', desc: 'Система быстрых платежей' },
  { code: 'card-rf', name: 'Карта РФ', icon: '💳', desc: 'Карты российских банков' },
  { code: 'card-ua', name: 'Карта УКР', icon: '💳', desc: 'Карты украинских банков' },
  { code: 'mastercard', name: 'MasterCard', icon: '💳', desc: 'Международные карты' },
  { code: 'cryptobot', name: 'CryptoBot', icon: '₿', desc: 'Криптовалюты через Telegram' },
  { code: 'paypal', name: 'PayPal', icon: '🅿️', desc: 'Международная платёжная система' },
  { code: 'stars', name: 'Звёзды', icon: '⭐', desc: 'Telegram Stars' },
]

export default function PaymentPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Выбор способа оплаты</h1>
        <BackButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <Link key={method.code} href={`/payment/${method.code}`}>
            <GlassCard className="flex items-center gap-4">
              <span className="text-3xl">{method.icon}</span>
              <div>
                <h3 className="font-bold text-white">{method.name}</h3>
                <p className="text-sm text-gray-400">{method.desc}</p>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
