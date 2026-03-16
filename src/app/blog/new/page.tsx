'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { useLang } from '@/context/LanguageContext'

export default function NewPostPage() {
  const router = useRouter()
  const { T } = useLang()
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', coverUrl: '', type: 'blog', isPublic: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const post = await res.json()
      router.push(`/blog/${post.slug}`)
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to publish')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-28">
      <NavBar />
      <div className="max-w-2xl mx-auto px-6 mt-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()}
            className="text-sm text-white/40 hover:text-white/70 transition-colors">
            {T.newPost.back}
          </button>
          <h1 className="text-2xl font-light text-white/90">{T.newPost.title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {['blog', 'journal'].map(tp => (
              <button key={tp} type="button"
                onClick={() => setForm(s => ({ ...s, type: tp }))}
                className="px-4 py-1.5 rounded-lg text-sm capitalize transition-all"
                style={{
                  background: form.type === tp ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${form.type === tp ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: form.type === tp ? '#a5b4fc' : '#94a3b8',
                }}>
                {tp}
              </button>
            ))}
          </div>

          <input
            type="text" placeholder={T.newPost.titlePlaceholder}
            value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
            required
            className="w-full rounded-xl px-4 py-3 text-xl font-semibold outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
          />

          <input
            type="text" placeholder={T.newPost.excerptPlaceholder}
            value={form.excerpt} onChange={e => setForm(s => ({ ...s, excerpt: e.target.value }))}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          />

          <input
            type="url" placeholder={T.newPost.coverPlaceholder}
            value={form.coverUrl} onChange={e => setForm(s => ({ ...s, coverUrl: e.target.value }))}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          />

          <textarea
            placeholder={T.newPost.contentPlaceholder}
            value={form.content} onChange={e => setForm(s => ({ ...s, content: e.target.value }))}
            required rows={18}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', lineHeight: '1.8', fontFamily: 'Georgia, serif' }}
          />

          {/* Visibility toggle */}
          <div className="glass p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{T.newPost.visibility}</p>
              <p className="text-xs text-white/40 mt-0.5">
                {form.isPublic ? T.newPost.visPublic : T.newPost.visPrivate}
              </p>
            </div>
            <button type="button" onClick={() => setForm(s => ({ ...s, isPublic: !s.isPublic }))}
              className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
              style={{ background: form.isPublic ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)' }}>
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                style={{ left: form.isPublic ? '1.375rem' : '0.125rem' }} />
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
              {saving ? T.newPost.publishing : T.newPost.publish}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-6 py-3.5 rounded-2xl text-white/50 hover:text-white/80 transition-colors text-sm font-semibold"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              {T.newPost.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
