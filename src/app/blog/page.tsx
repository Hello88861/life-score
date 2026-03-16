'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { NavBar } from '@/components/NavBar'
import { useLang } from '@/context/LanguageContext'

type Post = {
  id: number
  title: string
  slug: string
  excerpt: string
  coverUrl: string
  createdAt: string
  isPublic: boolean
  userId: string
  user: { name: string }
}

export default function BlogPage() {
  const { data: session } = useSession()
  const { T } = useLang()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const myId = (session?.user as any)?.id

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-28">
      <NavBar />
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10 mt-6">
          <div>
            <h1 className="text-3xl font-light text-white/90">{T.blog.title}</h1>
            <p className="text-sm mt-1 text-white/30">{posts.length} {T.blog.posts}</p>
          </div>
          <Link href="/blog/new" className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>
            {T.blog.newPost}
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="glass p-16 text-center">
            <p className="text-5xl mb-4">✍️</p>
            <p className="font-medium text-white mb-1">{T.blog.emptyTitle}</p>
            <p className="text-sm mb-6 text-white/40">{T.blog.emptyDesc}</p>
            <Link href="/blog/new" className="btn-primary" style={{ width: 'auto', display: 'inline-block', padding: '0.6rem 1.5rem' }}>
              {T.blog.startWriting}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="glass p-6 block group" style={{ textDecoration: 'none' }}>
                <div className="flex gap-4">
                  {post.coverUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={post.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-white text-lg leading-snug group-hover:text-indigo-300 transition-colors">
                        {post.title}
                      </h2>
                      {/* Private badge — only shown to author */}
                      {!post.isPublic && post.userId === myId && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                          🔒 {T.blog.private}
                        </span>
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-sm line-clamp-2 text-white/40">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-white/30">
                        {new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="text-white/15">·</span>
                      <span className="text-xs font-medium text-indigo-400/70">{post.user.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
