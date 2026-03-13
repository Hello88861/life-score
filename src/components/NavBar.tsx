'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/daily',     label: 'Today',     icon: '✦' },
  { href: '/tasks',     label: 'Tasks',     icon: '☑' },
  { href: '/history',   label: 'History',   icon: '◷' },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-10 px-5 py-4 flex justify-between items-center"
        style={{ background: 'rgba(15,12,41,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          LifeScore
        </span>
        <button onClick={() => signOut({ callbackUrl: '/auth' })}
          className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          Sign out
        </button>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex px-4 py-2 pb-6 gap-1"
        style={{ background: 'rgba(15,12,41,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center py-2 gap-0.5 rounded-2xl transition-all duration-200"
              style={active ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' } : {}}>
              <span className={`text-lg transition-all duration-200 ${active ? 'scale-110' : 'opacity-40'}`}
                style={active ? { filter: 'drop-shadow(0 0 6px #818cf8)' } : {}}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium transition-colors duration-200 ${active ? 'text-indigo-300' : 'text-white/30'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
