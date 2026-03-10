'use client'

const ICONS: Record<string, string> = {
  Sleep: '🌙', Water: '💧', Discipline: '🎯', Exercise: '⚡', Reading: '📖', Learning: '🧠',
}

interface ScoreSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  weight: number
}

function getColor(v: number) {
  if (v >= 8) return { color: '#34d399', glow: 'rgba(52,211,153,0.4)' }
  if (v >= 6) return { color: '#fbbf24', glow: 'rgba(251,191,36,0.4)' }
  return { color: '#f87171', glow: 'rgba(248,113,113,0.4)' }
}

export function ScoreSlider({ label, value, onChange, weight }: ScoreSliderProps) {
  const { color, glow } = getColor(value)
  const pct = ((value - 1) / 9) * 100

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{ICONS[label] ?? '•'}</span>
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-white/35">weight {weight}%</p>
          </div>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg transition-all duration-200"
          style={{ background: `rgba(${color === '#34d399' ? '52,211,153' : color === '#fbbf24' ? '251,191,36' : '248,113,113'},0.15)`, color, boxShadow: `0 0 12px ${glow}`, border: `1px solid ${color}40` }}>
          {value}
        </div>
      </div>

      <div className="relative px-1">
        <input
          type="range" min={1} max={10} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-white/20 px-1">
        <span>Poor</span>
        <span>Average</span>
        <span>Excellent</span>
      </div>
    </div>
  )
}
