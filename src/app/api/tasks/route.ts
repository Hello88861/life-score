import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id) return null
  return token.id as string
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0]
  const tasks = await prisma.task.findMany({
    where: { userId, date },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, category, time, urgent, important, date } = await req.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const task = await prisma.task.create({
    data: {
      userId,
      title,
      category: category || 'general',
      time: time || '',
      urgent: urgent ?? false,
      important: important ?? false,
      date: date || new Date().toISOString().split('T')[0],
    },
  })
  return NextResponse.json(task)
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, done } = await req.json()
  const task = await prisma.task.update({ where: { id, userId }, data: { done } })
  return NextResponse.json(task)
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id') as string
  await prisma.task.delete({ where: { id, userId } })
  return NextResponse.json({ ok: true })
}
