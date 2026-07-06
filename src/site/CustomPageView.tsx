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

/** Trang phụ tự tạo: header + footer chung, thân là các KHỐI TỰ DO của trang. */
export default function CustomPageView() {
  const { slug } = useParams()
  const { info, pages } = useContent((s) => s.published)
  const page = pages.find((p) => p.slug === slug)
  const tel = info.phone.replace(/\s/g, '')

  // SEO riêng cho trang phụ (title Google + thẻ chia sẻ mạng xã hội).
  useEffect(() => {
    if (!page) return
    const title = page.seo?.title?.trim() || `${page.title} · ${info.clinicName}`
    const description = page.seo?.description?.trim() || `${page.title} — ${info.clinicName}. ${info.slogan}`
    applyHead({ title, description, image: absUrl(info.logoUrl), url: typeof location !== 'undefined' ? `${location.origin}/${page.slug}` : undefined })
  }, [page?.id, page?.title, page?.slug, page?.seo?.title, page?.seo?.description, info.clinicName, info.slogan, info.logoUrl])

  if (!page) return <Navigate to="/" replace />
  return (
    <div className="tl-site bg-white" style={{ color: 'var(--tl-ink)' } as any} id="top">
      <ThemeStyle />
      <SiteHeader tel={tel} />
      <main className="min-h-[46vh]">
        {page.sections.filter((s) => s.visible).map((s) =>
          s.row ? <CustomRow key={s.id ?? ''} block={s.row} base={`pages.${page.id}.sections.${s.id}`} /> : null,
        )}
      </main>
      <SiteFooter />
      <FloatingWidgets />
      <BookingModal />
      <EditBridge />
      <Reveal />
    </div>
  )
}
