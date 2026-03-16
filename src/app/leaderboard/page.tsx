'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { NavBar } from '@/components/NavBar'
import { getScoreColor } from '@/lib/weights'
import { useLang } from '@/context/LanguageContext'

type Entry = {
  id: string
  name: string
  status: string
  avg: number
  best: number
  days: number
  streak: number
}

const MEDAL = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const { T } = useLang()
  const [board, setBoard] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => { setBoard(data); setLoading(false) })
  }, [])

  const me = (session?.user as any)?.id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28 pt-20 px-4 max-w-lg mx-auto">
      <NavBar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
        <div className="absolute bottom-40 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      </div>

      <div className="mb-6 relative z-10">
        <p className="text-white/40 text-sm">{T.leaderboard.subtitle}</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">{T.leaderboard.title}</h2>
        {board.length > 0 && (
          <p className="text-white/30 text-sm mt-1">{board.length} {T.leaderboard.activeUsers}</p>
        )}
      </div>

      {board.length === 0 ? (
        <div className="glass p-12 text-center relative z-10">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-white font-semibold">{T.leaderboard.empty}</p>
          <p className="text-white/40 text-sm mt-1">{T.leaderboard.emptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {board.map((entry, i) => {
            const isMe = entry.id === me
            const color = getScoreColor(entry.avg)

            return (
              <div key={entry.id}
                className="glass p-4 flex items-center gap-4 transition-all duration-200"
                style={isMe ? { border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.1)' } : {}}>

                {/* Rank */}
                <div className="w-9 text-center flex-shrink-0">
                  {i < 3 ? (
                    <span className="text-2xl">{MEDAL[i]}</span>
                  ) : (
                    <span className="text-white/25 font-bold text-sm">#{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${color}55, ${color}22)`, border: `1px solid ${color}44` }}>
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-white text-sm truncate">{entry.name}</p>
                    {isMe && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                        {T.leaderboard.you}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-white/30">{entry.days}{T.leaderboard.daysLogged}</span>
                    {entry.streak > 0 && (
                      <span className="text-xs text-white/30">🔥 {entry.streak} {T.leaderboard.streak}</span>
                    )}
                    <span className="text-xs text-white/25 capitalize">{entry.status}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold" style={{ color }}>{entry.avg}</p>
                  <p className="text-xs text-white/25">{T.leaderboard.avg} · {T.leaderboard.best} {entry.best}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
