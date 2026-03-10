export type UserStatus = 'working' | 'studying'

export interface WeightProfile {
  sleep: number
  water: number
  discipline: number
  exercise: number
  reading: number
  learning: number
}

export interface ScoreInput {
  sleep: number
  water: number
  discipline: number
  exercise: number
  reading: number
  learning: number
}

export interface DailyRecord extends ScoreInput {
  id: string
  date: string
  totalScore: number
}

export interface UserProfile {
  id: string
  email: string
  name: string
  age: number
  status: UserStatus
}

export const DIMENSIONS = [
  { key: 'sleep', label: 'Sleep' },
  { key: 'water', label: 'Water' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'exercise', label: 'Exercise' },
  { key: 'reading', label: 'Reading' },
  { key: 'learning', label: 'Learning' },
] as const

export type DimensionKey = typeof DIMENSIONS[number]['key']
