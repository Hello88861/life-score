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

export interface Goals {
  sleepBedtime: string   // "23:00"
  sleepWaketime: string  // "07:00"
  waterTarget: number
  exerciseTarget: number
  readingTarget: number
  learningTarget: number
}

export interface DailyInput {
  bedtime: string
  waketime: string
  water: number
  exercise: number
  reading: number
  learning: number
}

export interface DailyRecord extends DailyInput {
  id: string
  date: string
  sleepScore: number
  waterScore: number
  exerciseScore: number
  readingScore: number
  learningScore: number
  disciplineScore: number
  disciplineMultiplier: number
  totalScore: number
}

export interface UserProfile {
  id: string
  email: string
  name: string
  age: number
  status: UserStatus
}

export const SCORE_DIMENSIONS = [
  { key: 'sleepScore',    label: 'Sleep',    icon: '🌙' },
  { key: 'waterScore',    label: 'Water',    icon: '💧' },
  { key: 'exerciseScore', label: 'Exercise', icon: '⚡' },
  { key: 'readingScore',  label: 'Reading',  icon: '📖' },
  { key: 'learningScore', label: 'Learning', icon: '🧠' },
] as const
