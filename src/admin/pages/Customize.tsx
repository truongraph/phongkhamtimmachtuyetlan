import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent, type SiteContent } from '@/store/content'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  X, Home, GripVertical, Eye, EyeOff, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Check, Undo2, Loader2,
  Blocks, User, Stethoscope, ShieldCheck, HeartPulse, GraduationCap, MapPin, SlidersHorizontal, BarChart3,
  ChevronRight, ChevronLeft, type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { TL_READY, TL_CONTENT, TL_SET, TL_FOCUS } from '@/lib/editMode'
import { pushContent } from '@/lib/backend'
import { PANEL_SECTIONS, ContactPanel, StatsPanel, type SectionMeta } from '../customize/panels'

interface Sec { type: string; label: string; visible: boolean }

// Máy tính = khung tự co giãn 100%; tablet/điện thoại = khung cố định thu nhỏ vừa.
const DEVICES = {
  desktop: { w: 0, h: 0, label: 'Máy tính', I: Monitor },
  tablet: { w: 834, h: 1112, label: 'Máy tính bảng', I: Tablet },
  mobile: { w: 390, h: 812, label: 'Điện thoại', I: Smartphone },
} as const

type PanelKey = 'layout' | 'hero' | 'stats' | 'about' | 'services' | 'why' | 'specialties' | 'journey' | 'contact' | 'settings'
interface PanelDef { key: PanelKey; label: string; icon: LucideIcon; desc: string }
const CONTENT_PANELS: PanelDef[] = [
  { key: 'layout', label: 'Bố cục & thứ tự', icon: Blocks, desc: 'Sắp xếp · ẩn/hiện các phần' },
  { key: 'hero', label: 'Trang chủ', icon: Home, desc: 'Tiêu đề, huy hiệu, form, ảnh' },
  { key: 'stats', label: 'Dải số liệu', icon: BarChart3, desc: 'Các con số nổi bật' },
  { key: 'about', label: 'Giới thiệu bác sĩ', icon: User, desc: 'Tiểu sử, bằng cấp, trích dẫn' },
  { key: 'services', label: 'Dịch vụ', icon: Stethoscope, desc: 'Thêm / sửa / xoá dịch vụ' },
  { key: 'why', label: 'Cam kết', icon: ShieldCheck, desc: 'Lý do chọn phòng khám' },
  { key: 'specialties', label: 'Chuyên môn', icon: HeartPulse, desc: 'Các lĩnh vực chuyên sâu' },
  { key: 'journey', label: 'Đào tạo & Nghiên cứu', icon: GraduationCap, desc: 'Timeline & nghiên cứu' },
  { key: 'contact', label: 'Liên hệ', icon: MapPin, desc: 'Tiêu đề & mô tả phần liên hệ' },
]
const SYSTEM_PANELS: PanelDef[] = [
  { key: 'settings', label: 'Cài đặt chung', icon: SlidersHorizontal, desc: 'Màu, phông, thông tin, logo, SEO…' },
]
const ALL_PANELS = [...CONTENT_PANELS, ...SYSTEM_PANELS]

