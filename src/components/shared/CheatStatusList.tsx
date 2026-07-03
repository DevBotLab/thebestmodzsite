'use client'

import { StatusDot, type CheatStatus } from '../ui/StatusDot'

interface CheatItem {
  id: string
  gameName: string
  cheatName: string
  platform: string | null
  status: CheatStatus
  updatedAt: string
}

interface CheatStatusListProps {
  items: CheatItem[]
}

export function CheatStatusList({ items }: CheatStatusListProps) {
  const grouped = items.reduce<Record<string, CheatItem[]>>((acc, item) => {
    if (!acc[item.gameName]) acc[item.gameName] = []
    acc[item.gameName].push(item)
    return acc
  }, {})

  const gameNames = Object.keys(grouped).sort()

  if (!items.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-zinc-500">Нет данных о статусах читов</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {gameNames.map((gameName) => (
        <div key={gameName} className="glass-card p-4">
          <h3 className="font-heading text-[10px] text-purple-400 mb-3">
            {gameName}
          </h3>
          <div className="space-y-2">
            {grouped[gameName].map((cheat) => (
              <div
                key={cheat.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot status={cheat.status} size="sm" showLabel={false} />
                  <span className="text-sm text-zinc-300 truncate">
                    {cheat.cheatName}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {cheat.platform && (
                    <span className="text-[10px] uppercase text-zinc-500">
                      {cheat.platform}
                    </span>
                  )}
                  <StatusDot status={cheat.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
