import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calcScores } from '@/lib/scoring'
import type { UserStatus, Goals, DailyRecord } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '30')
  const since = new Date()
  since.setDate(since.getDate() - days)

  const records = await prisma.dailyRecord.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const age = (session.user as any).age as number
  const status = (session.user as any).status as UserStatus

  const goalsData = await prisma.goals.findUnique({ where: { userId } })
  if (!goalsData) return NextResponse.json({ error: 'Please set your goals first' }, { status: 400 })

  const goals: Goals = {
    sleepBedtime: goalsData.sleepBedtime,
    sleepWaketime: goalsData.sleepWaketime,
    waterTarget: goalsData.waterTarget,
    exerciseTarget: goalsData.exerciseTarget,
    readingTarget: goalsData.readingTarget,
    learningTarget: goalsData.learningTarget,
  }

  const { date, bedtime, waketime, water, exercise, reading, learning } = await req.json()

  // Fetch recent records for discipline calculation
  const since = new Date()
  since.setDate(since.getDate() - 7)
  const recentRaw = await prisma.dailyRecord.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: 'asc' },
  })
  const recentRecords = recentRaw as unknown as DailyRecord[]

  const scores = calcScores(
    { bedtime, waketime, water: Number(water), exercise: Number(exercise),
      reading: Number(reading), learning: Number(learning) },
    goals, age, status, recentRecords
  )

  const parsedDate = new Date(date)
  const record = await prisma.dailyRecord.upsert({
    where: { userId_date: { userId, date: parsedDate } },
    update: { bedtime, waketime, water: Number(water), exercise: Number(exercise),
              reading: Number(reading), learning: Number(learning), ...scores },
    create: { userId, date: parsedDate, bedtime, waketime, water: Number(water),
              exercise: Number(exercise), reading: Number(reading),
              learning: Number(learning), ...scores },
  })

  return NextResponse.json(record, { status: 201 })
}
