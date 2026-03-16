import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      records: {
        where: { date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'desc' },
        select: { totalScore: true, date: true },
      },
    },
  })

  const leaderboard = users
    .map((u) => {
      const records = u.records
      if (records.length === 0) return null

      const avg = Math.round(
        (records.reduce((s, r) => s + r.totalScore, 0) / records.length) * 10
      ) / 10

      const best = Math.max(...records.map((r) => r.totalScore))

      // Current streak: consecutive days with score >= 6 (most recent first)
      let streak = 0
      for (const r of records) {
        if (r.totalScore >= 6) streak++
        else break
      }

      return {
        id: u.id,
        name: u.name,
        status: u.status,
        avg,
        best: Math.round(best * 10) / 10,
        days: records.length,
        streak,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b!.avg - a!.avg)

  return NextResponse.json(leaderboard)
}
