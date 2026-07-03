import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const pair = req.nextUrl.searchParams.get('pair') || 'USDT_RUB'
    const [from, to] = pair.split('_')

    const id = from === 'USDT' ? 'tether' : from?.toLowerCase()
    const vs = to?.toLowerCase() || 'rub'

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) throw new Error('CoinGecko error')

    const data = await res.json()
    const rate = data[id]?.[vs]

    if (!rate) throw new Error('Rate not found')
    return success({ pair, rate, price: rate })
  } catch {
    return success({ pair: 'USDT_RUB', rate: 85, price: 85 })
  }
}
