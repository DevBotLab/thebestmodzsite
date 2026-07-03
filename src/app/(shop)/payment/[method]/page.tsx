'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { CheckCircle, Copy, Loader2, ArrowLeft } from 'lucide-react'
import { BreadCrumbs } from '@/components/layout/BreadCrumbs'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import { apiFetch } from '@/lib/api'
import toast from 'react-hot-toast'

export default function PaymentMethodPage() {
  const params = useParams()
  const router = useRouter()
  const method = params.method as string

  const [methodData, setMethodData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [usdtRate, setUsdtRate] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    apiFetch('/payments').then((data: any) => {
      const methods = data.methods || data || []
      const found = methods.find((m: any) => m.code === method)
      setMethodData(found || null)
    }).catch(console.error).finally(() => setLoading(false))
  }, [method])

  useEffect(() => {
    if (method === 'cryptobot') {
      apiFetch('/payments/rate?pair=USDT_RUB').then((data: any) => {
        setUsdtRate(data.rate || data.price || null)
      }).catch(() => {})
    }
  }, [method])

  const usdtAmount = usdtRate && amount ? (parseFloat(amount) / usdtRate).toFixed(2) : null

  const handlePaid = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Укажите сумму')
      return
    }
    setSubmitting(true)
    try {
      const created = await apiFetch<any>('/payments/create', {
        method: 'POST',
        body: JSON.stringify({ method, amount: parseFloat(amount) }),
      })
      const paymentId = created.id || created.payment?.id
      if (paymentId) {
        await apiFetch(`/payments/${paymentId}/confirm`, { method: 'POST' })
      }
      setPaid(true)
      toast.success('Заявка отправлена! Проверка до 5 минут.')
      setTimeout(() => router.push('/profile/history'), 3000)
    } catch (e: any) {
      toast.error(e.message || 'Ошибка при создании платежа')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!methodData) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="text-2xl font-bold text-white">Способ оплаты не найден</h2>
        <div className="mt-4"><BackButton /></div>
      </div>
    )
  }

  if (paid) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center animate-scale-in">
        <CheckCircle className="w-20 h-20 text-lime-400 mb-4" />
        <h2 className="text-2xl font-heading text-white mb-2">Заявка отправлена!</h2>
        <p className="text-gray-400 mb-6">Мы проверим платёж в течение 5 минут</p>
        <button onClick={() => router.push('/payment')} className="btn-ghost">
          Вернуться к способам оплаты
        </button>
      </div>
    )
  }

  const details = methodData.settings || methodData

  return (
    <div className="animate-fade-in">
      <BreadCrumbs items={[{ label: 'Оплата', href: '/payment' }, { label: methodData.name }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">{methodData.name}</h1>
        <BackButton />
      </div>

      <GlassCard className="max-w-md mx-auto">
        <div className="space-y-5">
          {/* Amount input */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Сумма (RUB)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Введите сумму"
              className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* USDT conversion for CryptoBot */}
          {method === 'cryptobot' && usdtRate && amount && (
            <div className="bg-dark-300/50 rounded-xl px-4 py-3 text-sm">
              <span className="text-gray-400">Эквивалент в USDT: </span>
              <span className="text-lime-400 font-semibold">{usdtAmount} USDT</span>
              <span className="text-gray-500 ml-1">(1 USDT = {usdtRate} RUB)</span>
            </div>
          )}

          {usdtRate === null && method === 'cryptobot' && amount && (
            <div className="bg-dark-300/50 rounded-xl px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Загрузка курса...
            </div>
          )}

          {/* Payment details */}
          {details.cardNumber && (
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Номер карты</h3>
              <div className="flex items-center gap-2 bg-dark-300 rounded-xl px-4 py-3">
                <span className="text-white flex-1 break-all">{details.cardNumber}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(details.cardNumber); toast.success('Скопировано!') }}
                  className="text-purple-400 hover:text-purple-300 shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {details.bank && (
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Банк</h3>
              <div className="bg-dark-300 rounded-xl px-4 py-3 text-white">{details.bank}</div>
            </div>
          )}

          {details.recipientName && (
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Получатель</h3>
              <div className="bg-dark-300 rounded-xl px-4 py-3 text-white">{details.recipientName}</div>
            </div>
          )}

          {/* Generic details fallback */}
          {details.details && !details.cardNumber && (
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Реквизиты</h3>
              <div className="flex items-center gap-2 bg-dark-300 rounded-xl px-4 py-3">
                <span className="text-white flex-1 break-all">{details.details}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(details.details); toast.success('Скопировано!') }}
                  className="text-purple-400 hover:text-purple-300 shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Instruction */}
          {details.instruction && details.instruction.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-400 mb-2">Инструкция:</h3>
              <ol className="space-y-2">
                {details.instruction.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePaid}
              disabled={submitting}
              className="btn-lime flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Я оплатил
            </button>
            <button
              onClick={() => router.push('/payment')}
              className="btn-ghost flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Отмена
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
