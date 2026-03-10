'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { TrendChart } from '@/components/TrendChart'
import { RadarChartComp } from '@/components/RadarChart'
import { getScoreColor, getScoreLabel } from '@/lib/weights'
import type { DailyRecord } from '@/types'

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const color = score >= 8 ? '#34d399' : score >= 6 ? '#fbbf24' : '#f87171'
  const r = 44
  const circ = 2 * Math.PI * r
  const dash = (score / 10) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div className="absolute text-center">
        <p className="font-bold leading-none" style={{ fontSize: size * 0.28, color }}>{score}</p>
        <p className="text-white/40 leading-none mt-0.5" style={{ fontSize: size * 0.1 }}>/ 10</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/records?days=30')
      .then((r) => r.json())
      .then((data) => { setRecords(data); setLoading(false) })
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  const latest = records[records.length - 1]
  const avg = records.length
    ? Math.round((records.reduce((s, r) => s + r.totalScore, 0) / records.length) * 10) / 10 : 0
  const user = session?.user as any
  const todayLogged = latest && new Date(latest.date).toDateString() === new Date().toDateString()

  return (
    <div className="min-h-screen pb-28 pt-20 px-4 max-w-lg mx-auto">
      <NavBar />

      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-40 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      {/* Header */}
      <div className="mb-6 relative z-10">
        <p className="text-white/40 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="text-2xl font-bold text-white mt-0.5">Hello, {user?.name} 👋</h2>
      </div>

      {records.length === 0 ? (
        <div className="glass p-8 text-center relative z-10">
          <p className="text-5xl mb-4">🌱</p>
          <p className="text-white font-semibold text-lg">Start your journey</p>
          <p className="text-white/40 text-sm mt-1 mb-6">Log your first day to unlock insights</p>
          <button onClick={() => router.push('/daily')} className="btn-primary">Log Today's Habits</button>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {/* Score cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Today */}
            <div className="glass p-5 flex flex-col items-center">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Today</p>
              {todayLogged ? (
                <>
                  <ScoreRing score={latest.totalScore} />
                  <p className="text-xs font-semibold mt-3" style={{ color: getScoreColor(latest.totalScore) }}>
                    {getScoreLabel(latest.totalScore)}
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
                    style={{ border: '2px dashed rgba(255,255,255,0.15)' }}>
                    <span className="text-2xl">✦</span>
                  </div>
                  <button onClick={() => router.push('/daily')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors">
                    Log now →
                  </button>
                </div>
              )}
            </div>

            {/* 30-day avg */}
            <div className="glass p-5 flex flex-col items-center">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">30-Day Avg</p>
              <ScoreRing score={avg} />
              <p className="text-xs text-white/30 mt-3">{records.length} days tracked</p>
            </div>
          </div>

          {/* Trend */}
          <div className="glass p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Score Trend</h3>
              <span className="text-xs text-white/30">Last 30 days</span>
            </div>
            <TrendChart records={records} />
          </div>

          {/* Radar */}
          {todayLogged && (
            <div className="glass p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-white">Today's Breakdown</h3>
                <span className="text-xs text-white/30">All dimensions</span>
              </div>
              <RadarChartComp record={latest} />
            </div>
          )}

          {/* Stats row */}
          {records.length >= 3 && (() => {
            const best = Math.max(...records.map(r => r.totalScore))
            const streak = (() => {
              let s = 0
              for (let i = records.length - 1; i >= 0; i--) {
                if (records[i].totalScore >= 6) s++; else break
              }
              return s
            })()
            return (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Best Score', value: best.toFixed(1), icon: '🏆' },
                  { label: 'Days Tracked', value: records.length, icon: '📅' },
                  { label: 'Good Streak', value: `${streak}d`, icon: '🔥' },
                ].map((stat) => (
                  <div key={stat.label} className="glass p-3.5 text-center">
                    <p className="text-xl mb-1">{stat.icon}</p>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/30 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
