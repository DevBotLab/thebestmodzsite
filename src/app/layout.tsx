import type { Metadata } from 'next'
import { Inter, Press_Start_2P } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { Toaster } from '@/components/ui/Toaster'
import './globals.css'

const inter = Inter({ subsets: ['cyrillic', 'latin'], variable: '--font-inter' })
const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TheBestMods — магазин читов и ключей',
  description: 'Магазин читов для PUBG MOBILE, Mobile Legends, Standoff 2. Покупка ключей и подписок.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} ${pressStart2P.variable} font-sans`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
