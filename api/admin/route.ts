import { NextRequest } from 'next/server'
import { getSession, checkIsAdmin } from '@/lib/auth'
import { success, unauthorized, forbidden } from '@/lib/api-response'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()

  const isAdmin = checkIsAdmin(session.tgId)
  if (!isAdmin) return forbidden()

  return success({
    isAdmin: true,
    role: session.isAdmin ? 'admin' : 'user',
  })
}
