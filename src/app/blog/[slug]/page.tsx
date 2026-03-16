import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NavBar } from '@/components/NavBar'
import { prisma } from '@/lib/db'
import { marked } from 'marked'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { user: { select: { name: true, status: true } } },
  })
  if (!post) notFound()

  // Private post: only accessible by the author
  const myId = (session?.user as any)?.id
  if (!post.isPublic && post.userId !== myId) notFound()

  const htmlContent = marked(post.content)

  return (
    <div className="min-h-screen pt-20 pb-28">
      <NavBar />

      {post.coverUrl && (
        <div className="w-full h-64 md:h-96 overflow-hidden relative">
          <img src={post.coverUrl} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.45)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #0f0c29)' }} />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 mt-8">
        <Link href="/blog" className="text-sm mb-6 inline-block text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Back to Blog
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
            {post.type}
          </span>
          {!post.isPublic && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
              🔒 Private
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-light mt-1 mb-4 text-white/90" style={{ lineHeight: 1.3 }}>
          {post.title}
        </h1>

        <div className="flex items-center gap-3 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {post.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">{post.user.name}</p>
            <p className="text-xs text-white/25">
              {new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}
              <span className="capitalize">{post.user.status}</span>
            </p>
          </div>
        </div>

        <div className="prose-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  )
}
