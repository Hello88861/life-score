'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/context/LanguageContext'
import { type Lang } from '@/lib/i18n'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const { lang, setLang, T } = useLang()
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
      if (result?.error) setError(T.auth.errorInvalid)
      else router.push('/dashboard')
    } catch {
      setError(T.auth.errorGeneral)
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
        {/* Lang toggle (auth page has no NavBar) */}
        <div className="flex justify-end mb-4">
          <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{T.auth.title}</h1>
          <p className="text-white/50 mt-1 text-sm">{T.auth.subtitle}</p>
        </div>

        <div className="glass p-6">
          {/* Tab toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
            {(['login', 'register'] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${mode === m ? 'bg-white/15 text-white shadow' : 'text-white/40 hover:text-white/60'}`}>
                {m === 'login' ? T.auth.signIn : T.auth.signUp}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">{T.auth.name}</label>
                <input className="input-glass" placeholder={T.auth.namePlaceholder} value={form.name}
                  onChange={(e) => set('name', e.target.value)} required />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">{T.auth.email}</label>
              <input className="input-glass" type="email" placeholder={T.auth.emailPlaceholder} value={form.email}
                onChange={(e) => set('email', e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">{T.auth.password}</label>
              <input className="input-glass" type="password" placeholder={T.auth.passwordPlaceholder} value={form.password}
                onChange={(e) => set('password', e.target.value)} required />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">{T.auth.age}</label>
                  <input className="input-glass" type="number" placeholder={T.auth.agePlaceholder} min="10" max="100"
                    value={form.age} onChange={(e) => set('age', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">{T.auth.iAm}</label>
                  <div className="flex gap-2">
                    {[{ value: 'working', label: T.auth.working }, { value: 'studying', label: T.auth.studying }].map((opt) => (
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
              {loading ? T.auth.loading : mode === 'login' ? T.auth.signIn : T.auth.submitRegister}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
