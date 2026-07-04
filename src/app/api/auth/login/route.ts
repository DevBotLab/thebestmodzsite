import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/redis'
import { success, error } from '@/lib/api-response'
import { verifyRecaptcha } from '@/lib/recaptcha'
import crypto from 'crypto'

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'TheBestModsBot'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    if (body.captchaToken) {
      const valid = await verifyRecaptcha(body.captchaToken)
      if (!valid) return error('Проверка не пройдена', 400)
    }

    const code = crypto.randomBytes(4).toString('hex')

    await getRedis().set(`auth_code:${code}`, 'pending', 'EX', 300)

    return success({ code, botUsername: BOT_USERNAME })
  } catch (e) {
    console.error('Login error:', e)
    return error('Ошибка генерации кода', 500)
  }
}
