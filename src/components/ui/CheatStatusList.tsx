import { Shield, AlertTriangle, Skull, RefreshCw } from 'lucide-react'

interface CheatStatusItem {
  gameName: string
  cheatName: string
  status: 'SAFE' | 'RANDOM_BAN' | 'BANNED' | 'UPDATING'
}

const statusConfig = {
  SAFE: { icon: Shield, label: 'Безопасен', color: 'text-green-400', bg: 'bg-green-500/10' },
  RANDOM_BAN: { icon: AlertTriangle, label: 'Рандомные баны', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  BANNED: { icon: Skull, label: 'Банится сразу', color: 'text-red-400', bg: 'bg-red-500/10' },
  UPDATING: { icon: RefreshCw, label: 'В обновлении', color: 'text-gray-400', bg: 'bg-gray-500/10' },
}

export function CheatStatusList({ items }: { items?: CheatStatusItem[] }) {
  if (!items || items.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-8">Статусы читов загружаются...</p>
  }
  const grouped = items.reduce<Record<string, CheatStatusItem[]>>((acc, item) => {
    ;(acc[item.gameName] ??= []).push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([game, cheats]) => (
        <div key={game} className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">{game}</h3>
          <div className="space-y-3">
            {cheats.map((cheat) => {
              const cfg = statusConfig[cheat.status]
              const Icon = cfg.icon
              return (
                <div key={cheat.cheatName} className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                  <span className="text-white font-medium flex-1">{cheat.cheatName}</span>
                  <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
