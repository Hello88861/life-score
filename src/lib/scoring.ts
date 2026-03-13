import type { Goals, DailyInput, DailyRecord, UserStatus } from '@/types'

// ─── Time helpers ─────────────────────────────────────────────
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function timeDiff(actual: string, target: string): number {
  // Signed diff in minutes, handles midnight crossing
  let diff = timeToMinutes(actual) - timeToMinutes(target)
  if (diff > 720) diff -= 1440
  if (diff < -720) diff += 1440
  return diff
}

// ─── Dimension scorers ────────────────────────────────────────

export function scoreSleep(bedtime: string, waketime: string, goals: Goals): number {
  // Bedtime deviation score
  const bedDiff = Math.abs(timeDiff(bedtime, goals.sleepBedtime))
  const bedScore =
    bedDiff <= 5 ? 10 :
    bedDiff <= 10 ? 9 :
    bedDiff <= 20 ? 8 :
    bedDiff <= 30 ? 7 :
    bedDiff <= 45 ? 5 :
    bedDiff <= 60 ? 3 : 1

  // Sleep duration score
  const targetDuration = timeDiff(goals.sleepWaketime, goals.sleepBedtime) + (
    timeToMinutes(goals.sleepWaketime) < timeToMinutes(goals.sleepBedtime) ? 1440 : 0
  )
  let actualDuration = timeToMinutes(waketime) - timeToMinutes(bedtime)
  if (actualDuration < 0) actualDuration += 1440
  const durDiff = Math.abs(actualDuration - targetDuration)
  const durScore =
    durDiff <= 10 ? 10 :
    durDiff <= 20 ? 9 :
    durDiff <= 30 ? 8 :
    durDiff <= 45 ? 7 :
    durDiff <= 60 ? 5 :
    durDiff <= 90 ? 3 : 1

  return Math.round((bedScore * 0.6 + durScore * 0.4) * 10) / 10
}

export function scoreQuantity(actual: number, target: number): number {
  if (target === 0) return 10
  const ratio = actual / target
  return Math.min(10, Math.max(1, Math.round(ratio * 10)))
}

// ─── Weight profile (age + status) ───────────────────────────

interface WeightProfile {
  sleep: number
  water: number
  exercise: number
  reading: number
  learning: number
}

export function getWeights(age: number, status: UserStatus): WeightProfile {
  if (status === 'studying') {
    return age <= 22
      ? { sleep: 20, water: 10, exercise: 15, reading: 25, learning: 30 }
      : { sleep: 20, water: 15, exercise: 15, reading: 25, learning: 25 }
  } else {
    if (age <= 30)  return { sleep: 20, water: 10, exercise: 20, reading: 25, learning: 25 }
    if (age <= 45)  return { sleep: 25, water: 15, exercise: 25, reading: 20, learning: 15 }
    return              { sleep: 25, water: 20, exercise: 30, reading: 15, learning: 10 }
  }
}

// ─── Discipline multiplier (based on last 7 days) ─────────────

const RECENCY_WEIGHTS = [0.30, 0.20, 0.15, 0.12, 0.10, 0.08, 0.05]

export function calcDisciplineMultiplier(recentRecords: DailyRecord[]): {
  multiplier: number
  disciplineScore: number
} {
  if (recentRecords.length < 3) {
    return { multiplier: 1.0, disciplineScore: 5.0 }
  }

  const last7 = recentRecords.slice(-7).reverse() // most recent first
  let weightSum = 0
  let weightedCompletion = 0

  last7.forEach((record, i) => {
    const w = RECENCY_WEIGHTS[i] ?? 0.05
    const scores = [record.sleepScore, record.waterScore, record.exerciseScore,
                    record.readingScore, record.learningScore]
    const dayCompletion = scores.filter(s => s >= 7).length / scores.length
    weightedCompletion += w * dayCompletion
    weightSum += w
  })

  const normalized = weightedCompletion / weightSum  // 0~1
  const disciplineScore = Math.round(normalized * 10 * 10) / 10
  const multiplier = Math.round((0.8 + normalized * 0.4) * 100) / 100

  return { multiplier, disciplineScore }
}

// ─── Main scorer ──────────────────────────────────────────────

export function calcScores(
  input: DailyInput,
  goals: Goals,
  age: number,
  status: UserStatus,
  recentRecords: DailyRecord[]
): {
  sleepScore: number
  waterScore: number
  exerciseScore: number
  readingScore: number
  learningScore: number
  disciplineScore: number
  disciplineMultiplier: number
  totalScore: number
} {
  const sleepScore    = scoreSleep(input.bedtime, input.waketime, goals)
  const waterScore    = scoreQuantity(input.water, goals.waterTarget)
  const exerciseScore = scoreQuantity(input.exercise, goals.exerciseTarget)
  const readingScore  = scoreQuantity(input.reading, goals.readingTarget)
  const learningScore = scoreQuantity(input.learning, goals.learningTarget)

  const w = getWeights(age, status)
  const baseScore =
    (sleepScore    * w.sleep +
     waterScore    * w.water +
     exerciseScore * w.exercise +
     readingScore  * w.reading +
     learningScore * w.learning) / 100

  const { multiplier, disciplineScore } = calcDisciplineMultiplier(recentRecords)
  const totalScore = Math.min(10, Math.round(baseScore * multiplier * 10) / 10)

  return { sleepScore, waterScore, exerciseScore, readingScore, learningScore,
           disciplineScore, disciplineMultiplier: multiplier, totalScore }
}

// ─── UI helpers ───────────────────────────────────────────────

export function getScoreColor(score: number): string {
  if (score >= 8) return '#34d399'
  if (score >= 6) return '#fbbf24'
  return '#f87171'
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excellent'
  if (score >= 8) return 'Great'
  if (score >= 7) return 'Good'
  if (score >= 6) return 'Fair'
  if (score >= 5) return 'Average'
  return 'Poor'
}
