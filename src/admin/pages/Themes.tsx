import { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useContent } from '@/store/content'
import { TEMPLATES, getTemplate, type SiteTemplate } from '@/site/templates'
import { TemplateThumb } from '../TemplateThumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { PageHead } from '../parts'
import { normalizeVN } from '@/lib/format'
import { Check, ExternalLink, LayoutTemplate, Eye, X, Monitor, Tablet, Smartphone, RefreshCw, Search, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'

// Kích thước LOGIC theo thiết bị để xem thử trong modal (thu nhỏ vừa khung).
const PREVIEW_SIZES = {
  desktop: { w: 1280, h: 800, label: 'Máy tính', I: Monitor },
  tablet: { w: 834, h: 1112, label: 'Máy tính bảng', I: Tablet },
  mobile: { w: 390, h: 800, label: 'Điện thoại', I: Smartphone },
} as const

/** Chặn bấm/điều hướng trong iframe xem thử nhưng VẪN cho cuộn (same-origin). */
function lockPreview(el: HTMLIFrameElement) {
  try {
    const doc = el.contentDocument
    if (!doc) return
    const stop = (e: Event) => { e.preventDefault(); e.stopPropagation() }
    ;['click', 'auxclick', 'dblclick', 'submit', 'contextmenu'].forEach((t) => doc.addEventListener(t, stop, true))
    doc.documentElement.style.cursor = 'default'
  } catch { /* khác origin thì bỏ qua */ }
}

/** Modal xem thử: nhúng website thật với mẫu đang chọn (?tpl=…), thu nhỏ theo thiết bị. */
function ThemePreviewModal({ t, active, onApply, onClose }: { t: SiteTemplate; active: boolean; onApply: () => void; onClose: () => void }) {
  const [size, setSize] = useState<keyof typeof PREVIEW_SIZES>('desktop')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [avail, setAvail] = useState({ w: 0, h: 0 })
  // Hiệu ứng: mở → trượt LÊN, đóng → trượt XUỐNG. entered=false lúc đầu để có khung chuyển động.
  const [entered, setEntered] = useState(false)
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])
  // Trượt xuống rồi mới gỡ modal (khớp thời lượng transition 300ms).
  const close = () => { setEntered(false); setTimeout(onClose, 300) }
  const applyClose = () => { setEntered(false); setTimeout(onApply, 300) }

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setAvail({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // Đóng bằng phím Esc.
  useLayoutEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const S = PREVIEW_SIZES[size]
  const scale = avail.w && avail.h ? Math.min((avail.w - 24) / S.w, (avail.h - 24) / S.h, 1) : 0.5
  const reload = () => { if (iframeRef.current) iframeRef.current.src = `/?tpl=${t.id}&r=${Date.now()}` }

  return createPortal(
    <div className={`fixed inset-0 z-[60] flex bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${entered ? 'opacity-100' : 'opacity-0'}`} onClick={close}>
      <div className={`flex flex-col w-full h-full sm:m-4 lg:m-6 rounded-none sm:rounded-2xl bg-background overflow-hidden shadow-2xl transition-transform duration-300 ease-out ${entered ? 'translate-y-0' : 'translate-y-full'}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{t.name}</h3>
              <div className="flex gap-1 shrink-0">{[t.theme.primary, t.theme.navy, t.theme.accent].map((c, i) => <span key={i} className="size-3.5 rounded-full ring-1 ring-black/10" style={{ background: c }} />)}</div>
            </div>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">{t.desc}</p>
          </div>

          <div className="ml-auto hidden md:inline-flex rounded-lg border bg-background p-1">
            {(Object.keys(PREVIEW_SIZES) as (keyof typeof PREVIEW_SIZES)[]).map((k) => {
              const D = PREVIEW_SIZES[k]
              return (
                <button key={k} onClick={() => setSize(k)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${size === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <D.I className="size-4" /> <span className="hidden lg:inline">{D.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="size-4" /><span className="hidden sm:inline"> Làm mới</span></Button>
            <Button asChild variant="outline" size="sm"><a href={`/?tpl=${t.id}`} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /><span className="hidden sm:inline"> Tab mới</span></a></Button>
            {active
              ? <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5"><Check className="size-4" /> Đang dùng</span>
              : <Button size="sm" onClick={applyClose}><Check className="size-4" /> Áp dụng mẫu này</Button>}
            <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={close} aria-label="Đóng"><X className="size-5" /></Button>
          </div>
        </div>

        {/* Body: iframe website thật với mẫu đang xem thử */}
        <div ref={wrapRef} className="flex-1 grid place-items-center overflow-hidden bg-secondary/40 p-3">
          <div style={{ width: S.w * scale, height: S.h * scale, overflow: 'hidden' }} className="rounded-lg shadow-xl ring-1 ring-black/10 bg-white">
            <iframe ref={iframeRef} src={`/?tpl=${t.id}`} title={`Xem trước ${t.name}`} onLoad={(e) => lockPreview(e.currentTarget)}
              style={{ width: S.w, height: S.h, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0 }} className="block bg-white" />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function Themes() {
  const current = useContent((s) => s.content.template)
  const set = useContent((s) => s.set)
  const save = useContent((s) => s.save)
  const active = getTemplate(current)
  const [preview, setPreview] = useState<SiteTemplate | null>(null)
  const [q, setQ] = useState('')
  const nq = normalizeVN(q)
  const list = nq ? TEMPLATES.filter((t) => normalizeVN(`${t.name} ${t.desc}`).includes(nq)) : TEMPLATES

  const apply = (t: SiteTemplate) => {
    set((c) => {
      c.template = t.id
      c.theme.primary = t.theme.primary; c.theme.navy = t.theme.navy; c.theme.accent = t.theme.accent
      c.theme.headingFont = t.theme.headingFont; c.theme.radius = t.theme.radius
      c.theme.fontHeading = t.theme.headingFont === 'display' ? 'Lora' : 'Inter'
      c.theme.fontBody = 'Inter'
    })
    save() // áp dụng mẫu là cập nhật website ngay
    toast.success(`Đã áp dụng mẫu “${t.name}” — website đã cập nhật`)
  }

  return (
    <div>
      <PageHead title="Kho giao diện mẫu" desc="20 mẫu website — mỗi mẫu một bố cục & phối màu riêng. Ảnh xem trước là giao diện thật với nội dung của bạn." />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold"><LayoutTemplate className="size-4" /> Đang dùng: {active.name}</span>
        <a href="/" target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"><ExternalLink className="size-4" /> Xem website</a>
        <div className="ml-auto relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm giao diện đã cài…" className="h-10 pl-9" />
        </div>
      </div>

      {/* Lưới giao diện kiểu WordPress: ảnh + lớp phủ hover có nút; chân thẻ = tên (+ nút Tùy chỉnh cho mẫu đang dùng) */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {list.map((t) => {
          const isActive = t.id === current
          return (
            <div key={t.id} className={`group relative flex flex-col rounded-md border bg-card overflow-hidden transition-shadow ${isActive ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-lg'}`}>
              <div className="relative border-b bg-muted/30 overflow-hidden">
                <TemplateThumb t={t} />
                {/* Lớp phủ khi rê chuột — nút Xem trước / Áp dụng */}
                <div className="absolute inset-0 grid place-items-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => setPreview(t)}><Eye className="size-4" /> Xem trước</Button>
                    {!isActive && (
                      <ConfirmDialog
                        title={`Áp dụng mẫu “${t.name}”?`}
                        desc="Toàn bộ bố cục và phối màu website sẽ đổi sang mẫu này và cập nhật ngay lên website."
                        confirmText="Áp dụng"
                        onConfirm={() => apply(t)}
                        trigger={<Button data-tpl={t.id} size="sm"><Check className="size-4" /> Áp dụng</Button>}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* Chân thẻ */}
              {isActive ? (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-foreground text-background">
                  <span className="text-sm font-semibold truncate flex-1"><span className="text-background/60 font-normal">Đang dùng: </span>{t.name}</span>
                  <Button asChild size="sm" variant="secondary" className="shrink-0"><Link to="/admin/customize"><SlidersHorizontal className="size-4" /> Tùy chỉnh</Link></Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-3">
                  <span className="text-[15px] font-semibold truncate flex-1">{t.name}</span>
                  <div className="flex gap-1 shrink-0">{[t.theme.primary, t.theme.navy, t.theme.accent].map((c, i) => <span key={i} className="size-4 rounded-full ring-1 ring-black/10" style={{ background: c }} />)}</div>
                </div>
              )}
            </div>
          )
        })}
        {list.length === 0 && <div className="col-span-full rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">Không tìm thấy giao diện nào cho “{q}”.</div>}
      </div>

      {preview && (
        <ThemePreviewModal
          t={preview}
          active={preview.id === current}
          onApply={() => { apply(preview); setPreview(null) }}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}
