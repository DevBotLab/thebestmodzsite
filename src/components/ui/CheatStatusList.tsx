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

const defaultItems: CheatStatusItem[] = [
  { gameName: 'PUBG MOBILE', cheatName: 'Jarvis', status: 'SAFE' },
  { gameName: 'PUBG MOBILE', cheatName: 'ZoloCheat', status: 'SAFE' },
  { gameName: 'PUBG MOBILE', cheatName: 'Z Mod', status: 'RANDOM_BAN' },
  { gameName: 'PUBG MOBILE', cheatName: 'Falcon', status: 'UPDATING' },
  { gameName: 'Mobile Legends', cheatName: 'ML Bot', status: 'SAFE' },
  { gameName: 'Mobile Legends', cheatName: 'XX Mod', status: 'BANNED' },
  { gameName: 'Standoff 2', cheatName: 'ST Cheats', status: 'SAFE' },
  { gameName: 'Standoff 2', cheatName: 'Force', status: 'RANDOM_BAN' },
]

export function CheatStatusList({ items }: { items?: CheatStatusItem[] }) {
  const list = items ?? defaultItems
  const grouped = list.reduce<Record<string, CheatStatusItem[]>>((acc, item) => {
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
