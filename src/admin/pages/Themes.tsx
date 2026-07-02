import { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useContent } from '@/store/content'
import { TEMPLATES, getTemplate, type SiteTemplate } from '@/site/templates'
import { TemplateThumb } from '../TemplateThumb'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { PageHead } from '../parts'
import { Check, ExternalLink, LayoutTemplate, Eye, X, Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react'
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

      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold"><LayoutTemplate className="size-4" /> Đang dùng: {active.name}</span>
        <span>Tinh chỉnh thêm màu/phông trong <b className="text-foreground">Cài đặt chung</b>.</span>
        <a href="/" target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 text-primary font-medium hover:underline"><ExternalLink className="size-4" /> Xem website</a>
      </div>

      <div className="grid gap-7 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {TEMPLATES.map((t) => {
          const isActive = t.id === current
          return (
            <div key={t.id} className={`group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-shadow duration-200 ${isActive ? 'ring-2 ring-primary border-primary shadow-md' : 'hover:shadow-lg hover:border-primary/40'}`}>
              <div className="relative border-b bg-muted/30 overflow-hidden rounded-t-2xl">
                <TemplateThumb t={t} />
                {isActive && <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 shadow"><Check className="size-3.5" /> Đang dùng</span>}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-[15px] truncate">{t.name}</h3>
                  <div className="flex gap-1 shrink-0">{[t.theme.primary, t.theme.navy, t.theme.accent].map((c, i) => <span key={i} className="size-4 rounded-full ring-1 ring-black/10" style={{ background: c }} />)}</div>
                </div>
                <p className="text-[12.5px] text-muted-foreground mt-1.5 line-clamp-2 min-h-[34px]">{t.desc}</p>

                {/* 2 nút bên dưới, 2 màu khác nhau: Xem trước (viền) · Áp dụng (nền chính) */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setPreview(t)}
                    className="h-9 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary">
                    <Eye className="size-4" /> Xem trước
                  </Button>
                  {isActive ? (
                    <Button type="button" size="sm" disabled variant="secondary" className="h-9 text-primary">
                      <Check className="size-4" /> Đang dùng
                    </Button>
                  ) : (
                    <ConfirmDialog
                      title={`Áp dụng mẫu “${t.name}”?`}
                      desc="Toàn bộ bố cục và phối màu website sẽ đổi sang mẫu này và cập nhật ngay lên website."
                      confirmText="Áp dụng"
                      onConfirm={() => apply(t)}
                      trigger={<Button data-tpl={t.id} size="sm" className="h-9 w-full"><Check className="size-4" /> Áp dụng</Button>}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
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
