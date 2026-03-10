'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { ScoreSlider } from '@/components/ScoreSlider'
import { getWeights, getScoreColor, getScoreLabel, calcTotalScore } from '@/lib/weights'
import { DIMENSIONS } from '@/types'
import type { UserStatus } from '@/types'

const defaultScores = { sleep: 5, water: 5, discipline: 5, exercise: 5, reading: 5, learning: 5 }

export default function DailyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [scores, setScores] = useState(defaultScores)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [existingId, setExistingId] = useState<string | null>(null)

  const user = session?.user as any
  const age: number = user?.age ?? 25
  const userStatus: UserStatus = user?.status ?? 'working'
  const weights = getWeights(age, userStatus)
  const today = new Date().toISOString().split('T')[0]
  const totalScore = calcTotalScore(scores, age, userStatus)
  const scoreColor = totalScore >= 8 ? '#34d399' : totalScore >= 6 ? '#fbbf24' : '#f87171'

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/records?days=1')
      .then((r) => r.json())
      .then((data: any[]) => {
        const todayRecord = data.find((r) => r.date.startsWith(today))
        if (todayRecord) {
          setExistingId(todayRecord.id)
          setScores({ sleep: todayRecord.sleep, water: todayRecord.water, discipline: todayRecord.discipline,
            exercise: todayRecord.exercise, reading: todayRecord.reading, learning: todayRecord.learning })
        }
      })
  }, [status, today])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, ...scores }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error) }
      else { setSaved(true); setTimeout(() => router.push('/dashboard'), 1200) }
    } catch { setError('Failed to save') }
    finally { setSaving(false) }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
    </div>
  }

  // Score ring
  const r = 38, circ = 2 * Math.PI * r, dash = (totalScore / 10) * circ

  return (
    <div className="min-h-screen pb-28 pt-20 px-4 max-w-lg mx-auto">
      <NavBar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${scoreColor}, transparent)`, transition: 'background 0.5s' }} />
      </div>

      <div className="mb-5 relative z-10">
        <p className="text-white/40 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">{existingId ? 'Update Today' : "Today's Check-in"}</h2>
      </div>

      {/* Live score preview */}
      <div className="glass p-5 mb-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
            <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle cx={40} cy={40} r={r} fill="none" stroke={scoreColor} strokeWidth="6"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${scoreColor})`, transition: 'all 0.3s ease' }} />
            </svg>
            <div className="absolute text-center">
              <p className="text-xl font-bold" style={{ color: scoreColor }}>{totalScore}</p>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{getScoreLabel(totalScore)}</p>
            <p className="text-white/35 text-xs">Current score</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-sm font-medium capitalize">{userStatus}</p>
          <p className="text-white/30 text-xs">Age {age}</p>
        </div>
      </div>

      {/* Sliders */}
      <div className="glass p-5 space-y-7 relative z-10">
        {DIMENSIONS.map((dim) => (
          <ScoreSlider key={dim.key} label={dim.label} value={scores[dim.key]}
            weight={weights[dim.key]} onChange={(v) => setScores((s) => ({ ...s, [dim.key]: v }))} />
        ))}
      </div>

      {error && (
        <div className="mt-3 rounded-2xl px-4 py-3 text-sm text-red-300 relative z-10"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving || saved} className="btn-primary mt-4 relative z-10">
        {saved ? '✓ Saved! Redirecting...' : saving ? 'Saving...' : existingId ? 'Update Record' : 'Save Today'}
      </button>
    </div>
  )
}
