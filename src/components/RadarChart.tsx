'use client'

import { RadarChart as RechartsRadar, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { DailyRecord } from '@/types'

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(20,16,50,0.95)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <p className="text-white/50 text-xs">{payload[0].payload.name}</p>
        <p className="text-white font-bold">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export function RadarChartComp({ record }: { record: DailyRecord }) {
  const data = [
    { name: 'Sleep',      value: record.sleepScore },
    { name: 'Water',      value: record.waterScore },
    { name: 'Exercise',   value: record.exerciseScore },
    { name: 'Reading',    value: record.readingScore },
    { name: 'Learning',   value: record.learningScore },
    { name: 'Discipline', value: record.disciplineScore },
  ].map(d => ({ ...d, fullMark: 10 }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RechartsRadar data={data} outerRadius="68%">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#c084fc" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} />
        <Tooltip content={<CustomTooltip />} />
        <Radar dataKey="value" stroke="#818cf8" fill="url(#radarFill)" strokeWidth={2} />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
