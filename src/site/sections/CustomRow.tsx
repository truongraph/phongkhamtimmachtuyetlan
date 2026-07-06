import type { RowBlock, RowElement, TypoSize } from '@/store/content'
import { useContent } from '@/store/content'
import { Icon } from '@/lib/icons'
import { Editable, EditableImage } from '../edit'
import { Facebook, Youtube, Instagram, Music2, MessageCircle, Globe, Phone, Mail, type LucideIcon } from 'lucide-react'

/** Icon theo nền tảng cho khối "Nút mạng xã hội". */
export const SOCIAL_ICONS: Record<string, LucideIcon> = {
  facebook: Facebook, youtube: Youtube, instagram: Instagram, tiktok: Music2, zalo: MessageCircle, website: Globe, phone: Phone, email: Mail,
}
export const SOCIAL_LABEL: Record<string, string> = {
  facebook: 'Facebook', youtube: 'YouTube', instagram: 'Instagram', tiktok: 'TikTok', zalo: 'Zalo', website: 'Website', phone: 'Điện thoại', email: 'Email',
}
function fmtDate(d: string) { try { return new Date(d).toLocaleDateString('vi-VN') } catch { return d } }

/** Khối "Bài viết mới nhất": lấy N bài đã đăng gần nhất. */
function LatestPostsBlock({ count }: { count?: number }) {
  const { posts, blog } = useContent((s) => s.published)
  const list = posts.filter((p) => p.published).slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, count || 3)
  if (!list.length) return <div className="rounded-xl border border-dashed py-8 text-center text-sm" style={{ color: 'var(--tl-slate)', borderColor: 'var(--tl-line)' }}>Chưa có bài viết nào.</div>
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <a key={p.id} href={`/${blog.slug}/${p.slug}`} className="group block rounded-xl border overflow-hidden bg-white transition-shadow hover:shadow-lg" style={{ borderColor: 'var(--tl-line)' }}>
          {p.cover && <div className="aspect-[16/10] overflow-hidden"><img src={p.cover} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>}
          <div className="p-4">
            <div className="text-[.72rem]" style={{ color: 'var(--tl-slate)' }}>{fmtDate(p.date)}</div>
            <h3 className="site-head font-bold mt-1 leading-snug group-hover:text-[var(--tl-primary)] transition-colors" style={{ color: 'var(--tl-ink)' }}>{p.title}</h3>
          </div>
        </a>
      ))}
    </div>
  )
}

// Cỡ chữ theo lựa chọn (md = mặc định của khối). Dùng chung cho render site & canvas soạn thảo.
const H_SIZE: Record<TypoSize, string> = { sm: '1.25rem', md: '', lg: '2.4rem', xl: '3rem' }
const P_SIZE: Record<TypoSize, string> = { sm: '.9rem', md: '', lg: '1.25rem', xl: '1.6rem' }
export function typoStyle(kind: 'heading' | 'text', size?: TypoSize, color?: string): React.CSSProperties {
  const s: React.CSSProperties = {}
  if (color) s.color = color
  if (size && size !== 'md') { const v = kind === 'heading' ? H_SIZE[size] : P_SIZE[size]; if (v) s.fontSize = v }
  return s
}

// Khoảng đệm trên–dưới theo lựa chọn của khối.
const PY: Record<NonNullable<RowBlock['py']>, string> = {
  sm: 'py-8',
  md: 'py-14 lg:py-20',
  lg: 'py-20 lg:py-28',
}
const SPACER: Record<NonNullable<Extract<RowElement, { kind: 'spacer' }>['size']>, number> = { sm: 16, md: 32, lg: 64 }

/**
 * Một phần tử trong cột. `base` = đường dẫn tới phần tử này trong store
 * (…row.cols.<cid>.elements.<eid>) để BẤM–SỬA TẠI CHỖ khi ở chế độ sửa.
 * `light` = chữ sáng (khi khối có nền tối/ảnh).
 */
