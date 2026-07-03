'use client'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-12 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Наш канал:</span>
            <a
              href="https://t.me/thebestmods"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              @thebestmods
            </a>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/docs/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/docs/offer" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Публичная оферта
            </Link>
            <Link href="/docs/agreement" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
        <div className="text-center mt-6 text-gray-600 text-xs">
          &copy; {new Date().getFullYear()} TheBestMods. Все права защищены.
        </div>
      </div>
    </footer>
  )
}
