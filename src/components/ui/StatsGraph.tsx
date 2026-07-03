'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Пн', sales: 12 },
  { name: 'Вт', sales: 19 },
  { name: 'Ср', sales: 15 },
  { name: 'Чт', sales: 22 },
  { name: 'Пт', sales: 28 },
  { name: 'Сб', sales: 35 },
  { name: 'Вс', sales: 30 },
]

export function StatsGraph() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">Продажи за неделю</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252535" />
          <XAxis dataKey="name" stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} />
          <Tooltip
            contentStyle={{ background: '#1A1A26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="sales" fill="#7C3AED" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
