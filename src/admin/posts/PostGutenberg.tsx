import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useContent, slugify, type Post, type PageDef, type RowElement, type RowElementKind, type RowColumn } from '@/store/content'
import { MediaPicker, useMediaLib } from '../media/MediaPicker'
import { ThemeStyle } from '@/site/ThemeStyle'
import { typoStyle, SOCIAL_ICONS, SOCIAL_LABEL } from '@/site/sections/CustomRow'
import { Icon, ICON_OPTIONS } from '@/lib/icons'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Popover } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Settings, Eye, ExternalLink, Check, X, Search,
  Pilcrow, Heading, Image as ImageIcon, List, MousePointerClick, Video, MapPin, Minus, StretchVertical, CalendarDays,
  Quote, Images, Code, Sparkles, Newspaper, Share2, Table, Globe, Columns2, GripVertical, Copy, Upload, Undo2, Redo2,
} from 'lucide-react'

const WP = 'hsl(var(--primary))' // đồng bộ màu chính của admin
// Mở hộp chọn ảnh từ Thư viện Media (truyền callback nhận URL). Cung cấp bởi GutenbergEditor.
const MediaCtx = createContext<(cb: (url: string) => void) => void>(() => {})

type BlockDef = { kind: RowElementKind; label: string; icon: typeof Pilcrow }
const CATALOG: { group: string; items: BlockDef[] }[] = [
  { group: 'Văn bản', items: [
    { kind: 'text', label: 'Đoạn văn', icon: Pilcrow },
    { kind: 'heading', label: 'Tiêu đề', icon: Heading },
    { kind: 'list', label: 'Danh sách', icon: List },
    { kind: 'quote', label: 'Trích dẫn', icon: Quote },
    { kind: 'table', label: 'Bảng', icon: Table },
  ] },
  { group: 'Phương tiện', items: [
    { kind: 'image', label: 'Ảnh', icon: ImageIcon },
    { kind: 'gallery', label: 'Thư viện ảnh', icon: Images },
    { kind: 'video', label: 'Video', icon: Video },
  ] },
  { group: 'Thiết kế', items: [
    { kind: 'columns', label: 'Cột', icon: Columns2 },
    { kind: 'button', label: 'Nút', icon: MousePointerClick },
    { kind: 'icon', label: 'Biểu tượng', icon: Sparkles },
    { kind: 'map', label: 'Bản đồ', icon: MapPin },
    { kind: 'divider', label: 'Đường kẻ', icon: Minus },
    { kind: 'spacer', label: 'Khoảng trắng', icon: StretchVertical },
    { kind: 'html', label: 'HTML tùy chỉnh', icon: Code },
  ] },
  { group: 'Tiện ích', items: [
    { kind: 'latestposts', label: 'Bài viết mới', icon: Newspaper },
    { kind: 'socials', label: 'Mạng xã hội', icon: Share2 },
  ] },
]
const ALL_BLOCKS: BlockDef[] = CATALOG.flatMap((c) => c.items)
const KIND_ICON = Object.fromEntries(ALL_BLOCKS.map((b) => [b.kind, b.icon])) as Record<RowElementKind, typeof Pilcrow>
const KIND_LABEL = Object.fromEntries(ALL_BLOCKS.map((b) => [b.kind, b.label])) as Record<RowElementKind, string>

function makeBlock(kind: RowElementKind, id: string): RowElement {
  switch (kind) {
    case 'image': return { id, kind, url: '', alt: '' }
    case 'heading': return { id, kind, text: '' }
    case 'text': return { id, kind, text: '' }
    case 'button': return { id, kind, text: 'Nút bấm', href: '#' }
    case 'icon': return { id, kind, name: 'heart' }
    case 'video': return { id, kind, url: '' }
    case 'spacer': return { id, kind, size: 'md' }
    case 'divider': return { id, kind }
    case 'map': return { id, kind, address: '' }
    case 'list': return { id, kind, items: ['Mục thứ nhất'], icon: 'check' }
    case 'quote': return { id, kind, text: '', cite: '' }
    case 'gallery': return { id, kind, images: [] }
    case 'html': return { id, kind, html: '' }
    case 'latestposts': return { id, kind, count: 3 }
    case 'socials': return { id, kind, items: [{ id: rid(), platform: 'facebook', url: '' }] }
    case 'table': return { id, kind, rows: [['Cột 1', 'Cột 2'], ['', '']] }
    case 'columns': return { id, kind, cols: [{ id: rid(), elements: [] }, { id: rid(), elements: [] }] }
  }
}
const rid = () => Math.random().toString(36).slice(2, 9)
// Các phần tử con cho phép thả vào từng cột.
const CHILD_ADDS: { kind: RowElementKind; label: string; icon: typeof Pilcrow }[] = [
  { kind: 'heading', label: 'Tiêu đề', icon: Heading },
  { kind: 'text', label: 'Chữ', icon: Pilcrow },
  { kind: 'image', label: 'Ảnh', icon: ImageIcon },
  { kind: 'button', label: 'Nút', icon: MousePointerClick },
  { kind: 'list', label: 'Danh sách', icon: List },
  { kind: 'icon', label: 'Icon', icon: Sparkles },
]
/** Chọn NHIỀU ảnh → data URL (cho thư viện ảnh). */
function pickImages(onPick: (urls: string[]) => void) {
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.multiple = true
  input.onchange = () => {
    const files = Array.from(input.files || [])
    if (!files.length) return
    Promise.all(files.map((f) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(f) }))).then(onPick)
  }
  input.click()
}
function pickImage(onPick: (url: string) => void) {
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'
  input.onchange = () => { const f = input.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => onPick(String(r.result)); r.readAsDataURL(f) }
  input.click()
}

/** Ô nhập tự giãn chiều cao — để gõ tiêu đề/đoạn văn ngay trên canvas. */
function AutoArea({ value, onChange, placeholder, className, style }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { const el = ref.current; if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }, [value])
  return <textarea ref={ref} rows={1} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className={`block w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-black/25 ${className || ''}`} style={style} />
}

