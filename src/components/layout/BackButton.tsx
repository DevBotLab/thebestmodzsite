'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm">Назад</span>
    </button>
  )
}
