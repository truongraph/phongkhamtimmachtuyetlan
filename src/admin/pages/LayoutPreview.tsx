import { useRef, useState, useLayoutEffect } from 'react'
import { useContent } from '@/store/content'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { PageHead } from '../parts'
import { GripVertical, Eye, EyeOff, Home, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'

// Kích thước LOGIC của thiết bị + mức thu nhỏ tối đa riêng cho từng loại.
const SIZES = {
  desktop: { w: 1280, h: 780, max: 0.8, label: 'Máy tính', I: Monitor },
  tablet: { w: 834, h: 1080, max: 0.58, label: 'Máy tính bảng', I: Tablet },
  mobile: { w: 390, h: 780, max: 0.55, label: 'Điện thoại', I: Smartphone },
} as const

interface Sec { type: string; label: string; visible: boolean }

function SortableRow({ s, onToggle }: { s: Sec; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.type })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }
  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2.5 rounded-xl border bg-card p-3 ${isDragging ? 'shadow-xl ring-2 ring-primary/40' : 'shadow-sm'} ${s.visible ? '' : 'opacity-60'}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1 text-muted-foreground hover:text-foreground" aria-label="Kéo để sắp xếp">
        <GripVertical className="size-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{s.label}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {s.visible ? <><Eye className="size-3" /> Đang hiển thị</> : <><EyeOff className="size-3" /> Đang ẩn</>}
        </div>
      </div>
      <Switch checked={s.visible} onCheckedChange={onToggle} />
    </div>
  )
}

/** Chặn tương tác (click/submit/menu) trong preview nhưng VẪN cho cuộn — iframe same-origin. */
function lockPreview(el: HTMLIFrameElement) {
  try {
    const doc = el.contentDocument
    if (!doc) return
    const stop = (e: Event) => { e.preventDefault(); e.stopPropagation() }
    ;['click', 'auxclick', 'dblclick', 'submit', 'contextmenu'].forEach((t) => doc.addEventListener(t, stop, true))
    doc.documentElement.style.cursor = 'default'
  } catch { /* khác origin thì bỏ qua */ }
}

/** Khung thiết bị (frame) bao quanh iframe đã thu nhỏ. Chỉ xem: chặn bấm nhưng vẫn cuộn được. */
function DeviceFrame({ device, w, h, scale, frameRef }: { device: keyof typeof SIZES; w: number; h: number; scale: number; frameRef: React.RefObject<HTMLIFrameElement> }) {
  const screen = (
    <div style={{ width: w * scale, height: h * scale, overflow: 'hidden' }}>
      <iframe ref={frameRef} src="/" title="Xem trước website" onLoad={(e) => lockPreview(e.currentTarget)}
        className="block bg-white"
        style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0 }} />
    </div>
  )
  if (device === 'mobile') {
    return (
      <div className="relative bg-neutral-900 rounded-[2.4rem] p-2.5 shadow-2xl">
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-neutral-900 rounded-b-2xl z-10" />
        <div className="overflow-hidden rounded-[1.7rem] ring-1 ring-white/10">{screen}</div>
      </div>
    )
  }
  if (device === 'tablet') {
    return (
      <div className="bg-neutral-800 rounded-[1.4rem] p-3 shadow-2xl">
        <div className="overflow-hidden rounded-xl ring-1 ring-white/10">{screen}</div>
      </div>
    )
  }
  return (
    <div className="rounded-xl border shadow-2xl overflow-hidden bg-white" style={{ width: w * scale }}>
      <div className="h-9 bg-neutral-100 border-b flex items-center gap-1.5 px-3">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-green-400" />
        <div className="ml-3 h-5 flex-1 max-w-sm rounded-md bg-white border flex items-center px-2 text-[11px] text-muted-foreground truncate">Xem trước website</div>
      </div>
      {screen}
    </div>
  )
}

export function LayoutPreview() {
  const sections = useContent((s) => s.content.sections) as Sec[]
  const setLayout = useContent((s) => s.setLayout)
  const [size, setSize] = useState<keyof typeof SIZES>('desktop')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [availW, setAvailW] = useState(0)
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setAvailW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
    }) // áp dụng ngay lên website, không cần bấm Lưu
    toast.success('Đã cập nhật thứ tự — website đã cập nhật')
  }
  const toggle = (type: string) => {
    let shown = false
    setLayout((c) => {
      const it = c.sections.find((x) => x.type === type); if (it) { it.visible = !it.visible; shown = it.visible }
    }) // bật/tắt hiển thị cũng áp dụng ngay
    toast.success(shown ? 'Đã bật hiển thị — website đã cập nhật' : 'Đã ẩn phần này — website đã cập nhật')
  }
  const reload = () => { if (iframeRef.current) iframeRef.current.src = '/?preview=' + Date.now() }

  const S = SIZES[size]
  // Mỗi thiết bị có mức thu nhỏ riêng, và luôn vừa cột phải.
  const scale = availW ? Math.min(S.max, (availW - 24) / S.w) : S.max * 0.9

  return (
    <div>
      <PageHead title="Bố cục & Xem trước" desc="Kéo–thả để sắp xếp các phần và bật/tắt hiển thị — mọi thay đổi áp dụng NGAY lên website, không cần bấm Lưu. Khung xem trước bên phải tự cập nhật." />

      <div className="grid lg:grid-cols-[280px_1fr] gap-5 items-start">
        {/* LEFT: draggable sections */}
        <div className="space-y-3 lg:sticky lg:top-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3">
            <span className="grid place-items-center size-9 rounded-lg bg-primary text-primary-foreground"><Home className="size-4.5" /></span>
            <div className="flex-1"><div className="font-medium text-sm">Trang chủ</div><div className="text-xs text-muted-foreground">Không thể tắt</div></div>
            <span className="text-[11px] font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">Cố định</span>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sections.map((s) => s.type)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2.5">
                {sections.map((s) => <SortableRow key={s.type} s={s} onToggle={() => toggle(s.type)} />)}
              </div>
            </SortableContext>
          </DndContext>

          <p className="text-xs text-muted-foreground pt-1">Mẹo: giữ và kéo biểu tượng <GripVertical className="inline size-3.5 -mt-0.5" /> để đổi thứ tự.</p>
        </div>

        {/* RIGHT: live preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex rounded-lg border bg-background p-1">
              {(Object.keys(SIZES) as (keyof typeof SIZES)[]).map((k) => {
                const S = SIZES[k]
                return (
                  <button key={k} onClick={() => setSize(k)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${size === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    <S.I className="size-4" /> <span className="hidden sm:inline">{S.label}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="size-4" /> Làm mới</Button>
              <Button asChild variant="outline" size="sm"><a href="/" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Tab mới</a></Button>
            </div>
          </div>
          <div className="rounded-xl border bg-secondary/40 p-6">
            <div ref={wrapRef} className="flex justify-center py-2">
              <DeviceFrame device={size} w={S.w} h={S.h} scale={scale} frameRef={iframeRef} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Có thể <b>cuộn</b> để xem, nhưng không bấm/thao tác được trong khung. Bấm <b>Tab mới</b> để mở website thật.</p>
        </div>
      </div>
    </div>
  )
}