/** Nút chèn khối "+" giữa các khối (Gutenberg). */
function Inserter({ onPick }: { onPick: (k: RowElementKind) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen} align="start" className="w-[264px] p-2"
      trigger={
        <div className="relative h-4 flex items-center justify-center group/ins">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent group-hover/ins:bg-[color:var(--wp)]" style={{ ['--wp' as any]: WP + '55' }} />
          <button type="button" onClick={() => setOpen(true)} className="relative z-10 grid size-6 place-items-center rounded-full text-white opacity-0 group-hover/ins:opacity-100 transition-opacity shadow" style={{ background: WP }}><Plus className="size-4" /></button>
        </div>
      }>
      <div className="text-[.66rem] font-bold uppercase tracking-wider text-muted-foreground px-1 pb-1.5">Thêm khối</div>
      <div className="grid grid-cols-3 gap-1">
        {ALL_BLOCKS.map((b) => (
          <button key={b.kind} type="button" onClick={() => { onPick(b.kind); setOpen(false) }}
            className="flex flex-col items-center gap-1 rounded-md p-2 hover:bg-accent transition-colors text-[.68rem] font-medium text-center">
            <b.icon className="size-5" style={{ color: WP }} /> {b.label}
          </button>
        ))}
      </div>
    </Popover>
  )
}

/** Bảng sửa trực tiếp trên canvas: gõ vào từng ô + thêm/xóa hàng, cột. */
function TableCanvas({ rows, onChange }: { rows: string[][]; onChange: (rows: string[][]) => void }) {
  const cols = rows[0]?.length || 0
  const setCell = (r: number, c: number, v: string) => onChange(rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? v : cell) : row))
  const addRow = () => onChange([...rows, Array(cols || 1).fill('')])
  const delRow = (r: number) => onChange(rows.filter((_, i) => i !== r))
  const addCol = () => onChange(rows.map((row) => [...row, '']))
  const delCol = (c: number) => onChange(rows.map((row) => row.filter((_, i) => i !== c)))
  return (
    <div>
      <table className="w-full border-collapse text-[.95rem]">
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="group/row">
              {row.map((cell, ci) => (
                <td key={ci} className="border p-0 relative" style={{ borderColor: 'var(--tl-line)', background: ri === 0 ? 'var(--tl-tint)' : undefined }}>
                  {ri === 0 && cols > 1 && <button onClick={() => delCol(ci)} title="Xóa cột" className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 hidden group-hover/row:grid size-5 place-items-center rounded-full bg-foreground text-background leading-none">×</button>}
                  <input value={cell} onChange={(e) => setCell(ri, ci, e.target.value)} placeholder={ri === 0 ? 'Tiêu đề' : '…'} className={`w-full bg-transparent px-3 py-2 outline-none ${ri === 0 ? 'font-bold' : ''}`} style={{ color: ri === 0 ? 'var(--tl-ink)' : 'var(--tl-slate)' }} />
                </td>
              ))}
              {rows.length > 1 && <td className="border-0 w-8 text-center align-middle"><button onClick={() => delRow(ri)} title="Xóa hàng" className="hidden group-hover/row:inline-grid size-6 place-items-center rounded text-destructive hover:bg-destructive/10"><Trash2 className="size-3.5" /></button></td>}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-3 mt-2">
        <button onClick={addRow} className="inline-flex items-center gap-1 text-[.78rem] font-semibold hover:underline" style={{ color: WP }}><Plus className="size-3.5" /> Thêm hàng</button>
        <button onClick={addCol} className="inline-flex items-center gap-1 text-[.78rem] font-semibold hover:underline" style={{ color: WP }}><Plus className="size-3.5" /> Thêm cột</button>
      </div>
    </div>
  )
}

/** Ô sửa gọn cho phần tử con trong cột. */
function ChildFields({ e, onPatch }: { e: RowElement; onPatch: (p: Record<string, unknown>) => void }) {
  const openMedia = useContext(MediaCtx)
  if (e.kind === 'heading') return <Input value={e.text} onChange={(ev) => onPatch({ text: ev.target.value })} placeholder="Tiêu đề" className="h-8 font-bold" />
  if (e.kind === 'text') return <Textarea value={e.text} onChange={(ev) => onPatch({ text: ev.target.value })} placeholder="Nội dung" className="min-h-[56px]" />
  if (e.kind === 'image') return (
    <div className="space-y-1.5">
      {e.url && <img src={e.url} alt="" className="w-full aspect-video object-cover rounded border" />}
      <Button size="sm" variant="outline" className="w-full h-8" onClick={() => openMedia((url) => onPatch({ url }))}><ImageIcon className="size-3.5" /> {e.url ? 'Đổi ảnh' : 'Chọn ảnh'}</Button>
    </div>
  )
  if (e.kind === 'button') return <div className="space-y-1.5"><Input value={e.text} onChange={(ev) => onPatch({ text: ev.target.value })} placeholder="Chữ nút" className="h-8" /><Input value={e.href} onChange={(ev) => onPatch({ href: ev.target.value })} placeholder="#dat-lich" className="h-8" /></div>
  if (e.kind === 'list') return <Textarea value={e.items.join('\n')} onChange={(ev) => onPatch({ items: ev.target.value.split('\n') })} placeholder="Mỗi dòng một mục" className="min-h-[56px]" />
  if (e.kind === 'icon') return (
    <Select value={e.name} onValueChange={(v) => onPatch({ name: v })}><SelectTrigger className="h-8 text-[.8rem]"><SelectValue /></SelectTrigger><SelectContent className="max-h-56">{ICON_OPTIONS.map((n) => <SelectItem key={n} value={n}><span className="flex items-center gap-2"><Icon name={n} className="size-4" /> {n}</span></SelectItem>)}</SelectContent></Select>
  )
  return null
}

