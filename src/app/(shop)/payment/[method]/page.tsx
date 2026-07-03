'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { CheckCircle, Copy } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import toast from 'react-hot-toast'

const methodNames: Record<string, string> = {
  sbp: 'СБП',
  'card-rf': 'Карта РФ',
  'card-ua': 'Карта УКР',
  mastercard: 'MasterCard',
  cryptobot: 'CryptoBot',
  paypal: 'PayPal',
  stars: 'Звёзды',
}

const methodDetails: Record<string, { details: string; instruction: string[] }> = {
  sbp: {
    details: 'Номер телефона: +7 (999) 123-45-67',
    instruction: [
      'Откройте приложение банка',
      'Выберите "Оплата по СБП"',
      'Введите номер телефона',
      'Укажите сумму и отправьте',
      'Нажмите "Я оплатил" ниже',
    ],
  },
  'card-rf': {
    details: 'Номер карты: 2200 1234 5678 9012',
    instruction: [
      'Переведите сумму на указанную карту',
      'В комментарии укажите ваш Telegram ID',
      'Нажмите "Я оплатил" ниже',
      'Ожидайте подтверждения',
    ],
  },
  cryptobot: {
    details: 'CryptoBot ID: @TheBestModsBot',
    instruction: [
      'Откройте @CryptoBot в Telegram',
      'Отправьте сумму на @TheBestModsBot',
      'Выберите валюту (USDT/BTC/ETH)',
      'После оплаты нажмите "Я оплатил"',
    ],
  },
}

export default function PaymentMethodPage() {
  const params = useParams()
  const router = useRouter()
  const method = params.method as string
  const name = methodNames[method] || method
  const details = methodDetails[method]
  const [paid, setPaid] = useState(false)

  if (!details) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Способ оплаты не найден</h2>
        <div className="mt-4"><BackButton /></div>
      </div>
    )
  }

  const handlePaid = () => {
    setPaid(true)
    toast.success('Заявка отправлена! Проверка до 5 минут.')
    setTimeout(() => router.push('/profile/history'), 2000)
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Скопировано!')
  }

  if (paid) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <CheckCircle className="w-20 h-20 text-lime-400 mb-4" />
        <h2 className="text-2xl font-heading text-white mb-2">Заявка отправлена!</h2>
        <p className="text-gray-400">Мы проверим платёж в течение 5 минут</p>
      </div>
    )
  }

  return (
    <div>
      <BreadCrumbs items={[{ label: 'Оплата', href: '/payment' }, { label: name }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">{name}</h1>
        <BackButton />
      </div>

      <GlassCard className="max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Реквизиты</h3>
            <div className="flex items-center gap-2 bg-dark-300 rounded-xl px-4 py-3">
              <span className="text-white flex-1 break-all">{details.details}</span>
              <button onClick={() => copyText(details.details)} className="text-purple-400 hover:text-purple-300 shrink-0">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-gray-400 mb-2">Инструкция:</h3>
            <ol className="space-y-2">
              {details.instruction.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <button onClick={handlePaid} className="btn-lime w-full flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Я оплатил
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
