'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { getScoreColor, getScoreLabel, scoreSleep, scoreQuantity, getWeights, calcDisciplineMultiplier } from '@/lib/scoring'
import { useLang } from '@/context/LanguageContext'
import type { Goals, DailyRecord, UserStatus } from '@/types'

const DEFAULT_INPUT = { bedtime: '23:00', waketime: '07:00', water: 0, exercise: 0, reading: 0, learning: 0 }
const DEFAULT_GOALS = { sleepBedtime: '23:00', sleepWaketime: '07:00', waterTarget: '8', exerciseTarget: '30', readingTarget: '30', learningTarget: '60' }

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  return (
    <div className="w-full h-1.5 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function DailyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { T } = useLang()
  const [tab, setTab] = useState<'log' | 'goals'>('log')
  const [input, setInput] = useState(DEFAULT_INPUT)
  const [goals, setGoals] = useState<Goals | null>(null)
  const [goalForm, setGoalForm] = useState(DEFAULT_GOALS)
  const [recentRecords, setRecentRecords] = useState<DailyRecord[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [goalSaving, setGoalSaving] = useState(false)
  const [goalSaved, setGoalSaved] = useState(false)
  const [error, setError] = useState('')
  const [hasExisting, setHasExisting] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const user = session?.user as any
  const age: number = user?.age ?? 25
  const userStatus: UserStatus = user?.status ?? 'working'

  useEffect(() => { if (status === 'unauthenticated') router.replace('/auth') }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/goals').then(r => r.json()).then(data => {
      if (data && data.sleepBedtime) {
        setGoals(data)
        setGoalForm({
          sleepBedtime: data.sleepBedtime, sleepWaketime: data.sleepWaketime,
          waterTarget: String(data.waterTarget), exerciseTarget: String(data.exerciseTarget),
          readingTarget: String(data.readingTarget), learningTarget: String(data.learningTarget),
        })
      } else {
        setTab('goals')
      }
    })
    fetch('/api/records?days=8').then(r => r.json()).then((data: DailyRecord[]) => {
      setRecentRecords(data)
      const rec = data.find(r => r.date.startsWith(today))
      if (rec) {
        setHasExisting(true)
        setInput({ bedtime: rec.bedtime, waketime: rec.waketime, water: rec.water, exercise: rec.exercise, reading: rec.reading, learning: rec.learning })
      }
    })
  }, [status, today])

  const liveScores = goals ? {
    sleep: scoreSleep(input.bedtime, input.waketime, goals),
    water: scoreQuantity(input.water, goals.waterTarget),
    exercise: scoreQuantity(input.exercise, goals.exerciseTarget),
    reading: scoreQuantity(input.reading, goals.readingTarget),
    learning: scoreQuantity(input.learning, goals.learningTarget),
  } : null

  const w = getWeights(age, userStatus)
  const { multiplier } = calcDisciplineMultiplier(recentRecords)
  const baseScore = liveScores
    ? (liveScores.sleep * w.sleep + liveScores.water * w.water + liveScores.exercise * w.exercise +
       liveScores.reading * w.reading + liveScores.learning * w.learning) / 100 : 0
  const totalScore = Math.min(10, Math.round(baseScore * multiplier * 10) / 10)
  const scoreColor = getScoreColor(totalScore)
  const R = 38, circ = 2 * Math.PI * R, dash = (totalScore / 10) * circ

  async function handleSaveLog(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await fetch('/api/records', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, ...input }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error) }
      else { setSaved(true); setTimeout(() => { setSaved(false); router.push('/dashboard') }, 1200) }
    } catch { setError('Failed to save') }
    finally { setSaving(false) }
  }

  async function handleSaveGoals(e: React.FormEvent) {
    e.preventDefault(); setGoalSaving(true)
    await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(goalForm) })
    const data = await fetch('/api/goals').then(r => r.json())
    if (data) setGoals(data)
    setGoalSaved(true); setGoalSaving(false)
    setTimeout(() => { setGoalSaved(false); setTab('log') }, 1500)
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pb-28 pt-20 px-4 max-w-lg mx-auto">
      <NavBar />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10 transition-all duration-700"
          style={{ background: `radial-gradient(circle, ${scoreColor}, transparent)` }} />
      </div>

      <div className="mb-4 relative z-10">
        <p className="text-white/40 text-sm">{new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">{T.daily.title}</h2>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 p-1 rounded-2xl relative z-10" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {(['log', 'goals'] as const).map(key => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab === key ? 'rgba(99,102,241,0.25)' : 'transparent',
              border: `1px solid ${tab === key ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
              color: tab === key ? '#a5b4fc' : 'rgba(255,255,255,0.35)',
            }}>
            {key === 'log' ? (hasExisting ? T.daily.tabUpdate : T.daily.tabLog) : T.daily.tabGoals}
          </button>
        ))}
      </div>

      {/* LOG TAB */}
      {tab === 'log' && (
        <>
          <div className="glass p-4 mb-4 flex items-center gap-4 relative z-10">
            <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
              <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={40} cy={40} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle cx={40} cy={40} r={R} fill="none" stroke={scoreColor} strokeWidth="6"
                  strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${scoreColor})`, transition: 'all 0.3s ease' }} />
              </svg>
              <div className="absolute text-center">
                <p className="text-xl font-bold" style={{ color: scoreColor }}>{totalScore}</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-lg">{getScoreLabel(totalScore)}</p>
              <p className="text-white/35 text-xs">{T.daily.discipline} ×{multiplier}</p>
              {!goals && (
                <button onClick={() => setTab('goals')} className="text-xs text-indigo-400 mt-1 underline">
                  {T.daily.setGoalsFirst}
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveLog} className="space-y-2 relative z-10">
            {([
              { key: 'bedtime',  labelKey: 'bedtime',  icon: '🌙', type: 'time',   goalKey: '',              unitKey: '' },
              { key: 'waketime', labelKey: 'waketime', icon: '☀️', type: 'time',   goalKey: '',              unitKey: '' },
              { key: 'water',    labelKey: 'water',    icon: '💧', type: 'number', goalKey: 'waterTarget',    unitKey: 'glasses' },
              { key: 'exercise', labelKey: 'exercise', icon: '⚡', type: 'number', goalKey: 'exerciseTarget', unitKey: 'min' },
              { key: 'reading',  labelKey: 'reading',  icon: '📖', type: 'number', goalKey: 'readingTarget',  unitKey: 'min' },
              { key: 'learning', labelKey: 'learning', icon: '🧠', type: 'number', goalKey: 'learningTarget', unitKey: 'min' },
            ] as const).map(field => {
              const goalVal = field.goalKey && goals ? (goals as any)[field.goalKey] : null
              const actualVal = (input as any)[field.key]
              const scoreKey = (field.key === 'bedtime' || field.key === 'waketime') ? 'sleep' : field.key
              const dimScore = liveScores ? (liveScores as any)[scoreKey] : null
              const label = T.daily[field.labelKey as keyof typeof T.daily] as string
              const unit = field.unitKey ? T.daily[field.unitKey as keyof typeof T.daily] as string : ''
              return (
                <div key={field.key} className="glass p-3 flex items-center gap-3">
                  <span className="text-xl w-7 text-center">{field.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{label}</p>
                      {dimScore !== null && field.key !== 'waketime' && (
                        <span className="text-xs font-bold" style={{ color: getScoreColor(dimScore) }}>{dimScore}/10</span>
                      )}
                    </div>
                    {goalVal !== null && field.type === 'number' && (
                      <>
                        <Bar value={Number(actualVal)} max={Number(goalVal)} color={dimScore !== null ? getScoreColor(dimScore) : '#818cf8'} />
                        <p className="text-xs text-white/25 mt-0.5">{T.daily.goalLabel}: {goalVal} {unit}</p>
                      </>
                    )}
                    {field.key === 'bedtime' && goals && (
                      <p className="text-xs text-white/25 mt-0.5">{T.daily.bedtimeTarget}: {goals.sleepBedtime}</p>
                    )}
                  </div>
                  <input
                    type={field.type}
                    value={actualVal}
                    min={field.type === 'number' ? 0 : undefined}
                    onChange={e => setInput(s => ({
                      ...s,
                      [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                    }))}
                    className="rounded-xl px-3 py-2 text-sm text-center font-semibold outline-none"
                    style={{ width: '90px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                  />
                </div>
              )
            })}
            {error && (
              <div className="rounded-2xl px-4 py-3 text-sm text-red-300"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={saving || saved}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all"
              style={{ background: saved ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: '1px solid rgba(99,102,241,0.4)' }}>
              {saved ? T.daily.saved : saving ? T.daily.saving : hasExisting ? T.daily.update : T.daily.save}
            </button>
          </form>
        </>
      )}

      {/* GOALS TAB */}
      {tab === 'goals' && (
        <form onSubmit={handleSaveGoals} className="space-y-2 relative z-10">
          <div className="glass p-4 mb-1">
            <p className="text-sm text-white/50">{T.daily.goalsDesc}</p>
          </div>
          {([
            { key: 'sleepBedtime',   labelKey: 'bedtime',  icon: '🌙', type: 'time',   unitKey: '' },
            { key: 'sleepWaketime',  labelKey: 'waketime', icon: '☀️', type: 'time',   unitKey: '' },
            { key: 'waterTarget',    labelKey: 'water',    icon: '💧', type: 'number', unitKey: 'glasses' },
            { key: 'exerciseTarget', labelKey: 'exercise', icon: '⚡', type: 'number', unitKey: 'min' },
            { key: 'readingTarget',  labelKey: 'reading',  icon: '📖', type: 'number', unitKey: 'min' },
            { key: 'learningTarget', labelKey: 'learning', icon: '🧠', type: 'number', unitKey: 'min' },
          ] as const).map(field => (
            <div key={field.key} className="glass p-3 flex items-center gap-3">
              <span className="text-xl w-7 text-center">{field.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{T.daily[field.labelKey as keyof typeof T.daily] as string}</p>
                {field.unitKey && <p className="text-xs text-white/30">{T.daily[field.unitKey as keyof typeof T.daily] as string}</p>}
              </div>
              <input
                type={field.type}
                value={(goalForm as any)[field.key]}
                min={field.type === 'number' ? 1 : undefined}
                onChange={e => setGoalForm(f => ({ ...f, [field.key]: e.target.value }))}
                required
                className="rounded-xl px-3 py-2 text-sm text-center font-semibold outline-none"
                style={{ width: '90px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
              />
            </div>
          ))}
          <div className="glass p-3 flex items-center gap-3">
            <span className="text-xl w-7 text-center">🎯</span>
            <div>
              <p className="text-sm font-medium text-white">{T.settings.disciplineTitle}</p>
              <p className="text-xs text-white/30">{T.daily.disciplineAuto}</p>
            </div>
          </div>
          <button type="submit" disabled={goalSaving}
            className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all"
            style={{ background: goalSaved ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: '1px solid rgba(99,102,241,0.4)' }}>
            {goalSaved ? T.daily.savedGoals : goalSaving ? T.daily.savingGoals : T.daily.saveGoals}
          </button>
        </form>
      )}
    </div>
  )
}
