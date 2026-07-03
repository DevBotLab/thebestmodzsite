import { NextRequest } from 'next/server'
import { redis } from '@/lib/redis'
import { success, error } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code) return error('Code is required', 400)

    const status = await redis.get(`auth_pending:${code}`)
    if (!status) return success({ status: 'expired' })

    return success({ status })
  } catch (e) {
    console.error('Check code error:', e)
    return error('Ошибка проверки кода', 500)
  }
}
