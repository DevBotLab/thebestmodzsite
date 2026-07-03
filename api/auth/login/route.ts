import { NextRequest } from 'next/server'
import { redis } from '@/lib/redis'
import { success, error } from '@/lib/api-response'
import crypto from 'crypto'

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'TheBestModsBot'

export async function POST(_req: NextRequest) {
  try {
    const code = crypto.randomBytes(4).toString('hex')
    const authLink = `https://t.me/${BOT_USERNAME}?start=auth_${code}`

    await redis.set(`auth_pending:${code}`, 'pending', 'EX', 300)

    return success({ code, authLink, botUsername: BOT_USERNAME })
  } catch (e) {
    console.error('Login error:', e)
    return error('Ошибка генерации кода', 500)
  }
}
