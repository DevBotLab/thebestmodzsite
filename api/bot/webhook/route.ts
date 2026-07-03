import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { success, error } from '@/lib/api-response'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim()).filter(Boolean)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''

async function sendTelegramMessage(chatId: string | number, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('Telegram API error:', err)
    }
  } catch (e) {
    console.error('Failed to send Telegram message:', e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const secretToken = req.headers.get('x-telegram-bot-api-secret-token')
    if (secretToken !== process.env.TELEGRAM_BOT_TOKEN) {
      return error('Unauthorized', 401)
    }

    const update = await req.json()
    const message = update.message
    if (!message || !message.text) return success({ ok: true })

    const chatId = message.chat.id
    const text = message.text.trim()
    const from = message.from

    if (text.startsWith('/auth ')) {
      const code = text.replace('/auth ', '').trim()
      const storedTgId = await redis.get(`auth_code:${code}`)

      if (!storedTgId) {
        await sendTelegramMessage(chatId, '❌ Код недействителен или истёк. Запросите новый код на сайте.')
        return success({ ok: true })
      }

      const tgId = String(from?.id || '')
      if (storedTgId !== tgId) {
        await sendTelegramMessage(chatId, '❌ Этот код предназначен для другого аккаунта Telegram.')
        return success({ ok: true })
      }

      const existingUser = await prisma.user.findUnique({ where: { tgId } })
      const user = existingUser
        ? await prisma.user.update({ where: { tgId }, data: { tgUsername: from?.username || null, firstName: from?.first_name || null, lastName: from?.last_name || null } })
        : await prisma.user.create({
            data: {
              tgId,
              tgUsername: from?.username || null,
              firstName: from?.first_name || null,
              lastName: from?.last_name || null,
            },
          })

      await redis.del(`auth_code:${code}`)

      const isAdmin = ADMIN_IDS.includes(tgId)
      await sendTelegramMessage(
        chatId,
        `✅ <b>Авторизация успешна!</b>\n\nПривет, ${user.firstName || 'пользователь'}!\n${isAdmin ? '\n🔑 У вас права администратора.' : ''}\n\nПерейдите на сайт, чтобы продолжить:\n${SITE_URL}`
      )

      return success({ ok: true })
    }

    if (text === '/start') {
      const welcomeText =
        `👋 <b>Добро пожаловать в TheBestMods!</b>\n\n` +
        `Мы — магазин качественных читов для игр.\n\n` +
        `📌 <b>Что мы предлагаем:</b>\n` +
        `• Читы для популярных игр\n` +
        `• Различные тарифы (1/3/7/30/60 дней)\n` +
        `• Поддержка 24/7\n\n` +
        `🔐 <b>Как начать:</b>\n` +
        `1. Перейдите на сайт: ${SITE_URL}\n` +
        `2. Нажмите «Войти через Telegram»\n` +
        `3. Отправьте код авторизации на сайте\n\n` +
        `💬 По вопросам обращайтесь в поддержку на сайте.`

      await sendTelegramMessage(chatId, welcomeText)
      return success({ ok: true })
    }

    if (from && ADMIN_IDS.includes(String(from.id))) {
      return success({ ok: true })
    }

    await sendTelegramMessage(
      chatId,
      'Используйте /auth <код> для авторизации или /start для приветствия.'
    )

    return success({ ok: true })
  } catch (e) {
    console.error('Webhook error:', e)
    return success({ ok: true })
  }
}
