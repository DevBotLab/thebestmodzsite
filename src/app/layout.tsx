import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { Toaster } from '@/components/ui/Toaster'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['cyrillic', 'latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

export const metadata: Metadata = {
  title: 'TheBestModz — магазин читов и ключей',
  description: 'Магазин читов для PUBG MOBILE, Mobile Legends, Standoff 2. Покупка ключей и подписок.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        {RECAPTCHA_SITE_KEY && (
          <Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`} strategy="lazyOnload" />
        )}
      </body>
    </html>
  )
}
