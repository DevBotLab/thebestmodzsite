import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/redis'
import { success, error } from '@/lib/api-response'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'TheBestModzBot'

export async function POST(req: NextRequest) {
  try {
    const code = crypto.randomBytes(8).toString('hex')

    await getRedis().set(`auth_code:${code}`, 'pending', 'EX', 300)

    return success({ code, botUsername: BOT_USERNAME })
  } catch (e) {
    console.error('Login error:', e)
    return error('Ошибка генерации кода', 500)
  }
}
