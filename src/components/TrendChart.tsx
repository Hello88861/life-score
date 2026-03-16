'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts'
import type { DailyRecord } from '@/types'

interface TrendChartProps {
  records: DailyRecord[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const v = payload[0].value
    const color = v >= 8 ? '#34d399' : v >= 6 ? '#fbbf24' : '#f87171'
    return (
      <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(20,16,50,0.95)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <p className="text-white/50 text-xs mb-1">{label}</p>
        <p className="text-xl font-bold" style={{ color }}>{v.toFixed(1)}</p>
      </div>
    )
  }
  return null
}

export function TrendChart({ records }: TrendChartProps) {
  const data = records.map((r) => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: r.totalScore,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={7} stroke="rgba(52,211,153,0.3)" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2.5}
          fill="url(#scoreGrad)" dot={{ r: 3, fill: '#818cf8', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#818cf8', strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