/** Thẻ 1 phần tử con (trong cột) — tiêu đề loại + nút lên/xuống/xóa + ô sửa. */
function ChildCard({ e, onPatch, onDel, onUp, onDown }: { e: RowElement; onPatch: (p: Record<string, unknown>) => void; onDel: () => void; onUp: () => void; onDown: () => void }) {
  const I = KIND_ICON[e.kind]
  return (
    <div className="rounded-md border bg-muted/30 p-2 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <I className="size-3.5" style={{ color: WP }} />
        <span className="text-[.68rem] font-semibold flex-1">{KIND_LABEL[e.kind]}</span>
        <button onClick={onUp} className="grid size-5 place-items-center rounded hover:bg-muted"><ChevronUp className="size-3" /></button>
        <button onClick={onDown} className="grid size-5 place-items-center rounded hover:bg-muted"><ChevronDown className="size-3" /></button>
        <button onClick={onDel} className="grid size-5 place-items-center rounded text-destructive hover:bg-destructive/10"><Trash2 className="size-3" /></button>
      </div>
      <ChildFields e={e} onPatch={onPatch} />
    </div>
  )
}

/** Khối CỘT: chia cột, mỗi cột thả phần tử con và sửa gọn tại chỗ. */
function ColumnsCanvas({ cols, onChange }: { cols: RowColumn[]; onChange: (cols: RowColumn[]) => void }) {
  const editCol = (colId: string, fn: (els: RowElement[]) => RowElement[]) => onChange(cols.map((c) => c.id === colId ? { ...c, elements: fn(c.elements) } : c))
  const move = (els: RowElement[], i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= els.length) return els; const a = [...els]; [a[i], a[j]] = [a[j], a[i]]; return a }
  return (
    <div className={`grid gap-3 ${cols.length >= 3 ? 'sm:grid-cols-3' : cols.length === 2 ? 'sm:grid-cols-2' : ''}`}>
      {cols.map((col) => (
        <div key={col.id} className="rounded-lg border border-dashed p-2.5 space-y-2" style={{ borderColor: 'var(--tl-line)' }}>
          {col.elements.map((e, ei) => (
            <ChildCard key={e.id} e={e}
              onPatch={(p) => editCol(col.id, (els) => els.map((x) => x.id === e.id ? { ...x, ...p } as RowElement : x))}
              onDel={() => editCol(col.id, (els) => els.filter((x) => x.id !== e.id))}
              onUp={() => editCol(col.id, (els) => move(els, ei, -1))}
              onDown={() => editCol(col.id, (els) => move(els, ei, 1))} />
          ))}
          {col.elements.length === 0 && <div className="text-center text-[.72rem] text-muted-foreground py-2">Cột trống</div>}
          <div className="flex flex-wrap gap-1">
            {CHILD_ADDS.map((a) => (
              <button key={a.kind} title={a.label} onClick={() => editCol(col.id, (els) => [...els, makeBlock(a.kind, rid())])}
                className="inline-flex items-center gap-0.5 rounded border px-1.5 py-1 text-[.66rem] font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Plus className="size-2.5" /><a.icon className="size-3" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Xem trước 1 khối trên canvas (text/heading/bảng gõ trực tiếp; khối khác sửa ở panel phải). */
function BlockContent({ b, onText, onPickImg, patch }: { b: RowElement; onText: (v: string) => void; onPickImg: () => void; patch: (p: Record<string, unknown>) => void }) {
  switch (b.kind) {
    case 'heading':
      return <AutoArea value={b.text} onChange={onText} placeholder="Tiêu đề" className="site-head font-bold text-[clamp(1.4rem,3vw,2rem)] leading-tight" style={{ color: 'var(--tl-ink)', ...typoStyle('heading', b.size, b.color) }} />
    case 'text':
      return <AutoArea value={b.text} onChange={onText} placeholder="Nhập nội dung, hoặc bấm ➕ để thêm khối…" className="text-[1.05rem] leading-relaxed" style={{ color: 'var(--tl-slate)', ...typoStyle('text', b.size, b.color) }} />
    case 'image':
      return b.url
        ? <img src={b.url} alt={b.alt || ''} className="w-full rounded-lg border object-cover" style={{ borderColor: 'var(--tl-line)' }} />
        : <button type="button" onClick={onPickImg} className="w-full aspect-[16/9] rounded-lg border-2 border-dashed grid place-items-center text-muted-foreground hover:border-[color:var(--wp)] hover:text-[color:var(--wp)] transition-colors" style={{ ['--wp' as any]: WP }}><span className="flex flex-col items-center gap-1.5 text-[.85rem]"><ImageIcon className="size-7" /> Chọn ảnh</span></button>
    case 'button':
      return <span className="inline-flex items-center rounded-lg px-5 py-3 font-semibold text-white" style={{ background: 'var(--tl-primary)' }}>{b.text || 'Nút bấm'}</span>
    case 'list':
      return <ul className="space-y-2">{b.items.map((it, i) => <li key={i} className="flex items-start gap-2.5 text-[1.02rem]" style={{ color: 'var(--tl-slate)' }}><span className="mt-0.5" style={{ color: 'var(--tl-primary)' }}><Icon name={b.icon || 'check'} className="size-5" /></span>{it}</li>)}</ul>
    case 'video':
      return b.url
        ? <div className="relative w-full overflow-hidden rounded-lg border" style={{ aspectRatio: '16/9', borderColor: 'var(--tl-line)' }}><iframe src={b.url} className="absolute inset-0 h-full w-full" title="Video" /></div>
        : <div className="w-full aspect-video rounded-lg border-2 border-dashed grid place-items-center text-muted-foreground"><span className="flex items-center gap-2 text-sm"><Video className="size-5" /> Dán liên kết video ở panel bên phải</span></div>
    case 'map':
      return b.address
        ? <div className="relative w-full overflow-hidden rounded-lg border" style={{ aspectRatio: '16/10', borderColor: 'var(--tl-line)' }}><iframe title="Bản đồ" className="absolute inset-0 h-full w-full" src={`https://maps.google.com/maps?q=${encodeURIComponent(b.address)}&z=16&output=embed`} /></div>
        : <div className="w-full aspect-[16/10] rounded-lg border-2 border-dashed grid place-items-center text-muted-foreground"><span className="flex items-center gap-2 text-sm"><MapPin className="size-5" /> Nhập địa chỉ ở panel bên phải</span></div>
    case 'divider':
      return <hr className="border-0 border-t" style={{ borderColor: 'var(--tl-line)' }} />
    case 'spacer':
      return <div className="rounded border border-dashed grid place-items-center text-[.7rem] text-muted-foreground" style={{ height: b.size === 'lg' ? 64 : b.size === 'sm' ? 20 : 36 }}>Khoảng trắng</div>
    case 'icon':
      return <span className="grid place-items-center size-14 rounded-2xl" style={{ background: 'var(--tl-soft)', color: 'var(--tl-primary)' }}><Icon name={b.name} className="size-7" /></span>
    case 'quote':
      return (
        <blockquote className="pl-5 border-l-4" style={{ borderColor: 'var(--tl-primary)' }}>
          <AutoArea value={b.text} onChange={onText} placeholder="Nội dung trích dẫn" className="site-head italic font-semibold text-[1.3rem] leading-relaxed" style={{ color: 'var(--tl-ink)' }} />
          {b.cite && <cite className="block mt-1 not-italic text-[.9rem] font-semibold" style={{ color: 'var(--tl-slate)' }}>— {b.cite}</cite>}
        </blockquote>
      )
    case 'gallery':
      return b.images.length
        ? <div className="grid grid-cols-3 gap-2">{b.images.map((im) => <img key={im.id} src={im.url} alt="" className="w-full aspect-square object-cover rounded border" style={{ borderColor: 'var(--tl-line)' }} />)}</div>
        : <div className="w-full aspect-[16/9] rounded-lg border-2 border-dashed grid place-items-center text-muted-foreground"><span className="flex items-center gap-2 text-sm"><Images className="size-5" /> Thêm ảnh ở panel bên phải</span></div>
    case 'html':
      return b.html.trim()
        ? <div className="tl-html" dangerouslySetInnerHTML={{ __html: b.html }} />
        : <div className="w-full rounded-lg border-2 border-dashed py-8 grid place-items-center text-muted-foreground"><span className="flex items-center gap-2 text-sm"><Code className="size-5" /> Nhập HTML ở panel bên phải</span></div>
    case 'latestposts':
      return <div className="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground"><Newspaper className="size-6 mx-auto mb-1.5" /><div className="text-sm font-medium">Bài viết mới nhất — {b.count || 3} bài</div><div className="text-[.72rem]">Tự lấy từ trang Tin tức khi đăng</div></div>
    case 'socials':
      return b.items.length
        ? <div className="flex flex-wrap gap-2.5">{b.items.map((it) => { const I = SOCIAL_ICONS[it.platform] || Globe; return <span key={it.id} className="grid size-11 place-items-center rounded-full text-white" style={{ background: 'var(--tl-primary)' }}><I className="size-5" /></span> })}</div>
        : <div className="rounded-lg border-2 border-dashed py-6 grid place-items-center text-sm text-muted-foreground"><span className="flex items-center gap-2"><Share2 className="size-5" /> Thêm liên kết ở panel bên phải</span></div>
    case 'table':
      return <TableCanvas rows={b.rows} onChange={(rows) => patch({ rows })} />
    case 'columns':
      return <ColumnsCanvas cols={b.cols} onChange={(cols) => patch({ cols })} />
  }
}

/** Panel cài đặt khối (bên phải). */
function BlockSettings({ b, patch }: { b: RowElement; patch: (p: Record<string, unknown>) => void }) {
  const openMedia = useContext(MediaCtx)
  const lib = useMediaLib()
  if (b.kind === 'image') return (
    <div className="space-y-2">
      <Button size="sm" variant="outline" className="w-full" onClick={() => openMedia((url) => patch({ url }))}><ImageIcon className="size-4" /> {b.url ? 'Đổi ảnh' : 'Chọn ảnh'}</Button>
      <div><Label>Mô tả ảnh (alt)</Label><Input value={b.alt || ''} onChange={(e) => patch({ alt: e.target.value })} className="mt-1" /></div>
    </div>
  )
  if (b.kind === 'button') return (
    <div className="space-y-2">
      <div><Label>Chữ trên nút</Label><Input value={b.text} onChange={(e) => patch({ text: e.target.value })} className="mt-1" /></div>
      <div><Label>Liên kết</Label><Input value={b.href} onChange={(e) => patch({ href: e.target.value })} placeholder="#dat-lich" className="mt-1" /></div>
    </div>
  )
  if (b.kind === 'list') return (
    <div className="space-y-2">
      <div><Label>Các mục (mỗi dòng một mục)</Label><Textarea value={b.items.join('\n')} onChange={(e) => patch({ items: e.target.value.split('\n') })} className="mt-1 min-h-[100px]" /></div>
    </div>
  )
  if (b.kind === 'video') return <div><Label>Liên kết nhúng (YouTube…)</Label><Input value={b.url} onChange={(e) => patch({ url: e.target.value })} placeholder="https://www.youtube.com/embed/…" className="mt-1" /></div>
  if (b.kind === 'map') return <div><Label>Địa chỉ</Label><Input value={b.address} onChange={(e) => patch({ address: e.target.value })} placeholder="16/63 Tuệ Tĩnh, TP.HCM" className="mt-1" /></div>
  if (b.kind === 'spacer') return (
    <div><Label>Chiều cao</Label>
      <Select value={b.size || 'md'} onValueChange={(v) => patch({ size: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sm">Nhỏ</SelectItem><SelectItem value="md">Vừa</SelectItem><SelectItem value="lg">Lớn</SelectItem></SelectContent></Select>
    </div>
  )
  if (b.kind === 'heading' || b.kind === 'text') return (
    <div className="space-y-3">
      <div>
        <Label>Cỡ chữ</Label>
        <div className="mt-1 inline-flex rounded-md border bg-background p-0.5">
          {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <button key={s} onClick={() => patch({ size: s })} className={`w-9 h-8 rounded text-[.8rem] font-bold transition-colors ${(b.size || 'md') === s ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`} style={(b.size || 'md') === s ? { background: WP } : undefined}>{s === 'sm' ? 'S' : s === 'md' ? 'M' : s === 'lg' ? 'L' : 'XL'}</button>
          ))}
        </div>
      </div>
      <div>
        <Label>Màu chữ</Label>
        <div className="mt-1 flex items-center gap-2">
          <input type="color" value={b.color || '#111827'} onChange={(e) => patch({ color: e.target.value })} className="size-9 rounded-md border cursor-pointer bg-white p-0.5" />
          <span className="text-[.8rem] text-muted-foreground flex-1">{b.color || 'Mặc định theo giao diện'}</span>
          {b.color && <Button size="sm" variant="ghost" className="h-8" onClick={() => patch({ color: undefined })}>Đặt lại</Button>}
        </div>
      </div>
    </div>
  )
  if (b.kind === 'quote') return <div><Label>Nguồn / tác giả</Label><Input value={b.cite || ''} onChange={(e) => patch({ cite: e.target.value })} placeholder="ThS.BS Trần Thị Tuyết Lan" className="mt-1" /></div>
  if (b.kind === 'html') return <div><Label>Mã HTML</Label><Textarea value={b.html} onChange={(e) => patch({ html: e.target.value })} placeholder="<div>…</div>" className="mt-1 min-h-[150px] font-mono text-[.78rem]" /></div>
  if (b.kind === 'icon') return (
    <div><Label>Chọn biểu tượng</Label>
      <Select value={b.name} onValueChange={(v) => patch({ name: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent className="max-h-64">{ICON_OPTIONS.map((n) => <SelectItem key={n} value={n}><span className="flex items-center gap-2"><Icon name={n} className="size-4" /> {n}</span></SelectItem>)}</SelectContent></Select>
    </div>
  )
  if (b.kind === 'gallery') return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => lib.upload((urls) => patch({ images: [...b.images, ...urls.map((u) => ({ id: rid(), url: u }))] }))}><Upload className="size-4" /> Tải ảnh</Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => openMedia((url) => patch({ images: [...b.images, { id: rid(), url }] }))}><Images className="size-4" /> Từ thư viện</Button>
      </div>
      {b.images.length > 0 && <div className="grid grid-cols-3 gap-1.5">{b.images.map((im) => <div key={im.id} className="relative group"><img src={im.url} alt="" className="w-full aspect-square object-cover rounded border" /><button onClick={() => patch({ images: b.images.filter((x) => x.id !== im.id) })} className="absolute top-0.5 right-0.5 grid size-5 place-items-center rounded bg-black/60 text-white opacity-0 group-hover:opacity-100"><X className="size-3" /></button></div>)}</div>}
    </div>
  )
  if (b.kind === 'latestposts') return (
    <div><Label>Số bài hiển thị</Label>
      <Select value={String(b.count || 3)} onValueChange={(v) => patch({ count: Number(v) })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{[3, 6, 9].map((n) => <SelectItem key={n} value={String(n)}>{n} bài</SelectItem>)}</SelectContent></Select>
    </div>
  )
  if (b.kind === 'table') return <p className="text-sm text-muted-foreground">Sửa trực tiếp trên bảng ở canvas: gõ vào từng ô, bấm <b className="text-foreground">Thêm hàng / Thêm cột</b>, rê chuột để xóa hàng/cột.</p>
  if (b.kind === 'columns') return (
    <div>
      <Label>Số cột</Label>
      <div className="mt-1 inline-flex rounded-md border bg-background p-0.5">
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => { let cols = [...b.cols]; if (n > cols.length) { while (cols.length < n) cols.push({ id: rid(), elements: [] }) } else if (n < cols.length) { cols = cols.slice(0, n) } patch({ cols }) }}
            className={`w-9 h-8 rounded text-[.8rem] font-bold transition-colors ${b.cols.length === n ? 'text-primary-foreground' : 'text-muted-foreground'}`} style={b.cols.length === n ? { background: WP } : undefined}>{n}</button>
        ))}
      </div>
      <p className="text-[.68rem] text-muted-foreground mt-1.5">Thêm phần tử vào từng cột ngay trên canvas.</p>
    </div>
  )
  if (b.kind === 'socials') return (
    <div className="space-y-2">
      {b.items.map((it) => (
        <div key={it.id} className="flex items-center gap-1.5">
          <Select value={it.platform} onValueChange={(v) => patch({ items: b.items.map((x) => x.id === it.id ? { ...x, platform: v } : x) })}><SelectTrigger className="h-9 w-[110px] text-[.8rem] shrink-0"><SelectValue /></SelectTrigger><SelectContent>{Object.keys(SOCIAL_LABEL).map((k) => <SelectItem key={k} value={k}>{SOCIAL_LABEL[k]}</SelectItem>)}</SelectContent></Select>
          <Input value={it.url} onChange={(e) => patch({ items: b.items.map((x) => x.id === it.id ? { ...x, url: e.target.value } : x) })} placeholder="https://…" className="h-9 flex-1" />
          <button onClick={() => patch({ items: b.items.filter((x) => x.id !== it.id) })} className="grid size-8 place-items-center rounded text-destructive hover:bg-destructive/10 shrink-0"><Trash2 className="size-4" /></button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => patch({ items: [...b.items, { id: Math.random().toString(36).slice(2, 9), platform: 'facebook', url: '' }] })}><Plus className="size-4" /> Thêm liên kết</Button>
    </div>
  )
  return <p className="text-sm text-muted-foreground">Khối này không có cài đặt riêng — gõ trực tiếp trên canvas.</p>
}

/** Bảng THƯ VIỆN KHỐI bên trái (kiểu Gutenberg): tìm + phân nhóm. */
function BlockLibrary({ onClose, onAdd }: { onClose: () => void; onAdd: (k: RowElementKind) => void }) {
  const [q, setQ] = useState('')
  const nq = q.trim().toLowerCase()
  return (
    <aside className="w-72 shrink-0 bg-background border-r flex flex-col">
      <div className="flex items-center justify-between px-4 h-12 border-b shrink-0"><span className="font-semibold text-sm">Khối</span><button onClick={onClose} className="grid size-7 place-items-center rounded hover:bg-muted"><X className="size-4" /></button></div>
      <div className="p-3 shrink-0">
        <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm khối" className="h-9 pl-8" /></div>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        {CATALOG.map((cat) => {
          const items = cat.items.filter((it) => !nq || it.label.toLowerCase().includes(nq))
          if (!items.length) return null
          return (
            <div key={cat.group} className="px-3 mb-2">
              <div className="text-[.66rem] font-bold uppercase tracking-wider text-muted-foreground px-1 py-1.5">{cat.group}</div>
              <div className="grid grid-cols-3 gap-1.5">
                {items.map((it) => (
                  <button key={it.kind} onClick={() => onAdd(it.kind)} title={it.label}
                    className="flex flex-col items-center gap-1.5 rounded-lg border p-2.5 hover:border-[color:var(--wp)] hover:bg-[color:var(--wp)]/5 transition-colors" style={{ ['--wp' as any]: WP }}>
                    <it.icon className="size-6 text-muted-foreground" /><span className="text-[.66rem] font-medium text-center leading-tight">{it.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

/** Bọc 1 khối để kéo–thả sắp thứ tự; `children` nhận props của tay cầm kéo. */
function SortableBlock({ id, children }: { id: string; children: (handle: Record<string, unknown>) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : undefined, zIndex: isDragging ? 40 : undefined, position: 'relative' }
  return <div ref={setNodeRef} style={style}>{children({ ...attributes, ...listeners })}</div>
}

/** Trình soạn thảo Gutenberg (toàn màn hình) — dùng chung cho BÀI VIẾT và TRANG PHỤ. */
export function GutenbergEditor({ kind, id, onClose, onDelete }: { kind: 'post' | 'page'; id: string; onClose: () => void; onDelete: () => void }) {
  const entity = useContent((s) => (kind === 'post' ? s.content.posts.find((p) => p.id === id) : s.content.pages.find((p) => p.id === id)))
  const blog = useContent((s) => s.content.blog)
  const setLayout = useContent((s) => s.setLayout)
  const newId = useContent((s) => s.newId)
  const [sel, setSel] = useState<string | null>(null)
  const [tab, setTab] = useState<'doc' | 'block'>('doc')
  const [panel, setPanel] = useState(true)
  const [libOpen, setLibOpen] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const mediaCb = useRef<(url: string) => void>(() => {})
  const openMedia = (cb: (url: string) => void) => { mediaCb.current = cb; setMediaOpen(true) }

  // ---- Undo / Redo (lịch sử chỉnh sửa) ----
  const histRef = useRef<{ past: string[]; future: string[] }>({ past: [], future: [] })
  const lastSnapRef = useRef('')
  const lastTsRef = useRef(0)
  const travelRef = useRef(false)
  const [, forceHist] = useState(0)
  const entitySnap = () => { const c = useContent.getState().content; const e = kind === 'post' ? c.posts.find((x) => x.id === id) : c.pages.find((x) => x.id === id); return JSON.stringify(e) }
  const restoreSnap = (snap: string) => { travelRef.current = true; lastSnapRef.current = snap; const data = JSON.parse(snap); setLayout((c) => { const arr: any[] = kind === 'post' ? c.posts : c.pages; const i = arr.findIndex((x) => x.id === id); if (i >= 0) arr[i] = data }) }
  const undo = () => { const h = histRef.current; if (!h.past.length) return; h.future.push(entitySnap()); restoreSnap(h.past.pop()!); forceHist((v) => v + 1) }
  const redo = () => { const h = histRef.current; if (!h.future.length) return; h.past.push(entitySnap()); restoreSnap(h.future.pop()!); forceHist((v) => v + 1) }
  useEffect(() => {
    if (!entity) return
    const cur = JSON.stringify(entity)
    if (cur === lastSnapRef.current) return
    if (travelRef.current) { travelRef.current = false; lastSnapRef.current = cur; return }
    const prev = lastSnapRef.current
    lastSnapRef.current = cur
    if (!prev) return
    const now = Date.now()
    if (now - lastTsRef.current > 700 || histRef.current.past.length === 0) {
      histRef.current.past.push(prev)
      if (histRef.current.past.length > 80) histRef.current.past.shift()
      histRef.current.future = []
      forceHist((v) => v + 1)
    }
    lastTsRef.current = now
  }, [entity])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // undo/redo đọc state tươi từ store

  if (!entity) return null
  const post = entity as Post
  const page = entity as PageDef
  const blocks = entity.sections[0]?.row?.cols[0]?.elements ?? []
  const selBlock = sel ? blocks.find((b) => b.id === sel) : null
  const viewUrl = kind === 'post' ? `/${blog.slug}/${entity.slug}` : `/${entity.slug}`
  const statusText = kind === 'post' ? (post.published ? 'Đã đăng · lưu tự động' : 'Bản nháp · lưu tự động') : 'Trang · lưu tự động'

  const editEntity = (fn: (e: Post & PageDef) => void) => setLayout((c) => { const e = (kind === 'post' ? c.posts.find((x) => x.id === id) : c.pages.find((x) => x.id === id)) as (Post & PageDef) | undefined; if (e) fn(e) })
  const editBody = (fn: (els: RowElement[]) => void) => setLayout((c) => { const e = kind === 'post' ? c.posts.find((x) => x.id === id) : c.pages.find((x) => x.id === id); const col = e?.sections[0]?.row?.cols[0]; if (col) fn(col.elements) })
  const patchBlock = (bid: string, p: Record<string, unknown>) => editBody((els) => { const b = els.find((e) => e.id === bid); if (b) Object.assign(b, p) })
  const addBlock = (kind: RowElementKind, at: number) => { const b = makeBlock(kind, newId()); editBody((els) => { els.splice(at, 0, b) }); setSel(b.id); setTab('block') }
  const delBlock = (bid: string) => { editBody((els) => { const i = els.findIndex((e) => e.id === bid); if (i >= 0) els.splice(i, 1) }); setSel(null); setTab('doc') }
  const moveBlock = (bid: string, dir: -1 | 1) => editBody((els) => { const i = els.findIndex((e) => e.id === bid); const j = i + dir; if (i < 0 || j < 0 || j >= els.length) return; [els[i], els[j]] = [els[j], els[i]] })
  const dupBlock = (bid: string) => editBody((els) => { const i = els.findIndex((e) => e.id === bid); if (i < 0) return; const clone = JSON.parse(JSON.stringify(els[i])) as RowElement; clone.id = newId(); els.splice(i + 1, 0, clone); setSel(clone.id) })
  const insertAt = () => (sel ? blocks.findIndex((b) => b.id === sel) + 1 : blocks.length)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onBlockDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    editBody((els) => { const from = els.findIndex((x) => x.id === active.id); const to = els.findIndex((x) => x.id === over.id); if (from < 0 || to < 0) return; els.splice(0, els.length, ...arrayMove(els, from, to)) })
  }

  return (
    <MediaCtx.Provider value={openMedia}>
    <div className="fixed inset-0 z-50 flex flex-col bg-muted">
      {/* Thanh trên cùng kiểu WP */}
      <div className="h-14 shrink-0 bg-background border-b flex items-center gap-2 px-3">
        <button onClick={onClose} className="grid size-10 place-items-center rounded hover:bg-muted text-muted-foreground" title="Quay lại danh sách"><ArrowLeft className="size-5" /></button>
        <button type="button" onClick={() => setLibOpen((v) => !v)} className="grid size-9 place-items-center rounded text-primary-foreground transition-transform ml-1 hover:opacity-90" style={{ background: WP, transform: libOpen ? 'rotate(45deg)' : 'none' }} title="Thư viện khối"><Plus className="size-5" /></button>
        <div className="w-px h-6 bg-border mx-1" />
        <button onClick={undo} disabled={!histRef.current.past.length} title="Hoàn tác (Ctrl+Z)" className="grid size-9 place-items-center rounded hover:bg-muted text-muted-foreground disabled:opacity-30"><Undo2 className="size-[18px]" /></button>
        <button onClick={redo} disabled={!histRef.current.future.length} title="Làm lại (Ctrl+Shift+Z)" className="grid size-9 place-items-center rounded hover:bg-muted text-muted-foreground disabled:opacity-30"><Redo2 className="size-[18px]" /></button>
        <div className="flex-1" />
        <span className="text-[.8rem] text-muted-foreground hidden sm:inline">{statusText}</span>
        <Button asChild variant="outline" size="sm"><a href={viewUrl} target="_blank" rel="noreferrer"><Eye className="size-4" /> Xem</a></Button>
        <Button size="sm" onClick={onClose} style={{ background: WP }}><Check className="size-4" /> Xong</Button>
        <button onClick={() => setPanel((v) => !v)} className={`grid size-9 place-items-center rounded ${panel ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`} title="Cài đặt"><Settings className="size-5" /></button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* THƯ VIỆN KHỐI (trái) */}
        {libOpen && <BlockLibrary onClose={() => setLibOpen(false)} onAdd={(k) => addBlock(k, insertAt())} />}
        {/* CANVAS */}
        <div className="flex-1 overflow-y-auto" onClick={() => { setSel(null); setTab('doc') }}>
          <div className="tl-site bg-white max-w-[760px] mx-auto my-8 rounded shadow-sm min-h-[70vh] px-8 sm:px-14 py-12" onClick={(e) => e.stopPropagation()}>
            <ThemeStyle />
            <AutoArea value={entity.title} onChange={(v) => editEntity((e) => { e.title = v })} placeholder={kind === 'post' ? 'Thêm tiêu đề' : 'Tên trang'} className="site-head font-bold text-[clamp(1.9rem,4vw,2.6rem)] leading-tight mb-2" style={{ color: 'var(--tl-ink)' }} />
            <div className="border-b mb-6" style={{ borderColor: 'var(--tl-line)' }} />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onBlockDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((b, i) => (
                  <SortableBlock key={b.id} id={b.id}>
                    {(handle) => (
                      <div>
                        <div className="group relative" onClick={(e) => { e.stopPropagation(); setSel(b.id); setTab('block') }}>
                          {sel === b.id && (
                            <div className="absolute -top-9 left-0 z-20 flex items-center gap-0.5 rounded-md bg-foreground text-background shadow-lg px-1 py-1" onClick={(e) => e.stopPropagation()}>
                              <button {...handle} title="Kéo để di chuyển" className="grid size-7 place-items-center rounded hover:bg-white/15 cursor-grab active:cursor-grabbing touch-none"><GripVertical className="size-4" /></button>
                              <button onClick={() => moveBlock(b.id, -1)} disabled={i === 0} title="Lên" className="grid size-7 place-items-center rounded hover:bg-white/15 disabled:opacity-30"><ChevronUp className="size-4" /></button>
                              <button onClick={() => moveBlock(b.id, 1)} disabled={i === blocks.length - 1} title="Xuống" className="grid size-7 place-items-center rounded hover:bg-white/15 disabled:opacity-30"><ChevronDown className="size-4" /></button>
                              <button onClick={() => dupBlock(b.id)} title="Nhân bản" className="grid size-7 place-items-center rounded hover:bg-white/15"><Copy className="size-4" /></button>
                              <button onClick={() => delBlock(b.id)} title="Xóa" className="grid size-7 place-items-center rounded hover:bg-white/15 text-red-300"><Trash2 className="size-4" /></button>
                            </div>
                          )}
                          <div className={`rounded-md px-2 -mx-2 py-1.5 transition-shadow ${sel === b.id ? 'ring-2' : 'hover:ring-1 hover:ring-black/10'}`} style={sel === b.id ? { boxShadow: `0 0 0 2px ${WP}` } : undefined}>
                            <BlockContent b={b} onText={(v) => patchBlock(b.id, { text: v })} onPickImg={() => openMedia((url) => patchBlock(b.id, { url }))} patch={(p) => patchBlock(b.id, p)} />
                          </div>
                        </div>
                        <Inserter onPick={(k) => addBlock(k, i + 1)} />
                      </div>
                    )}
                  </SortableBlock>
                ))}
              </SortableContext>
            </DndContext>

            {blocks.length === 0 && (
              <button onClick={() => addBlock('text', 0)} className="text-left text-[1.05rem] text-black/25 w-full">Nhập nội dung, hoặc bấm ➕ để thêm khối…</button>
            )}
          </div>
        </div>

        {/* PANEL PHẢI */}
        {panel && (
          <aside className="w-[300px] shrink-0 bg-background border-l overflow-y-auto">
            <div className="flex border-b text-sm font-medium">
              <button onClick={() => setTab('doc')} className={`flex-1 py-3 ${tab === 'doc' ? 'border-b-2 -mb-px' : 'text-muted-foreground'}`} style={tab === 'doc' ? { borderColor: WP, color: WP } : undefined}>{kind === 'post' ? 'Bài viết' : 'Trang'}</button>
              <button onClick={() => selBlock && setTab('block')} disabled={!selBlock} className={`flex-1 py-3 disabled:opacity-40 disabled:cursor-not-allowed ${tab === 'block' && selBlock ? 'border-b-2 -mb-px' : 'text-muted-foreground'}`} style={tab === 'block' && selBlock ? { borderColor: WP, color: WP } : undefined}>Khối</button>
            </div>

            {!(tab === 'block' && selBlock) ? (
              kind === 'post' ? (
                <div className="p-4 space-y-4">
                  <label className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{post.published ? 'Đã đăng' : 'Bản nháp'}</span><Switch checked={post.published} onCheckedChange={(v) => editEntity((e) => { e.published = v })} /></label>
                  <div><Label>Ảnh bìa</Label>
                    {post.cover
                      ? <div className="mt-1 space-y-2"><img src={post.cover} alt="" className="w-full aspect-[16/9] object-cover rounded border" /><div className="flex gap-2"><Button size="sm" variant="outline" className="flex-1" onClick={() => openMedia((url) => editEntity((e) => { e.cover = url }))}>Đổi</Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => editEntity((e) => { e.cover = '' })}><Trash2 className="size-4" /></Button></div></div>
                      : <button onClick={() => openMedia((url) => editEntity((e) => { e.cover = url }))} className="mt-1 w-full aspect-[16/9] rounded border-2 border-dashed grid place-items-center text-muted-foreground hover:border-[color:var(--wp)] text-[.8rem]" style={{ ['--wp' as any]: WP }}><span className="flex flex-col items-center gap-1"><ImageIcon className="size-5" /> Đặt ảnh bìa</span></button>}
                  </div>
                  <div><Label>Đường dẫn</Label><div className="flex items-center gap-1 mt-1"><span className="text-[.72rem] text-muted-foreground truncate">/{blog.slug}/</span><Input value={post.slug} onChange={(e) => editEntity((e2) => { e2.slug = slugify(e.target.value) })} className="h-9" /></div></div>
                  <div><Label>Ngày đăng</Label><DatePicker value={post.date} onChange={(v) => editEntity((e2) => { e2.date = v })} className="mt-1" /></div>
                  <div><Label>Tóm tắt</Label><Textarea value={post.excerpt} onChange={(e) => editEntity((e2) => { e2.excerpt = e.target.value })} className="mt-1 min-h-[70px]" placeholder="Mô tả ngắn (danh sách & chia sẻ)…" /></div>
                  <div className="pt-2 border-t"><ConfirmDialog title={`Xóa bài “${post.title || 'Chưa đặt tên'}”?`} desc="Bài viết sẽ bị xóa vĩnh viễn." confirmText="Xóa bài" destructive onConfirm={() => { onDelete(); onClose() }} trigger={<Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /> Xóa bài viết</Button>} /></div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div><Label>Đường dẫn</Label><div className="flex items-center gap-1 mt-1"><span className="text-[.72rem] text-muted-foreground">/</span><Input value={page.slug} onChange={(e) => editEntity((e2) => { e2.slug = slugify(e.target.value) })} className="h-9" /></div></div>
                  <div className="pt-1"><div className="text-[.72rem] font-bold uppercase tracking-wider text-muted-foreground mb-2">SEO · chia sẻ</div>
                    <Label>Tiêu đề trên Google</Label><Input value={page.seo?.title || ''} onChange={(e) => editEntity((e2) => { e2.seo = { ...(e2.seo || {}), title: e.target.value } })} className="mt-1 h-9" placeholder="Bỏ trống = dùng tên trang" />
                    <Label className="block mt-3">Mô tả ngắn</Label><Textarea value={page.seo?.description || ''} onChange={(e) => editEntity((e2) => { e2.seo = { ...(e2.seo || {}), description: e.target.value } })} className="mt-1 min-h-[70px]" placeholder="Mô tả khi tìm Google / chia sẻ…" />
                  </div>
                  <div className="pt-2 border-t"><ConfirmDialog title={`Xóa trang “${page.title || 'Chưa đặt tên'}”?`} desc="Trang sẽ bị xóa vĩnh viễn." confirmText="Xóa trang" destructive onConfirm={() => { onDelete(); onClose() }} trigger={<Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /> Xóa trang</Button>} /></div>
                </div>
              )
            ) : (
              <div className="p-4">
                {selBlock ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">{(() => { const I = KIND_ICON[selBlock.kind]; return <I className="size-[18px]" style={{ color: WP }} /> })()} {KIND_LABEL[selBlock.kind] || 'Khối'}</div>
                    <BlockSettings b={selBlock} patch={(p) => patchBlock(selBlock.id, p)} />
                  </div>
                ) : <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="size-4" /> Chọn một khối trên canvas để chỉnh cài đặt.</p>}
              </div>
            )}
          </aside>
        )}
      </div>
      <MediaPicker open={mediaOpen} onOpenChange={setMediaOpen} onPick={(url) => mediaCb.current(url)} />
    </div>
    </MediaCtx.Provider>
  )
}
