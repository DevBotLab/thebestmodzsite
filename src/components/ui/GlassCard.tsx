import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  href?: string
}

export function GlassCard({ children, className = '', onClick, href }: GlassCardProps) {
  const Component = href ? 'a' : 'div'
  const props = href ? { href } : onClick ? { onClick, role: 'button', tabIndex: 0 } : {}

  return (
    <Component
      className={`glass-card p-6 transition-all duration-300 hover:glow-purple hover:border-purple-500/50 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
