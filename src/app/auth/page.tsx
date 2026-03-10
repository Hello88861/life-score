'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', name: '', age: '', status: 'working' })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); setLoading(false); return }
      }
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (result?.error) setError('Invalid email or password')
      else router.push('/dashboard')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-white">LifeScore</h1>
          <p className="text-white/50 mt-1 text-sm">Track habits. See patterns. Live better.</p>
        </div>

        <div className="glass p-6">
          {/* Tab toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
            {(['login', 'register'] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                  ${mode === m ? 'bg-white/15 text-white shadow' : 'text-white/40 hover:text-white/60'}`}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Name</label>
                <input className="input-glass" placeholder="Your name" value={form.name}
                  onChange={(e) => set('name', e.target.value)} required />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Email</label>
              <input className="input-glass" type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => set('email', e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Password</label>
              <input className="input-glass" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={(e) => set('password', e.target.value)} required />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Age</label>
                  <input className="input-glass" type="number" placeholder="Your age" min="10" max="100"
                    value={form.age} onChange={(e) => set('age', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">I am currently</label>
                  <div className="flex gap-2">
                    {[{ value: 'working', label: '💼 Working' }, { value: 'studying', label: '📚 Studying' }].map((opt) => (
                      <button key={opt.value} type="button" onClick={() => set('status', opt.value)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                          ${form.status === opt.value
                            ? 'text-white shadow-lg'
                            : 'text-white/40 border border-white/10 hover:border-white/20'}`}
                        style={form.status === opt.value ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl px-4 py-2.5 text-sm text-red-300"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
