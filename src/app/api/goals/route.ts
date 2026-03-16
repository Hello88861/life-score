import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const goals = await prisma.goals.findUnique({ where: { userId } })
  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const { sleepBedtime, sleepWaketime, waterTarget, exerciseTarget, readingTarget, learningTarget } = await req.json()

  const goals = await prisma.goals.upsert({
    where: { userId },
    update: { sleepBedtime, sleepWaketime, waterTarget: Number(waterTarget),
              exerciseTarget: Number(exerciseTarget), readingTarget: Number(readingTarget),
              learningTarget: Number(learningTarget) },
    create: { userId, sleepBedtime, sleepWaketime, waterTarget: Number(waterTarget),
              exerciseTarget: Number(exerciseTarget), readingTarget: Number(readingTarget),
              learningTarget: Number(learningTarget) },
  })

  return NextResponse.json(goals)
}
