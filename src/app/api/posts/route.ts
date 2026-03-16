import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateSlug } from '@/lib/slug'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const type = req.nextUrl.searchParams.get('type')

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...(type ? { type } : {}),
      OR: [
        { isPublic: true },       // anyone can see public posts
        { userId },               // author can always see own posts
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, content, excerpt, coverUrl, type, isPublic } = body
  if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 })

  const slug = generateSlug(title)
  const userId = (session.user as any).id

  const post = await prisma.post.create({
    data: {
      title, content,
      excerpt: excerpt || '',
      coverUrl: coverUrl || '',
      type: type || 'blog',
      slug,
      userId,
      isPublic: isPublic !== false,
    },
  })
  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const userId = (session.user as any).id

  const post = await prisma.post.findUnique({ where: { id: Number(id) } })
  if (!post || post.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.post.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
