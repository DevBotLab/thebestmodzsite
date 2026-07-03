'use client'

export type CheatStatus = 'SAFE' | 'RISKY' | 'DANGER' | 'UPDATING'

interface StatusDotProps {
  status: CheatStatus
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<CheatStatus, { label: string; color: string; dot: string }> = {
  SAFE: {
    label: 'SAFE',
    color: 'text-green-400',
    dot: 'bg-green-400',
  },
  RISKY: {
    label: 'RISKY',
    color: 'text-yellow-400',
    dot: 'bg-yellow-400',
  },
  DANGER: {
    label: 'DANGER',
    color: 'text-red-400',
    dot: 'bg-red-400',
  },
  UPDATING: {
    label: 'UPDATING',
    color: 'text-zinc-400',
    dot: 'bg-zinc-400',
  },
}

const sizeMap = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export function StatusDot({ status, showLabel = true, size = 'md' }: StatusDotProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <span
        className={`${sizeMap[size]} rounded-full ${config.dot} shadow-lg`}
        style={{
          boxShadow: `0 0 8px ${config.dot.replace('bg-', '').replace('green', 'rgba(74,222,128,').replace('yellow', 'rgba(250,204,21,').replace('red', 'rgba(248,113,113,').replace('zinc', 'rgba(161,161,170,')}0.5)`,
        }}
      />
      {showLabel && (
        <span className={`text-xs font-semibold ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  )
}
