import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY is not set in environment variables')
  }
  return Buffer.from(key, 'hex')
}

function getHmacKey(): Buffer {
  const key = getKey()
  return crypto.createHash('sha256').update(key).update(':hmac').digest()
}

export function encrypt(text: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const hmacKey = getHmacKey()
  const hmac = crypto.createHmac('sha256', hmacKey)
  hmac.update(iv.toString('hex'))
  hmac.update(':')
  hmac.update(encrypted)
  const mac = hmac.digest('hex')

  return mac + ':' + iv.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':')
  const mac = parts.shift()!
  const iv = Buffer.from(parts.shift()!, 'hex')
  const encrypted = parts.join(':')

  const hmacKey = getHmacKey()
  const hmac = crypto.createHmac('sha256', hmacKey)
  hmac.update(iv.toString('hex'))
  hmac.update(':')
  hmac.update(encrypted)
  const expectedMac = hmac.digest('hex')

  const macBuffer = Buffer.from(mac, 'hex')
  const expectedBuffer = Buffer.from(expectedMac, 'hex')

  if (macBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(macBuffer, expectedBuffer)) {
    throw new Error('Decryption failed: HMAC mismatch or data corruption')
  }

  const key = getKey()
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
