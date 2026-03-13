'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { getScoreColor, getScoreLabel } from '@/lib/weights'
import type { DailyRecord } from '@/types'

const DIMS = [
  { key: 'sleepScore', label: 'Sleep', icon: '🌙' },
  { key: 'waterScore', label: 'Water', icon: '💧' },
  { key: 'disciplineScore', label: 'Discipline', icon: '🎯' },
  { key: 'exerciseScore', label: 'Exercise', icon: '⚡' },
  { key: 'readingScore', label: 'Reading', icon: '📖' },
  { key: 'learningScore', label: 'Learning', icon: '🧠' },
] as const
type DimKey = typeof DIMS[number]['key']

function MiniBar({ value }: { value: number }) {
  const color = value >= 8 ? '#34d399' : value >= 6 ? '#fbbf24' : '#f87171'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(value / 10) * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold w-4 text-right" style={{ color }}>{value}</span>
    </div>
  )
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/records?days=90')
      .then((r) => r.json())
      .then((data) => { setRecords([...data].reverse()); setLoading(false) })
  }, [status])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
    </div>
  }

  return (
    <div className="min-h-screen pb-28 pt-20 px-4 max-w-lg mx-auto">
      <NavBar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-40 right-0 w-60 h-60 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      </div>

      <div className="mb-6 relative z-10">
        <p className="text-white/40 text-sm">Last 90 days</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">History</h2>
        {records.length > 0 && <p className="text-white/30 text-sm mt-1">{records.length} records logged</p>}
      </div>

      {records.length === 0 ? (
        <div className="glass p-10 text-center relative z-10">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-white font-semibold">No records yet</p>
          <p className="text-white/40 text-sm mt-1">Start logging your daily habits</p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {records.map((record) => {
            const isOpen = expanded === record.id
            const dateStr = new Date(record.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
            })
            const color = getScoreColor(record.totalScore)
            const score = record.totalScore

            return (
              <div key={record.id} className="glass overflow-hidden transition-all duration-300 cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : record.id)}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Mini ring */}
                    <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
                      <svg width={44} height={44} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={22} cy={22} r={18} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                        <circle cx={22} cy={22} r={18} fill="none" stroke={color} strokeWidth="4"
                          strokeDasharray={`${(score / 10) * 2 * Math.PI * 18} ${2 * Math.PI * 18}`}
                          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
                      </svg>
                      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{dateStr}</p>
                      <p className="text-xs font-medium" style={{ color }}>{getScoreLabel(score)}</p>
                    </div>
                  </div>
                  <span className="text-white/20 text-sm transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
                    ▼
                  </span>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 border-t space-y-3 pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {DIMS.map((dim) => (
                      <div key={dim.key} className="flex items-center gap-3">
                        <span className="text-base w-5">{dim.icon}</span>
                        <span className="text-xs text-white/50 w-20">{dim.label}</span>
                        <div className="flex-1">
                          <MiniBar value={record[dim.key as DimKey] as number} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
