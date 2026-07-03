'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackButton } from '@/components/layout/BackButton'
import { AuthModal } from '@/components/ui/AuthModal'
import { useAuthStore } from '@/store/useAuthStore'
import { apiFetch } from '@/lib/api'
import toast from 'react-hot-toast'

interface ReviewItem {
  id: string
  user: { tgUsername: string | null; firstName: string | null }
  product: { id: string; name: string; slug: string } | null
  rating: number
  text: string | null
  isVerified: boolean
  createdAt: string
  likes: number
  dislikes: number
  userLike: string | null
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'сегодня'
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} дн. назад`

  return date.toLocaleDateString('ru-RU')
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { isAuthenticated } = useAuthStore()

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<{ success: boolean; data: { items: ReviewItem[] } }>('/reviews')
      setReviews(data.data.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки отзывов')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleLike = async (reviewId: string, type: 'LIKE' | 'DISLIKE') => {
    if (!isAuthenticated) {
      setAuthOpen(true)
      return
    }

    setReviews(prev => prev.map(r => {
      if (r.id !== reviewId) return r

      let { likes, dislikes, userLike } = r

      if (userLike === type) {
        if (type === 'LIKE') likes--
        else dislikes--
        userLike = null
      } else if (userLike) {
        if (type === 'LIKE') { likes++; dislikes-- }
        else { dislikes++; likes-- }
        userLike = type
      } else {
        if (type === 'LIKE') likes++
        else dislikes++
        userLike = type
      }

      return { ...r, likes, dislikes, userLike }
    }))

    try {
      const result = await apiFetch<{ success: boolean; data: { likes: number; dislikes: number } }>(`/reviews/${reviewId}/like`, {
        method: 'POST',
        body: JSON.stringify({ type }),
      })
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, likes: result.data.likes, dislikes: result.data.dislikes } : r
      ))
    } catch {
      fetchReviews()
      toast.error('Ошибка при оценке отзыва')
    }
  }

  const submitReview = async () => {
    if (!text) {
      toast.error('Напишите текст отзыва')
      return
    }
    setSubmitting(true)
    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ text, rating }),
      })
      toast.success('Отзыв отправлен на модерацию!')
      setShowForm(false)
      setText('')
      setRating(5)
      fetchReviews()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка отправки отзыва')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white">Отзывы</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!isAuthenticated) setAuthOpen(true)
              else setShowForm(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Оставить отзыв
          </button>
          <BackButton />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={fetchReviews} className="btn-primary">Повторить</button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {reviews.length === 0 && (
            <p className="text-center text-gray-500 py-10">Пока нет отзывов</p>
          )}
          {reviews.map((review) => (
            <GlassCard key={review.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {review.user.tgUsername || review.user.firstName || 'Аноним'}
                    </span>
                    {review.product && (
                      <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {review.product.name}
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
                <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
              </div>
              <p className="text-gray-300 text-sm">{review.text}</p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => handleLike(review.id, 'LIKE')}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    review.userLike === 'LIKE' ? 'text-green-400' : 'text-gray-500 hover:text-green-400'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {review.likes}
                </button>
                <button
                  onClick={() => handleLike(review.id, 'DISLIKE')}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    review.userLike === 'DISLIKE' ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {review.dislikes}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

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
                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
