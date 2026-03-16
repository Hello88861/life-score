import type { UserStatus, WeightProfile, ScoreInput } from '@/types'

export function getWeights(age: number, status: UserStatus): WeightProfile {
  if (status === 'studying') {
    if (age <= 22) {
      // Young student: learning and discipline matter most
      return { sleep: 20, water: 10, discipline: 20, exercise: 15, reading: 15, learning: 20 }
    } else {
      // Adult student: health starts to matter more
      return { sleep: 20, water: 15, discipline: 20, exercise: 15, reading: 15, learning: 15 }
    }
  } else {
    if (age <= 30) {
      // Young worker: discipline and career growth
      return { sleep: 20, water: 10, discipline: 25, exercise: 20, reading: 15, learning: 10 }
    } else if (age <= 45) {
      // Mid-career: physical health becomes more critical
      return { sleep: 25, water: 15, discipline: 20, exercise: 25, reading: 10, learning: 5 }
    } else {
      // Senior: body maintenance is the top priority
      return { sleep: 25, water: 20, discipline: 15, exercise: 30, reading: 5, learning: 5 }
    }
  }
}

export function calcTotalScore(input: ScoreInput, age: number, status: UserStatus): number {
  const w = getWeights(age, status)
  const score =
    (input.sleep * w.sleep +
      input.water * w.water +
      input.discipline * w.discipline +
      input.exercise * w.exercise +
      input.reading * w.reading +
      input.learning * w.learning) /
    100
  return Math.round(score * 10) / 10
}

export function getScoreColor(score: number): string {
  if (score >= 8) return '#22c55e'
  if (score >= 6) return '#f59e0b'
  return '#ef4444'
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excellent'
  if (score >= 8) return 'Great'
  if (score >= 7) return 'Good'
  if (score >= 6) return 'Fair'
  if (score >= 5) return 'Average'
  return 'Poor'
}