function El({ e, base, light }: { e: RowElement; base: string; light?: boolean }) {
  const ink = light ? '#fff' : 'var(--tl-ink)'
  const slate = light ? 'rgba(255,255,255,.85)' : 'var(--tl-slate)'
  switch (e.kind) {
    case 'image':
      return <EditableImage path={`${base}.url`} src={e.url} alt={e.alt || ''} className="w-full rounded-2xl border object-cover" style={{ borderColor: light ? 'rgba(255,255,255,.25)' : 'var(--tl-line)' }} />
    case 'heading':
      return <Editable as="h2" path={`${base}.text`} className="site-head font-bold text-[clamp(1.5rem,3vw,2.2rem)] leading-tight" style={{ color: ink, ...typoStyle('heading', e.size, e.color) }}>{e.text}</Editable>
    case 'text':
      return <Editable as="p" path={`${base}.text`} multiline className="text-[1.02rem] leading-relaxed whitespace-pre-line" style={{ color: slate, ...typoStyle('text', e.size, e.color) }}>{e.text}</Editable>
    case 'button':
      return (
        <a href={e.href || '#'} className="inline-flex items-center rounded-lg px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--tl-primary)' }}>
          <Editable as="span" path={`${base}.text`}>{e.text}</Editable>
        </a>
      )
    case 'icon':
      return <span className="grid place-items-center size-14 rounded-2xl" style={{ background: light ? 'rgba(255,255,255,.15)' : 'var(--tl-soft)', color: light ? '#fff' : 'var(--tl-primary)' }}><Icon name={e.name} className="size-7" /></span>
    case 'video':
      return e.url
        ? <div className="relative w-full overflow-hidden rounded-2xl border" style={{ aspectRatio: '16 / 9', borderColor: light ? 'rgba(255,255,255,.25)' : 'var(--tl-line)' }}>
            <iframe src={e.url} title="Video" className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        : null
    case 'spacer':
      return <div aria-hidden style={{ height: SPACER[e.size || 'md'] }} />
    case 'divider':
      return <hr className="border-0 border-t" style={{ borderColor: light ? 'rgba(255,255,255,.25)' : 'var(--tl-line)' }} />
    case 'map':
      return e.address
        ? <div className="relative w-full overflow-hidden rounded-2xl border" style={{ aspectRatio: '16 / 10', borderColor: light ? 'rgba(255,255,255,.25)' : 'var(--tl-line)' }}>
            <iframe title="Bản đồ" className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(e.address)}&z=16&output=embed`} />
          </div>
        : null
    case 'list':
      return (
        <ul className="space-y-2.5">
          {e.items.map((it, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[1.02rem]" style={{ color: slate }}>
              <span className="mt-0.5 shrink-0" style={{ color: light ? '#fff' : 'var(--tl-primary)' }}><Icon name={e.icon || 'check'} className="size-5" /></span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )
    case 'quote':
      return (
        <blockquote className="pl-5 py-1 border-l-4" style={{ borderColor: 'var(--tl-primary)' }}>
          <p className="site-head italic font-semibold text-[clamp(1.15rem,2.2vw,1.45rem)] leading-relaxed" style={{ color: ink }}>“{e.text}”</p>
          {e.cite && <cite className="block mt-2.5 not-italic text-[.9rem] font-semibold" style={{ color: slate }}>— {e.cite}</cite>}
        </blockquote>
      )
    case 'gallery':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {e.images.map((im) => <img key={im.id} src={im.url} alt="" className="w-full aspect-square object-cover rounded-lg border" style={{ borderColor: light ? 'rgba(255,255,255,.25)' : 'var(--tl-line)' }} />)}
        </div>
      )
    case 'html':
      return <div className="tl-html" dangerouslySetInnerHTML={{ __html: e.html }} />
    case 'latestposts':
      return <LatestPostsBlock count={e.count} />
    case 'socials':
      return (
        <div className="flex flex-wrap gap-2.5">
          {e.items.map((it) => { const I = SOCIAL_ICONS[it.platform] || Globe; return (
            <a key={it.id} href={it.url || '#'} target="_blank" rel="noreferrer" aria-label={SOCIAL_LABEL[it.platform] || 'Liên kết'}
              className="grid size-11 place-items-center rounded-full text-white transition-transform hover:scale-110" style={{ background: light ? 'rgba(255,255,255,.2)' : 'var(--tl-primary)' }}><I className="size-5" /></a>
          ) })}
        </div>
      )
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[.95rem]">
            <tbody>
              {e.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => ri === 0
                    ? <th key={ci} className="border px-3 py-2 text-left font-bold" style={{ borderColor: 'var(--tl-line)', background: 'var(--tl-tint)', color: ink }}>{cell}</th>
                    : <td key={ci} className="border px-3 py-2" style={{ borderColor: 'var(--tl-line)', color: slate }}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'columns': {
      const n = e.cols.length
      const grid = n >= 3 ? 'sm:grid-cols-3' : n === 2 ? 'sm:grid-cols-2' : ''
      return (
        <div className={`grid gap-6 ${grid}`}>
          {e.cols.map((c) => (
            <div key={c.id} className="min-w-0 space-y-4">
              {c.elements.map((child) => <El key={child.id} e={child} light={light} base={`${base}.cols.${c.id}.elements.${child.id}`} />)}
            </div>
          ))}
        </div>
      )
    }
  }
}

// Tỉ lệ cột (chỉ áp dụng khi có đúng 2 cột).
function twoColGrid(layout: RowBlock['layout']) {
  if (layout === 'wideLeft') return 'lg:grid-cols-[1.6fr_1fr]'
  if (layout === 'wideRight') return 'lg:grid-cols-[1fr_1.6fr]'
  return 'lg:grid-cols-2'
}

/**
 * KHỐI TỰ DO: một hàng chia 1–3 cột, tùy chọn nền ảnh + lớp phủ + chữ sáng + tràn viền.
 * `base` = đường dẫn tới section chứa khối để bấm–sửa tại chỗ ghi đúng chỗ.
 */
export function CustomRow({ block, base }: { block: RowBlock; base: string }) {
  const bg = block.bg === 'tint' ? 'var(--tl-tint)' : block.bg === 'soft' ? 'var(--tl-soft)' : undefined
  const n = block.cols.length
  const grid = n >= 3 ? 'lg:grid-cols-3' : n === 2 ? twoColGrid(block.layout) : 'max-w-3xl mx-auto'
  const hasImg = !!block.bgImage
  const light = block.light
  const inner = block.wide ? 'w-full px-4 lg:px-10' : 'container'
  return (
    <section className={`relative ${PY[block.py || 'md']}`} style={bg && !hasImg ? { background: bg } : undefined}>
      {hasImg && <div aria-hidden className="absolute inset-0" style={{ backgroundImage: `url(${block.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
      {hasImg && (block.overlay ?? 0) > 0 && <div aria-hidden className="absolute inset-0" style={{ background: `rgba(6,20,40,${(block.overlay ?? 0) / 100})` }} />}
      <div className={`relative ${inner} grid gap-8 ${grid} ${block.align === 'center' ? 'items-center' : 'items-start'}`}>
        {block.cols.map((c) => (
          <div key={c.id} className="min-w-0 space-y-4">
            {c.elements.map((e) => <El key={e.id} e={e} light={light} base={`${base}.row.cols.${c.id}.elements.${e.id}`} />)}
          </div>
        ))}
      </div>
    </section>
  )
}