// Ánh xạ ĐƯỜNG DẪN trường (khi bấm bút chì ở preview) → panel + phần con để sidebar nhảy tới.
type NavTarget = { panel: PanelKey; section: string | null }
const NAV_RULES: { m: RegExp; panel: PanelKey; section?: string }[] = [
  { m: /^hero\.bullets/, panel: 'hero', section: 'bullets' },
  { m: /^hero\.(bookingTitle|bookingSubtitle|doctorPhotoUrl)/, panel: 'hero', section: 'form' },
  { m: /^hero\./, panel: 'hero', section: 'title' },
  { m: /^about\.paragraphs/, panel: 'about', section: 'paragraphs' },
  { m: /^about\.tags/, panel: 'about', section: 'tags' },
  { m: /^about\.credentials/, panel: 'about', section: 'credentials' },
  { m: /^about\.(quote|quoteCite)/, panel: 'about', section: 'quote' },
  { m: /^about\./, panel: 'about', section: 'head' },
  { m: /^services\./, panel: 'services', section: 'items' },
  { m: /^services(Eyebrow|Title|TitleHighlight|Lead)$/, panel: 'services', section: 'head' },
  { m: /^whys\./, panel: 'why', section: 'items' },
  { m: /^why(Eyebrow|Title|TitleHighlight)$/, panel: 'why', section: 'head' },
  { m: /^specialties\./, panel: 'specialties', section: 'items' },
  { m: /^specialties(Eyebrow|Title|TitleHighlight)$/, panel: 'specialties', section: 'head' },
  { m: /^research\./, panel: 'journey', section: 'research' },
  { m: /^journey(Eyebrow|Title|TitleHighlight)$/, panel: 'journey', section: 'head' },
  { m: /^info\.hours/, panel: 'settings', section: 'hours' },
  { m: /^info\.logoUrl/, panel: 'settings', section: 'logo' },
  { m: /^info\.(clinicName|tagline|phone|slogan)/, panel: 'settings', section: 'info' },
  { m: /^info\.(address|addressNote|street|ward|province)/, panel: 'settings', section: 'address' },
  { m: /^cta\./, panel: 'settings', section: 'cta' },
  { m: /^footerAbout$/, panel: 'settings', section: 'footer' },
  { m: /^stats\./, panel: 'stats' },
  { m: /^(contactEyebrow|contactTitle|contactTitleHighlight|contactLead)$/, panel: 'contact' },
]
function pathToNav(path: string, content: SiteContent): NavTarget | null {
  if (path.startsWith('timeline.')) {
    const tabId = path.split('.')[1]
    const tab = content.timeline.find((t) => t.id === tabId)
    return { panel: 'journey', section: tab ? `tab:${tab.key}` : null }
  }
  for (const r of NAV_RULES) if (r.m.test(path)) return { panel: r.panel, section: r.section ?? null }
  return null
}

// Bảo hiểm chống tràn ngang + in đậm nhãn từng trường cho dễ đọc.
const PANEL_CSS = `
.tl-cust-panel{ overflow-x:hidden; }
.tl-cust-panel *{ min-width:0; }
.tl-cust-panel label{ font-weight:600; }
`

function SortableRow({ s, onToggle }: { s: Sec; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.type })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }
  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2 rounded-lg border bg-card p-2 ${isDragging ? 'shadow-xl ring-2 ring-primary/40' : ''} ${s.visible ? '' : 'opacity-60'}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1 text-muted-foreground hover:text-foreground" aria-label="Kéo để sắp xếp">
        <GripVertical className="size-[18px]" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[.85rem] truncate">{s.label}</div>
        <div className="text-[.68rem] text-muted-foreground flex items-center gap-1">
          {s.visible ? <><Eye className="size-3" /> Hiển thị</> : <><EyeOff className="size-3" /> Đang ẩn</>}
        </div>
      </div>
      <Switch checked={s.visible} onCheckedChange={onToggle} />
    </div>
  )
}

/** Panel "Bố cục": sắp xếp & ẩn/hiện các phần trên trang. */
function LayoutPanel() {
  const sections = useContent((s) => s.content.sections) as Sec[]
  const setLayout = useContent((s) => s.setLayout)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setLayout((c) => {
      const from = c.sections.findIndex((x) => x.type === active.id)
      const to = c.sections.findIndex((x) => x.type === over.id)
      c.sections = arrayMove(c.sections, from, to)
    })
    toast.success('Đã cập nhật thứ tự các phần')
  }
  const toggle = (type: string) => {
    let shown = false
    setLayout((c) => { const it = c.sections.find((x) => x.type === type); if (it) { it.visible = !it.visible; shown = it.visible } })
    toast.success(shown ? 'Đã bật hiển thị phần này' : 'Đã ẩn phần này')
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2">
        <span className="grid place-items-center size-7 rounded-md bg-primary text-primary-foreground"><Home className="size-4" /></span>
        <div className="flex-1"><div className="font-medium text-[.85rem]">Trang chủ (Hero)</div><div className="text-[.66rem] text-muted-foreground">Cố định · không thể tắt</div></div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.type)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {sections.map((s) => <SortableRow key={s.type} s={s} onToggle={() => toggle(s.type)} />)}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

