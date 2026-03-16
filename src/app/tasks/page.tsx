'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { useLang } from '@/context/LanguageContext'

interface Task {
  id: string
  title: string
  category: string
  done: boolean
  date: string
  time: string
  urgent: boolean
  important: boolean
}

const QUADRANT_DEFS = [
  { urgent: true,  important: true,  labelKey: 'doFirst',   subKey: 'doFirstSub',   color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: '🔥' },
  { urgent: false, important: true,  labelKey: 'schedule',  subKey: 'scheduleSub',  color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)',  icon: '📅' },
  { urgent: true,  important: false, labelKey: 'delegate',  subKey: 'delegateSub',  color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  icon: '⚡' },
  { urgent: false, important: false, labelKey: 'eliminate', subKey: 'eliminateSub', color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.12)', icon: '🗑️' },
] as const

const CATEGORIES = ['general', 'work', 'study', 'health', 'personal']

function fmt(d: Date) { return d.toISOString().split('T')[0] }

export default function TasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { T } = useLang()

  const [tasks, setTasks] = useState<Task[]>([])
  const [date, setDate] = useState(fmt(new Date()))
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const [newTitle, setNewTitle] = useState('')
  const [newCat, setNewCat] = useState('general')
  const [newTime, setNewTime] = useState('')
  const [newUrgent, setNewUrgent] = useState(false)
  const [newImportant, setNewImportant] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth')
  }, [status, router])

  const load = useCallback(async () => {
    if (status !== 'authenticated') return
    const res = await fetch(`/api/tasks?date=${date}`)
    const data = await res.json()
    setTasks(Array.isArray(data) ? data : [])
  }, [date, status])

  useEffect(() => { load() }, [load])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setLoading(true); setAddError('')
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, category: newCat, time: newTime, urgent: newUrgent, important: newImportant, date }),
    })
    if (!res.ok) { const d = await res.json(); setAddError(d.error || 'Failed'); setLoading(false); return }
    setNewTitle(''); setNewTime(''); setNewUrgent(false); setNewImportant(false)
    setShowForm(false)
    await load()
    setLoading(false)
  }

  async function toggleDone(task: Task) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, done: !task.done }),
    })
    setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t))
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    setTasks(ts => ts.filter(t => t.id !== id))
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
    </div>
  )

  const done = tasks.filter(t => t.done).length
  const total = tasks.length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="min-h-screen pb-28 pt-20 px-4 max-w-lg mx-auto">
      <NavBar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-40 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <p className="text-white/40 text-sm">{new Date(date).toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h2 className="text-2xl font-bold text-white mt-0.5">{T.tasks.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }} />
          <button onClick={() => setShowForm(f => !f)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
            style={{ background: showForm ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
            {showForm ? '✕' : '+'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="glass p-4 mb-4 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">{done}/{total} {T.tasks.completed}</span>
            <span className="text-lg font-bold" style={{ color: pct === 100 ? '#6ee7b7' : '#818cf8' }}>
              {pct}% {pct === 100 ? '🎉' : ''}
            </span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct === 100 ? '#6ee7b7' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={addTask} className="glass p-4 mb-4 space-y-3 relative z-10">
          <input type="text" placeholder={T.tasks.placeholder} value={newTitle} onChange={e => setNewTitle(e.target.value)} required autoFocus
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none text-white"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />

          <div className="flex gap-2 flex-wrap">
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
              className="rounded-xl px-3 py-2 text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }} />
            <select value={newCat} onChange={e => setNewCat(e.target.value)}
              className="rounded-xl px-3 py-2 text-xs outline-none capitalize flex-1"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#000000', color: 'white' }}>{c}</option>)}
            </select>
          </div>

          {/* Quadrant picker */}
          <div className="grid grid-cols-2 gap-2">
            {QUADRANT_DEFS.map(q => {
              const sel = newUrgent === q.urgent && newImportant === q.important
              return (
                <button key={q.labelKey} type="button"
                  onClick={() => { setNewUrgent(q.urgent); setNewImportant(q.important) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                  style={{ background: sel ? q.bg : 'rgba(255,255,255,0.04)', border: `1px solid ${sel ? q.border : 'rgba(255,255,255,0.08)'}` }}>
                  <span className="text-sm">{q.icon}</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: sel ? q.color : 'rgba(255,255,255,0.5)' }}>
                      {T.tasks[q.labelKey as keyof typeof T.tasks] as string}
                    </p>
                    <p className="text-xs text-white/25">{T.tasks[q.subKey as keyof typeof T.tasks] as string}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <button type="submit" disabled={loading || !newTitle.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', opacity: loading || !newTitle.trim() ? 0.5 : 1 }}>
            {loading ? T.tasks.adding : T.tasks.addTask}
          </button>
          {addError && <p className="text-xs text-red-400 mt-2">{addError}</p>}
        </form>
      )}

      {/* Quadrant cards */}
      {total === 0 ? (
        <div className="glass p-10 text-center relative z-10">
          <p className="text-4xl mb-3">✦</p>
          <p className="text-white/60 text-sm">{T.tasks.noTasks}</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            {T.tasks.addFirst}
          </button>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {QUADRANT_DEFS.map(q => {
            const qtasks = tasks.filter(t => t.urgent === q.urgent && t.important === q.important)
            if (qtasks.length === 0) return null
            const qdone = qtasks.filter(t => t.done).length
            return (
              <div key={q.labelKey} className="rounded-2xl p-4"
                style={{ background: q.bg, border: `1px solid ${q.border}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span>{q.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: q.color }}>
                      {T.tasks[q.labelKey as keyof typeof T.tasks] as string}
                    </p>
                    <p className="text-xs text-white/25">{T.tasks[q.subKey as keyof typeof T.tasks] as string}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white/30"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {qdone}/{qtasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {qtasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 group"
                      style={{ background: 'rgba(0,0,0,0.25)' }}>
                      <button onClick={() => toggleDone(task)}
                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ border: `2px solid ${task.done ? q.color : 'rgba(255,255,255,0.2)'}`, background: task.done ? `${q.color}25` : 'transparent' }}>
                        {task.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={q.color} strokeWidth="3.5"><path d="M20 6L9 17l-5-5"/></svg>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: task.done ? 'rgba(255,255,255,0.3)' : 'white', textDecoration: task.done ? 'line-through' : 'none' }}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.time && <span className="text-xs text-white/25">🕐 {task.time}</span>}
                          <span className="text-xs text-white/20 capitalize">{task.category}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-white/50 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
