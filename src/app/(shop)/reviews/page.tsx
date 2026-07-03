'use client'

import { useState } from 'react'
import { Star, MessageSquare, ThumbsUp } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import { AuthModal } from '@/components/ui/AuthModal'
import toast from 'react-hot-toast'

interface Review {
  id: string
  name: string
  rating: number
  text: string
  date: string
  likes: number
  productName?: string
}

const mockReviews: Review[] = [
  { id: '1', name: 'PlayerX', rating: 5, text: 'Отличный чит! Всё работает, банов нет уже месяц.', date: '28.06.2026', likes: 12, productName: 'Jarvis' },
  { id: '2', name: 'ProGamer', rating: 4, text: 'ZoloCheat топ, но дороговато. Работает стабильно.', date: '25.06.2026', likes: 8, productName: 'ZoloCheat' },
  { id: '3', name: 'NoobMaster', rating: 5, text: 'Лучший магазин читов! Ключи приходят моментально.', date: '20.06.2026', likes: 15 },
  { id: '4', name: 'Hunter99', rating: 3, text: 'Нормально, но хотелось бы больше функций в базовом тарифе.', date: '15.06.2026', likes: 4, productName: 'Falcon' },
  { id: '5', name: 'ShadowPlay', rating: 5, text: 'Пользуюсь полгода, всё отлично. Поддержка отвечает быстро.', date: '10.06.2026', likes: 20 },
]

export default function ReviewsPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')

  const submitReview = () => {
    if (!text) {
      toast.error('Напишите текст отзыва')
      return
    }
    toast.success('Отзыв отправлен на модерацию!')
    setShowForm(false)
    setText('')
    setRating(5)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Отзывы</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setAuthOpen(true)} className="btn-primary flex items-center gap-2">
            <Star className="w-4 h-4" />
            Оставить отзыв
          </button>
          <BackButton />
        </div>
      </div>

      <div className="space-y-4">
        {mockReviews.map((review) => (
          <GlassCard key={review.id}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{review.name}</span>
                  {review.productName && (
                    <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      {review.productName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-500">{review.date}</span>
            </div>
            <p className="text-gray-300 text-sm">{review.text}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <ThumbsUp className="w-3 h-3" />
              {review.likes}
            </div>
          </GlassCard>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Оставить отзыв</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button key={i} onClick={() => setRating(i + 1)}>
                    <Star className={`w-6 h-6 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ваш отзыв"
                rows={4}
                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Отмена</button>
                <button onClick={submitReview} className="btn-primary flex-1">Отправить</button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
