'use client'

import { useState } from 'react'
import { Repeat, AlertTriangle, CheckCircle } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import toast from 'react-hot-toast'

const COMMISSION_PERCENT = 5

export default function TransferPage() {
  const [tgId, setTgId] = useState('')
  const [amount, setAmount] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  const numAmount = Number(amount)
  const commission = Math.round(numAmount * (COMMISSION_PERCENT / 100))
  const total = numAmount + commission

  const handleTransfer = () => {
    if (!tgId || !amount || numAmount <= 0) {
      toast.error('Заполните все поля')
      return
    }
    setConfirmOpen(true)
  }

  const confirmTransfer = () => {
    setConfirmOpen(false)
    setSuccess(true)
    toast.success('Перевод выполнен успешно')
  }

  if (success) {
    return (
      <div>
        <BreadCrumbs items={[{ label: 'Профиль', href: '/profile' }, { label: 'Перевод' }]} />
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
          <CheckCircle className="w-16 h-16 text-lime-400 mb-4" />
          <h2 className="text-2xl font-heading text-white mb-2">Перевод выполнен!</h2>
          <p className="text-gray-400 mb-6">
            {numAmount} ₽ отправлено пользователю {tgId}
          </p>
          <BackButton />
        </div>
      </div>
    )
  }

  return (
    <div>
      <BreadCrumbs items={[{ label: 'Профиль', href: '/profile' }, { label: 'Перевод баланса' }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Перевод баланса</h1>
        <BackButton />
      </div>

      <GlassCard className="max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">ID пользователя Telegram</label>
            <input
              type="text"
              value={tgId}
              onChange={(e) => setTgId(e.target.value)}
              placeholder="Введите Telegram ID"
              className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Сумма (₽)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {numAmount > 0 && (
            <div className="bg-dark-300/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Сумма перевода</span>
                <span className="text-white">{numAmount} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Комиссия ({COMMISSION_PERCENT}%)</span>
                <span className="text-red-400">-{commission} ₽</span>
              </div>
              <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                <span className="text-white">Списано с баланса</span>
                <span className="text-lime-400">{total} ₽</span>
              </div>
            </div>
          )}

          <button onClick={handleTransfer} className="btn-primary w-full flex items-center justify-center gap-2">
            <Repeat className="w-5 h-5" />
            Перевести
          </button>
        </div>
      </GlassCard>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <GlassCard className="max-w-sm mx-4 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Подтверждение перевода</h3>
            <p className="text-gray-400 mb-4">
              Вы уверены, что хотите перевести {numAmount} ₽ пользователю {tgId}?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmOpen(false)} className="btn-ghost flex-1">Отмена</button>
              <button onClick={confirmTransfer} className="btn-primary flex-1">Подтвердить</button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
