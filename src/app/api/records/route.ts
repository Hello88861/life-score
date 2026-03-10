import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calcTotalScore } from '@/lib/weights'
import type { UserStatus } from '@/types'

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

  const { date, sleep, water, discipline, exercise, reading, learning } = await req.json()

  if ([sleep, water, discipline, exercise, reading, learning].some((v) => v < 1 || v > 10)) {
    return NextResponse.json({ error: 'Scores must be between 1 and 10' }, { status: 400 })
  }

  const totalScore = calcTotalScore({ sleep, water, discipline, exercise, reading, learning }, age, status)
  const parsedDate = new Date(date)

  const record = await prisma.dailyRecord.upsert({
    where: { userId_date: { userId, date: parsedDate } },
    update: { sleep, water, discipline, exercise, reading, learning, totalScore },
    create: { userId, date: parsedDate, sleep, water, discipline, exercise, reading, learning, totalScore },
  })

  return NextResponse.json(record, { status: 201 })
}
