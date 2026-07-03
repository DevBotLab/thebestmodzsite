'use client'

interface StarLoaderProps {
  size?: number
  color?: string
  text?: string
}

export function StarLoader({
  size = 64,
  color = '#84CC16',
  text = 'Загрузка...',
}: StarLoaderProps) {
  const starPoints = [
    [50, 5],
    [61, 35],
    [95, 35],
    [68, 57],
    [79, 91],
    [50, 70],
    [21, 91],
    [32, 57],
    [5, 35],
    [39, 35],
  ]

  const pathD = starPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
    .join(' ') + ' Z'

  return (
    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative animate-spin-star" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="absolute inset-0"
        >
          <path
            d={pathD}
            fill="none"
            stroke="rgba(124,58,237,0.2)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinejoin="round"
            strokeDasharray="100"
            strokeDashoffset="0"
            className="animate-fill-star"
            style={{
              animation: 'fill-star 1.5s ease-in-out infinite alternate',
            }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
      <p className="text-xs text-zinc-400 font-medium">{text}</p>
    </div>
  )
}
