'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { useLang } from '@/context/LanguageContext'

const DEFAULT: Record<string, string> = {
  sleepBedtime: '23:00',
  sleepWaketime: '07:00',
  waterTarget: '8',
  exerciseTarget: '30',
  readingTarget: '30',
  learningTarget: '60',
}

const FIELDS = [
  { key: 'sleepBedtime',   labelKey: 'bedtime',  icon: '🌙', type: 'time',   unitKey: '' },
  { key: 'sleepWaketime',  labelKey: 'waketime', icon: '☀️', type: 'time',   unitKey: '' },
  { key: 'waterTarget',    labelKey: 'water',    icon: '💧', type: 'number', unitKey: 'waterUnit' },
  { key: 'exerciseTarget', labelKey: 'exercise', icon: '⚡', type: 'number', unitKey: 'exerciseUnit' },
  { key: 'readingTarget',  labelKey: 'reading',  icon: '📖', type: 'number', unitKey: 'readingUnit' },
  { key: 'learningTarget', labelKey: 'learning', icon: '🧠', type: 'number', unitKey: 'learningUnit' },
] as const

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { T } = useLang()
  const [form, setForm] = useState(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/goals').then(r => r.json()).then(data => {
      if (data) {
        setForm({
          sleepBedtime: data.sleepBedtime,
          sleepWaketime: data.sleepWaketime,
          waterTarget: String(data.waterTarget),
          exerciseTarget: String(data.exerciseTarget),
          readingTarget: String(data.readingTarget),
          learningTarget: String(data.learningTarget),
        })
      }
    })
  }, [status])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
    </div>
  }

  const user = session?.user as any

  return (
    <div className="min-h-screen pb-28 pt-20 px-4 max-w-lg mx-auto">
      <NavBar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      <div className="mb-6 relative z-10">
        <p className="text-white/40 text-sm">{T.settings.subtitle}</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">{T.settings.title}</h2>
        <p className="text-white/30 text-xs mt-1">{user?.name} · Age {user?.age} · {user?.status}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-3 relative z-10">
        {FIELDS.map(field => (
          <div key={field.key} className="glass p-4 flex items-center gap-4">
            <span className="text-2xl">{field.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{T.settings[field.labelKey as keyof typeof T.settings] as string}</p>
              {field.unitKey && <p className="text-xs text-white/30">{T.settings[field.unitKey as keyof typeof T.settings] as string}</p>}
            </div>
            <input
              type={field.type}
              value={form[field.key]}
              min={field.type === 'number' ? 1 : undefined}
              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              className="w-28 rounded-xl px-3 py-2 text-sm text-center font-semibold outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
              required
            />
          </div>
        ))}

        <div className="glass p-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm font-medium text-white">{T.settings.disciplineTitle}</p>
              <p className="text-xs text-white/40">{T.settings.disciplineDesc}</p>
            </div>
          </div>
          <p className="text-xs text-white/30 ml-9">{T.settings.disciplineNote}</p>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saved ? T.settings.saved : saving ? T.settings.saving : T.settings.save}
        </button>
      </form>
    </div>
  )
}