/** Hàng phần con (level 2) trong một panel. */
function SectionRow({ s, onClick }: { s: SectionMeta; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group w-full flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:bg-white hover:border-primary hover:text-primary active:scale-[.99]">
      <s.icon className="size-[18px] text-muted-foreground group-hover:text-primary shrink-0" />
      <span className="flex-1 min-w-0 truncate text-[.88rem] font-medium group-hover:text-primary">{s.title}</span>
      <ChevronRight className="size-4 text-muted-foreground/70 group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

function NavRow({ p, onClick }: { p: PanelDef; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group w-full flex items-center gap-3 px-4 py-3 text-left bg-white border-b border-border/70 hover:bg-white hover:text-primary transition-colors">
      <p.icon className="size-[18px] text-muted-foreground group-hover:text-primary shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-[.9rem] leading-tight truncate group-hover:text-primary">{p.label}</div>
        <div className="text-[.7rem] text-muted-foreground truncate mt-0.5">{p.desc}</div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground/70 group-hover:text-primary shrink-0" />
    </button>
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-1.5 bg-neutral-200/70 border-y border-border/70 text-[.66rem] font-bold uppercase tracking-wider text-muted-foreground">{children}</div>
}

export function Customize() {
  const nav = useNavigate()
  const content = useContent((s) => s.content)
  const clinicName = useContent((s) => s.content.info.clinicName)
  const dirty = useContent((s) => s.dirty)
  const save = useContent((s) => s.save)
  const discard = useContent((s) => s.discard)

  const [panel, setPanel] = useState<PanelKey | null>(null)
  const [section, setSection] = useState<string | null>(null)
  const [navDir, setNavDir] = useState<'fwd' | 'back'>('fwd')
  const openPanel = (k: PanelKey) => { setNavDir('fwd'); setPanel(k); setSection(null) }
  const openSection = (k: string) => { setNavDir('fwd'); setSection(k) }
  const back = () => {
    setNavDir('back')
    if (section) setSection(null)      // đang ở phần con → lùi về danh sách phần
    else { setPanel(null); setSection(null) } // đang ở panel → lùi về gốc
  }
  const [device, setDevice] = useState<keyof typeof DEVICES>('desktop')
  const [publishing, setPublishing] = useState(false)
  const [hideSidebar, setHideSidebar] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [avail, setAvail] = useState({ w: 0, h: 0 })

  // Xuất bản: lưu cục bộ → đẩy lên server (nếu có) → báo thành công. Giữ loading tối thiểu để thấy rõ.
  const publish = async () => {
    if (publishing) return
    setPublishing(true)
    save()
    const st = useContent.getState()
    await Promise.all([
      pushContent(st.published, st.pubTs).catch(() => {}),
      new Promise((r) => setTimeout(r, 650)),
    ])
    setPublishing(false)
    toast.success('Đã xuất bản — website đã cập nhật')
  }

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setAvail({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Gửi nội dung nháp xuống iframe (nguồn sự thật = store trang quản trị).
  const sendContent = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: TL_CONTENT, content: useContent.getState().content },
      window.location.origin,
    )
  }
  useEffect(() => { sendContent() }, [content])
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as { type?: string; path?: string; value?: unknown }
      if (d?.type === TL_READY) sendContent()
      else if (d?.type === TL_SET && d.path != null) useContent.getState().setPath(d.path, d.value)
      else if (d?.type === TL_FOCUS && d.path) {
        // Bấm/sửa ở preview → sidebar nhảy tới đúng panel + phần con.
        const t = pathToNav(d.path, useContent.getState().content)
        if (t) { setHideSidebar(false); setNavDir('fwd'); setPanel(t.panel); setSection(t.section) }
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const reload = () => { if (iframeRef.current) iframeRef.current.src = '/?edit=1&r=' + Date.now() }

  const D = DEVICES[device]
  const isDesktop = device === 'desktop'
  const scale = isDesktop ? 1 : Math.min((avail.w - 32) / D.w, (avail.h - 32) / D.h, 1)
  // Kích thước khung thiết bị (px) — có transition để chuyển thiết bị mượt.
  const boxW = isDesktop ? avail.w : Math.round(D.w * scale)
  const boxH = isDesktop ? avail.h : Math.round(D.h * scale)

  // Điều hướng 2 cấp: panel (level 1) → phần con (level 2).
  const panelDef = panel ? ALL_PANELS.find((p) => p.key === panel) : null
  const FlatComp = panel === 'layout' ? LayoutPanel : panel === 'stats' ? StatsPanel : panel === 'contact' ? ContactPanel : null
  const sections: SectionMeta[] | null = panel && panel !== 'layout' && panel !== 'stats' && panel !== 'contact'
    ? (PANEL_SECTIONS[panel]?.(content) ?? null) : null
  const secMeta = sections && section ? sections.find((s) => s.key === section) ?? null : null
  const crumb = secMeta ? secMeta.title : panelDef ? panelDef.label : clinicName

  return (
    <div className="fixed inset-0 z-50 flex bg-neutral-300/60">
      <style>{PANEL_CSS}</style>
      {/* TRÁI: bảng điều khiển (trượt ẩn/hiện) */}
      <aside className={`w-[348px] shrink-0 flex flex-col bg-neutral-100 border-r shadow-xl transition-[margin] duration-300 ease-out ${hideSidebar ? '-ml-[348px]' : ''}`}>
        {/* Hàng trên cùng: đóng + xuất bản */}
        <div className="flex items-center gap-2 h-12 px-1.5 border-b bg-neutral-200/60">
          {dirty ? (
            <ConfirmDialog
              title="Rời khỏi khi chưa xuất bản?"
              desc="Bạn đang có thay đổi CHƯA XUẤT BẢN. Nếu rời đi, các thay đổi sẽ được khôi phục về như ban đầu."
              confirmText="Rời đi & khôi phục"
              cancelText="Ở lại"
              destructive
              onConfirm={() => { discard(); nav('/admin') }}
              trigger={<Button variant="ghost" size="icon" className="size-9 shrink-0" aria-label="Đóng"><X className="size-5" /></Button>}
            />
          ) : (
            <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => nav('/admin')} aria-label="Đóng"><X className="size-5" /></Button>
          )}
          <div className="flex-1" />
          {(dirty || publishing) ? (
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" disabled={publishing} className="h-8 text-[.8rem] px-2.5" onClick={() => { discard(); toast.success('Đã hoàn tác các thay đổi chưa lưu') }}><Undo2 className="size-3.5" /> Hoàn tác</Button>
              <Button size="sm" disabled={publishing} className="h-8 text-[.8rem] px-2.5 min-w-[104px]" onClick={publish}>
                {publishing ? <><Loader2 className="size-3.5 animate-spin" /> Đang xuất bản…</> : <><Check className="size-3.5" /> Xuất bản</>}
              </Button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md border bg-background text-muted-foreground text-[.8rem] font-medium px-2.5 py-1">Đã xuất bản</span>
          )}
        </div>

        {/* Tiêu đề / breadcrumb — nút back CHUNG (ô viền kiểu WordPress), tên đổi theo cấp */}
        {panel ? (
          <div className="flex items-stretch border-b bg-white">
            <button onClick={back} aria-label="Quay lại"
              className="grid place-items-center w-12 border-r text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors shrink-0">
              <ChevronLeft className="size-5" />
            </button>
            <div className="px-3 py-2.5 min-w-0 flex flex-col justify-center">
              <div className="text-[.66rem] text-muted-foreground  mb-1">Bạn đang tùy chỉnh</div>
              <div className="font-semibold text-[.98rem] truncate">{crumb}</div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-b bg-white">
            <div className="text-[.66rem] text-muted-foreground  mb-1.5">Bạn đang tùy chỉnh</div>
            <div className="font-semibold text-[1.05rem] truncate ">{clinicName}</div>
          </div>
        )}

        {/* Danh sách / nội dung panel */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div key={`${panel ?? 'root'}:${section ?? ''}`}
            className={`animate-in fade-in duration-200 ease-out ${navDir === 'fwd' ? 'slide-in-from-right-6' : 'slide-in-from-left-6'}`}>
            {!panel ? (
              // GỐC: danh sách các panel
              <div>
                <GroupLabel>Nội dung trang</GroupLabel>
                {CONTENT_PANELS.map((p) => <NavRow key={p.key} p={p} onClick={() => openPanel(p.key)} />)}
                <GroupLabel>Giao diện chung</GroupLabel>
                {SYSTEM_PANELS.map((p) => <NavRow key={p.key} p={p} onClick={() => openPanel(p.key)} />)}
                <p className="px-4 py-3 text-[.72rem] text-muted-foreground leading-relaxed">
                  Mẹo: rê chuột vào chữ hoặc ảnh ở khung bên phải sẽ hiện <b className="text-foreground">bút chì</b> — bấm để sửa ngay tại chỗ.
                </p>
              </div>
            ) : FlatComp ? (
              // PANEL PHẲNG (Bố cục, Liên hệ)
              <div className="tl-cust-panel p-3"><FlatComp /></div>
            ) : secMeta ? (
              // PHẦN CON đang mở
              <div className="tl-cust-panel p-3 space-y-4"><secMeta.Body sk={section!} /></div>
            ) : (
              // DANH SÁCH phần con của panel
              <div className="p-3 space-y-1.5">
                {sections?.map((s) => <SectionRow key={s.key} s={s} onClick={() => openSection(s.key)} />)}
              </div>
            )}
          </div>
        </div>

        {/* Chân bảng: ẩn bảng (trái) · thiết bị + tiện ích (phải) */}
        <div className="border-t bg-neutral-200/60 px-3 py-2 flex items-center gap-2">
          <button onClick={() => setHideSidebar(true)} title="Ẩn bảng chỉnh sửa"
            className="flex items-center gap-1.5 text-[.8rem] font-medium text-muted-foreground hover:text-foreground">
            <span className="grid place-items-center size-5 rounded-full bg-neutral-400/40"><ChevronLeft className="size-3.5" /></span> Ẩn bảng
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="inline-flex rounded-lg border bg-background p-0.5">
              {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((k) => {
                const Dv = DEVICES[k]
                return (
                  <button key={k} onClick={() => setDevice(k)} title={Dv.label}
                    className={`grid place-items-center size-7 rounded-md transition-colors ${device === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Dv.I className="size-[17px]" />
                  </button>
                )
              })}
            </div>
            <Button variant="ghost" size="icon" className="size-8" onClick={reload} title="Làm mới khung"><RefreshCw className="size-4" /></Button>
            <Button asChild variant="ghost" size="icon" className="size-8" title="Mở website ở tab mới"><a href="/" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /></a></Button>
          </div>
        </div>
      </aside>

      {/* PHẢI: khung xem trước & sửa trực tiếp */}
      <div ref={stageRef} className="flex-1 bg-[#1D2327] relative overflow-hidden grid place-items-center">
        <div style={{ width: boxW || '100%', height: boxH || '100%' }}
          className={`overflow-hidden bg-white shadow-2xl transition-[width,height,border-radius] duration-300 ease-out ${device === 'mobile' ? 'rounded-[2rem]' : device === 'tablet' ? 'rounded-2xl' : 'rounded-none'}`}>
          <iframe ref={iframeRef} src="/?edit=1" title="Xem trước & sửa" onLoad={sendContent}
            style={isDesktop
              ? { width: '100%', height: '100%', border: 0 }
              : { width: D.w, height: D.h, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0 }}
            className="block bg-white" />
        </div>
      </div>

      {/* Nút HIỆN bảng khi đang ẩn (kiểu WordPress) */}
      {hideSidebar && (
        <button onClick={() => setHideSidebar(false)}
          className="fixed left-3 bottom-3 z-[60] flex items-center gap-1.5 rounded-full bg-[#1D2327] text-white text-[.8rem] font-medium pl-2 pr-3.5 py-1.5 shadow-xl hover:bg-[#2c333a] animate-in slide-in-from-left-4 fade-in duration-200">
          <span className="grid place-items-center size-5 rounded-full bg-white/20"><ChevronRight className="size-3.5" /></span> Hiện bảng
        </button>
      )}
    </div>
  )
}
