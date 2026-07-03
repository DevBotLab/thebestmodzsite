'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface DayStat {
  date: string
  label: string
  value: number
}

interface StatsGraphProps {
  data?: DayStat[]
  height?: number
}

function generateDefaultData(): DayStat[] {
  const days: DayStat[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('ru-RU', { weekday: 'short' })
    days.push({
      date: d.toISOString().slice(0, 10),
      label,
      value: Math.floor(Math.random() * 50) + 10,
    })
  }
  return days
}

export function StatsGraph({ data, height = 200 }: StatsGraphProps) {
  const chartData = data || generateDefaultData()

  return (
    <div className="w-full animate-fade-in">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(124,58,237,0.1)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#A1A1AA', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#A1A1AA', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(18, 18, 26, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#F5F5F5',
            }}
            cursor={{ fill: 'rgba(124,58,237,0.1)' }}
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <Bar
            dataKey="value"
            fill="url(#barGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
