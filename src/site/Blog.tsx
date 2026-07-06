import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useContent } from '@/store/content'
import { ThemeStyle } from './ThemeStyle'
import { SiteHeader, SiteFooter, FloatingWidgets } from './SiteChrome'
import { CustomRow } from './sections/CustomRow'
import { BookingModal } from './sections/Hero'
import { EditBridge } from './edit'
import { Reveal } from './Reveal'
import { applyHead, absUrl } from './Ecg'
import { CalendarDays, ArrowLeft, ArrowRight } from 'lucide-react'

function fmtDate(d: string): string {
  try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return d }
}

function Shell({ children }: { children: React.ReactNode }) {
  const tel = useContent((s) => s.published.info.phone.replace(/\s/g, ''))
  return (
    <div className="tl-site bg-white" style={{ color: 'var(--tl-ink)' } as any} id="top">
      <ThemeStyle />
      <SiteHeader tel={tel} />
      <main className="min-h-[46vh]">{children}</main>
      <SiteFooter />
      <FloatingWidgets />
      <BookingModal />
      <EditBridge />
      <Reveal />
    </div>
  )
}

/** Trang DANH SÁCH bài viết (/<blog.slug>). */
export function BlogArchive() {
  const { blog, posts, info } = useContent((s) => s.published)
  const list = posts.filter((p) => p.published).slice().sort((a, b) => (a.date < b.date ? 1 : -1))

  useEffect(() => {
    applyHead({ title: `${blog.title} · ${info.clinicName}`, description: blog.intro || `${blog.title} — ${info.clinicName}`, image: absUrl(info.logoUrl), url: typeof location !== 'undefined' ? `${location.origin}/${blog.slug}` : undefined })
  }, [blog.title, blog.intro, blog.slug, info.clinicName, info.logoUrl])

  return (
    <Shell>
      <section className="py-14 lg:py-20">
        <div className="container">
          <div className="max-w-[680px] mb-10">
            <h1 className="site-head font-bold text-[clamp(1.9rem,4vw,2.7rem)] leading-tight" style={{ color: 'var(--tl-ink)' }}>{blog.title}</h1>
            {blog.intro && <p className="mt-3 text-[1.06rem]" style={{ color: 'var(--tl-slate)' }}>{blog.intro}</p>}
          </div>
          {list.length === 0 ? (
            <div className="rounded-2xl border py-16 text-center" style={{ borderColor: 'var(--tl-line)', color: 'var(--tl-slate)' }}>Chưa có bài viết nào.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <a key={p.id} href={`/${blog.slug}/${p.slug}`} className="group flex flex-col rounded-2xl border overflow-hidden bg-white transition-shadow hover:shadow-lg" style={{ borderColor: 'var(--tl-line)' }}>
                  {p.cover
                    ? <div className="aspect-[16/10] overflow-hidden"><img src={p.cover} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                    : <div className="aspect-[16/10] grid place-items-center" style={{ background: 'var(--tl-tint)' }}><CalendarDays className="size-9" style={{ color: 'var(--tl-primary)', opacity: .5 }} /></div>}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-[.78rem] mb-2" style={{ color: 'var(--tl-slate)' }}><CalendarDays className="size-3.5" /> {fmtDate(p.date)}</div>
                    <h2 className="site-head font-bold text-[1.14rem] leading-snug group-hover:text-[var(--tl-primary)] transition-colors" style={{ color: 'var(--tl-ink)' }}>{p.title}</h2>
                    {p.excerpt && <p className="mt-2 text-[.92rem] line-clamp-3 flex-1" style={{ color: 'var(--tl-slate)' }}>{p.excerpt}</p>}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[.86rem] font-semibold" style={{ color: 'var(--tl-primary)' }}>Đọc tiếp <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </Shell>
  )
}

/** Trang CHI TIẾT bài viết (/<blog.slug>/<post.slug>). */
export function BlogPost({ postSlug }: { postSlug?: string }) {
  const { blog, posts, info } = useContent((s) => s.published)
  const post = posts.find((p) => p.slug === postSlug && p.published)

  useEffect(() => {
    if (!post) return
    applyHead({
      title: `${post.title} · ${info.clinicName}`,
      description: post.excerpt?.trim() || `${post.title} — ${info.clinicName}`,
      image: absUrl(post.cover || info.logoUrl),
      url: typeof location !== 'undefined' ? `${location.origin}/${blog.slug}/${post.slug}` : undefined,
    })
  }, [post?.id, post?.title, post?.excerpt, post?.cover, post?.slug, blog.slug, info.clinicName, info.logoUrl])

  if (!post) return <Navigate to={`/${blog.slug}`} replace />

  return (
    <Shell>
      <article className="py-12 lg:py-16">
        <div className="container max-w-3xl">
          <a href={`/${blog.slug}`} className="inline-flex items-center gap-1.5 text-[.88rem] font-medium mb-6" style={{ color: 'var(--tl-primary)' }}><ArrowLeft className="size-4" /> {blog.title}</a>
          <div className="flex items-center gap-1.5 text-[.82rem] mb-3" style={{ color: 'var(--tl-slate)' }}><CalendarDays className="size-4" /> {fmtDate(post.date)}</div>
          <h1 className="site-head font-bold text-[clamp(1.8rem,4vw,2.6rem)] leading-tight" style={{ color: 'var(--tl-ink)' }}>{post.title}</h1>
          {post.cover && <img src={post.cover} alt={post.title} className="w-full rounded-2xl border object-cover mt-6" style={{ borderColor: 'var(--tl-line)' }} />}
        </div>
        <div className="mt-4">
          {post.sections.filter((s) => s.visible).map((s) =>
            s.row ? <CustomRow key={s.id ?? ''} block={s.row} base={`posts.${post.id}.sections.${s.id}`} /> : null,
          )}
        </div>
      </article>
    </Shell>
  )
}

/** Điều hướng /:slug → trang blog nếu trùng blog.slug, ngược lại là trang phụ. */
export function SlugView({ pageFallback }: { pageFallback: React.ReactNode }) {
  const { slug } = useParams()
  const blogSlug = useContent((s) => s.published.blog.slug)
  if (slug && slug === blogSlug) return <BlogArchive />
  return <>{pageFallback}</>
}

/** Điều hướng /:slug/:sub → bài viết nếu :slug là blog.slug. */
export function PostView() {
  const { slug, sub } = useParams()
  const blogSlug = useContent((s) => s.published.blog.slug)
  if (slug !== blogSlug) return <Navigate to="/" replace />
  return <BlogPost postSlug={sub} />
}
