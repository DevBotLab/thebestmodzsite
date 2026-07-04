import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/redis'
import { success, error } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code) return error('Code is required', 400)

    const val = await getRedis().get(`auth_code:${code}`)
    if (!val) return success({ status: 'expired' })

    const status = val === 'pending' ? 'pending' : 'confirmed'
    return success({ status })
  } catch (e) {
    console.error('Check code error:', e)
    return error('Ошибка проверки кода', 500)
  }
}
