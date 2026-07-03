import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

interface BreadCrumbsProps {
  items: Crumb[]
}

export function BreadCrumbs({ items }: BreadCrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
      <Link href="/" className="hover:text-purple-400 transition-colors flex items-center gap-1">
        <Home className="w-4 h-4" />
        Главная
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-purple-400 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
