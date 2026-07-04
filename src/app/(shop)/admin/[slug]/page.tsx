'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminEntryPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin')
  }, [router])

  return null
}