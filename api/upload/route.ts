import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api-response'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return error('Файл не загружен', 400)

    const ext = path.extname(file.name) || '.bin'
    const fileName = `${crypto.randomBytes(16).toString('hex')}${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const url = `/uploads/${fileName}`

    return success({ url }, 201)
  } catch (e) {
    console.error('Upload error:', e)
    return error('Ошибка загрузки файла', 500)
  }
}
