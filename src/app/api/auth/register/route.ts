import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, age, status } = await req.json()

    if (!email || !password || !name || !age || !status) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashed, name, age: Number(age), status },
    })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
