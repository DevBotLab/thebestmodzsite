import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRedis } from '@/lib/redis'
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

async function sendTelegramInlineKeyboard(
  chatId: string | number,
  text: string,
  keyboard: { text: string; url?: string; callback_data?: string }[][]
) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard.map(row => row.map(btn => btn)) },
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('Telegram API error (inline keyboard):', err)
    }
  } catch (e) {
    console.error('Failed to send Telegram inline keyboard:', e)
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    })
  } catch (e) {
    console.error('Failed to answer callback query:', e)
  }
}

async function editMessageText(
  chatId: string | number,
  messageId: number,
  text: string,
  keyboard?: { text: string; url?: string; callback_data?: string }[][]
) {
  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    }
    if (keyboard) {
      body.reply_markup = { inline_keyboard: keyboard.map(row => row.map(btn => btn)) }
    } else {
      body.reply_markup = { inline_keyboard: [] }
    }
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('Telegram API error (editMessageText):', err)
    }
  } catch (e) {
    console.error('Failed to edit message text:', e)
  }
}

function formatTimeRemaining(createdAt: number | string): string {
  const now = Date.now()
  const created = typeof createdAt === 'number' ? createdAt : new Date(createdAt).getTime()
  const elapsed = now - created
  const remaining = Math.max(0, 60 * 60 * 1000 - elapsed)
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export async function POST(req: NextRequest) {
  try {
    const secretToken = req.headers.get('x-telegram-bot-api-secret-token')
    if (secretToken !== process.env.TELEGRAM_BOT_TOKEN) {
      return error('Unauthorized', 401)
    }

    const update = await req.json()

    if (update.callback_query) {
      const cb = update.callback_query
      const chatId = cb.message.chat.id
      const messageId = cb.message.message_id
      const callbackData: string = cb.data || ''
      const callbackQueryId = cb.id

      if (callbackData === 'auth_instructions') {
        await answerCallbackQuery(callbackQueryId)
        await sendTelegramMessage(
          chatId,
          `🔐 <b>Авторизация</b>\n\nЧтобы авторизоваться:\n` +
          `1. Перейдите на сайт: ${SITE_URL}\n` +
          `2. Нажмите «Войти через Telegram»\n` +
          `3. Скопируйте код авторизации\n` +
          `4. Отправьте его сюда: /auth &lt;код&gt;\n\n` +
          `Пример: <code>/auth a1b2c3d4</code>`
        )
        return success({ ok: true })
      }

      if (callbackData.startsWith('check_payment:')) {
        const key = callbackData.replace('check_payment:', '')
        const paymentData = await getRedis().get(`crypto_pay:${key}`)

        if (!paymentData) {
          await answerCallbackQuery(callbackQueryId, '❌ Платёж не найден')
          await editMessageText(chatId, messageId, '❌ <b>Платёж не найден.</b>')
          return success({ ok: true })
        }

        let payment: Record<string, unknown>
        try {
          payment = JSON.parse(paymentData as string)
        } catch {
          await answerCallbackQuery(callbackQueryId, '❌ Ошибка данных')
          await editMessageText(chatId, messageId, '❌ <b>Ошибка при проверке платежа.</b>')
          return success({ ok: true })
        }

        if (payment.status === 'paid') {
          await answerCallbackQuery(callbackQueryId, '✅ Платёж подтверждён!')
          await editMessageText(
            chatId,
            messageId,
            `✅ <b>Платёж подтверждён!</b>\n\nСпасибо за оплату! Средства уже зачислены.`
          )
        } else if (payment.status === 'cancelled') {
          await answerCallbackQuery(callbackQueryId, '❌ Платёж отменён')
          await editMessageText(
            chatId,
            messageId,
            `❌ <b>Платёж отменён.</b>`
          )
        } else if (payment.status === 'expired') {
          await answerCallbackQuery(callbackQueryId, '⏰ Время истекло')
          await editMessageText(
            chatId,
            messageId,
            `⏰ <b>Время оплаты истекло.</b>\n\nПлатёж больше не действителен.`
          )
        } else {
          await answerCallbackQuery(callbackQueryId, '🔄 Ожидает оплаты')
          const timeLeft = formatTimeRemaining(
            (typeof payment.created_at === 'number' ? payment.created_at : payment.created_at as string) || Date.now()
          )
          await editMessageText(
            chatId,
            messageId,
            `🔄 <b>Платёж ожидает оплаты</b>\n\n` +
            `💰 Сумма: ${payment.amount_rub} RUB / ${payment.amount_usdt} USDT\n` +
            `📋 Invoice: ${payment.invoice_id || '—'}\n` +
            `⏳ Осталось: ${timeLeft}\n\n` +
            `Нажмите «💳 Перейти к оплате», чтобы завершить платёж.`,
            [
              [{ text: '💳 Перейти к оплате', url: payment.invoice_url as string }],
              [{ text: '✅ Проверить оплату', callback_data: `check_payment:${key}` }],
              [{ text: '❌ Отмена оплаты', callback_data: `cancel_payment:${key}` }],
            ]
          )
        }

        return success({ ok: true })
      }

      if (callbackData.startsWith('cancel_payment:')) {
        const key = callbackData.replace('cancel_payment:', '')
        const paymentData = await getRedis().get(`crypto_pay:${key}`)

        if (paymentData) {
          let payment: Record<string, unknown>
          try {
            payment = JSON.parse(paymentData as string)
          } catch {
            await answerCallbackQuery(callbackQueryId, '❌ Ошибка')
            await editMessageText(chatId, messageId, '❌ <b>Ошибка при отмене платежа.</b>')
            return success({ ok: true })
          }

          payment.status = 'cancelled'
          await getRedis().set(`crypto_pay:${key}`, JSON.stringify(payment))
        }

        await answerCallbackQuery(callbackQueryId, '❌ Платёж отменён')
        await editMessageText(
          chatId,
          messageId,
          `❌ <b>Платёж отменён.</b>\n\nЕсли вы передумали, можете создать новый платёж на сайте.`
        )

        return success({ ok: true })
      }

      await answerCallbackQuery(callbackQueryId)
      return success({ ok: true })
    }

    const message = update.message
    if (!message || !message.text) return success({ ok: true })

    const chatId = message.chat.id
    const text = message.text.trim()
    const from = message.from

    if (text === '/start') {
      await sendTelegramInlineKeyboard(
        chatId,
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
        `💬 По вопросам обращайтесь в поддержку.`,
        [
          [{ text: '🛒 Открыть магазин', url: SITE_URL }],
          [{ text: '💬 Поддержка', url: SITE_URL }],
          [{ text: '🔐 Авторизация', callback_data: 'auth_instructions' }],
        ]
      )
      return success({ ok: true })
    }

    if (text.startsWith('/auth ')) {
      const code = text.replace('/auth ', '').trim()
      const storedTgId = await getRedis().get(`auth_code:${code}`)

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
        ? await prisma.user.update({
            where: { tgId },
            data: { tgUsername: from?.username || null, firstName: from?.first_name || null, lastName: from?.last_name || null },
          })
        : await prisma.user.create({
            data: {
              tgId,
              tgUsername: from?.username || null,
              firstName: from?.first_name || null,
              lastName: from?.last_name || null,
            },
          })

      await getRedis().del(`auth_code:${code}`)

      const isAdmin = ADMIN_IDS.includes(tgId)
      await sendTelegramMessage(
        chatId,
        `✅ <b>Авторизация успешна!</b>\n\n` +
        `Привет, ${user.firstName || 'пользователь'}!\n` +
        `Telegram ID: <code>${tgId}</code>\n` +
        `Username: ${from?.username ? '@' + from.username : '—'}\n` +
        `Баланс: ${user.balance} ₽\n` +
        `${isAdmin ? '\n🔑 У вас права администратора.' : ''}\n\n` +
        `Перейдите на сайт, чтобы продолжить:\n${SITE_URL}`
      )

      return success({ ok: true })
    }

    if (text.startsWith('/pay ')) {
      const key = text.replace('/pay ', '').trim()
      const paymentData = await getRedis().get(`crypto_pay:${key}`)

      if (!paymentData) {
        await sendTelegramMessage(
          chatId,
          '❌ Платёж не найден. Проверьте правильность ключа.'
        )
        return success({ ok: true })
      }

      let payment: Record<string, unknown>
      try {
        payment = JSON.parse(paymentData as string)
      } catch {
        await sendTelegramMessage(chatId, '❌ Ошибка при получении информации о платеже.')
        return success({ ok: true })
      }

      if (payment.status === 'paid') {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Платёж уже оплачен!</b>\n\nСумма: ${payment.amount_rub} RUB / ${payment.amount_usdt} USDT`
        )
        return success({ ok: true })
      }

      if (payment.status === 'cancelled') {
        await sendTelegramMessage(chatId, `❌ <b>Платёж отменён.</b>`)
        return success({ ok: true })
      }

      if (payment.status === 'expired') {
        await sendTelegramMessage(chatId, `⏰ <b>Время оплаты истекло.</b>`)
        return success({ ok: true })
      }

      const createdAt = (typeof payment.created_at === 'number' ? payment.created_at : payment.created_at as string) || Date.now()
      const timeLeft = formatTimeRemaining(createdAt)

      await sendTelegramInlineKeyboard(
        chatId,
        `💳 <b>Платёж создан</b>\n\n` +
        `💰 Сумма: ${payment.amount_rub} RUB / ${payment.amount_usdt} USDT\n` +
        `📋 Invoice: ${payment.invoice_id || '—'}\n` +
        `🆔 Order: ${payment.order_id || '—'}\n` +
        `📅 Создан: ${new Date(typeof createdAt === 'number' ? createdAt : new Date(createdAt).getTime()).toLocaleString('ru-RU')}\n` +
        `⏳ Осталось: ${timeLeft}`,
        [
          [{ text: '💳 Перейти к оплате', url: payment.invoice_url as string }],
          [{ text: '✅ Проверить оплату', callback_data: `check_payment:${key}` }],
          [{ text: '❌ Отмена оплаты', callback_data: `cancel_payment:${key}` }],
        ]
      )

      return success({ ok: true })
    }

    if (from && ADMIN_IDS.includes(String(from.id))) {
      await sendTelegramMessage(chatId, `✅ Сообщение получено.`)
      return success({ ok: true })
    }

    await sendTelegramMessage(
      chatId,
      `👋 <b>Доступные команды:</b>\n\n` +
      `/start — Информация о магазине\n` +
      `/auth &lt;код&gt; — Авторизация на сайте\n` +
      `/pay &lt;ключ&gt; — Информация о платеже\n\n` +
      `💬 По вопросам обращайтесь в поддержку на сайте.`
    )

    return success({ ok: true })
  } catch (e) {
    console.error('Webhook error:', e)
    return success({ ok: true })
  }
}
