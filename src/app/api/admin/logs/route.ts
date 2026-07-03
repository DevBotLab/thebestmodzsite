import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { success, unauthorized, forbidden } from '@/lib/api-response'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()
  if (!checkIsAdmin(session.tgId)) return forbidden()

  // TODO: implement admin logs retrieval
  return success({ logs: [] })
}
