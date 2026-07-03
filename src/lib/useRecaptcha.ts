'use client'

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

export function executeRecaptcha(action: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !(window as any).grecaptcha || !SITE_KEY) {
      resolve('no-captcha')
      return
    }
    ;(window as any).grecaptcha.ready(() => {
      ;(window as any).grecaptcha.execute(SITE_KEY, { action }).then(resolve).catch(reject)
    })
  })
}
