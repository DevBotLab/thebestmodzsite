'use client'

import { X, CreditCard, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  tariffName: string
  price: number
}

export function PaymentModal({ isOpen, onClose, productName, tariffName, price }: PaymentModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handlePayment = () => {
    onClose()
    router.push('/payment')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-8 w-full max-w-md mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <CreditCard className="w-12 h-12 text-lime-400 mx-auto mb-3" />
          <h2 className="text-2xl font-heading text-white">Оплата</h2>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-300">
            <span>Товар:</span>
            <span className="text-white font-medium">{productName}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Тариф:</span>
            <span className="text-white font-medium">{tariffName}</span>
          </div>
          <div className="flex justify-between text-lg border-t border-white/10 pt-3">
            <span className="text-white font-bold">Итого:</span>
            <span className="text-lime-400 font-bold">{price} ₽</span>
          </div>
        </div>
        <button onClick={handlePayment} className="btn-lime w-full flex items-center justify-center gap-2">
          Перейти к оплате
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
