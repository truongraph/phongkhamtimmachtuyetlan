import { useEffect } from 'react'
import { useContent } from '@/store/content'

/** Tạo/cập nhật một thẻ <meta> theo name/property. */
function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let m = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m) }
  m.setAttribute('content', content)
}

/** Đổi đường dẫn tương đối → tuyệt đối (cho ảnh chia sẻ / og:url). */
function absUrl(u?: string): string | undefined {
  if (!u) return undefined
  if (/^(https?:|data:)/.test(u)) return u
  const origin = typeof location !== 'undefined' ? location.origin : ''
  return origin + (u.startsWith('/') ? u : '/' + u)
}

/** Đặt tiêu đề + mô tả + thẻ chia sẻ mạng xã hội (Open Graph / Twitter). */
export function applyHead(o: { title: string; description: string; image?: string; url?: string }) {
  document.title = o.title
  upsertMeta('name', 'description', o.description)
  upsertMeta('property', 'og:title', o.title)
  upsertMeta('property', 'og:description', o.description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('name', 'twitter:card', o.image ? 'summary_large_image' : 'summary')
  upsertMeta('name', 'twitter:title', o.title)
  upsertMeta('name', 'twitter:description', o.description)
  if (o.url) upsertMeta('property', 'og:url', o.url)
  if (o.image) { upsertMeta('property', 'og:image', o.image); upsertMeta('name', 'twitter:image', o.image) }
}

/** SEO cho TRANG CHỦ: ưu tiên field `seo`, không có thì suy từ thông tin phòng khám. */
export function SeoHead() {
  const { info, seo } = useContent((s) => s.published)
  useEffect(() => {
    const title = seo.title?.trim() || `${info.clinicName} · ${info.tagline}`
    const description = seo.description?.trim() || `${info.clinicName} — ${info.slogan}. Đặt lịch: ${info.phone}. ${info.address} ${info.addressNote}.`
    applyHead({ title, description, image: absUrl(info.logoUrl), url: typeof location !== 'undefined' ? location.origin + '/' : undefined })
  }, [seo.title, seo.description, info.clinicName, info.tagline, info.slogan, info.phone, info.address, info.addressNote, info.logoUrl])
  return null
}

export { absUrl }
