'use client'

import { Shield, AlertTriangle, Skull, RefreshCw } from 'lucide-react'
import { CheatStatusList } from '@/components/ui/CheatStatusList'
import { BackButton } from '@/components/layout/BackButton'

const legendItems = [
  { icon: Shield, label: 'Безопасен', color: 'text-green-400' },
  { icon: AlertTriangle, label: 'Рандомные баны', color: 'text-yellow-400' },
  { icon: Skull, label: 'Банится сразу', color: 'text-red-400' },
  { icon: RefreshCw, label: 'В обновлении', color: 'text-gray-400' },
]

export default function CheatsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-white flex items-center gap-2">
          ⚠️ Status читов
        </h1>
        <BackButton />
      </div>

      <div className="glass-card p-4 mb-6">
        <p className="text-sm text-gray-400 mb-3">Легенда:</p>
        <div className="flex flex-wrap gap-4">
          {legendItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <CheatStatusList />
    </div>
  )
}
