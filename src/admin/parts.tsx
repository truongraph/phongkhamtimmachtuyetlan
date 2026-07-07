import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { ICON_OPTIONS, Icon } from '@/lib/icons'
import { formatVnPhone } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, Trash2, Upload, GripVertical, Image as ImageIcon } from 'lucide-react'
import { useMedia, useMediaLib } from './media/MediaPicker'
import { useRef, useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/** Xếp các thẻ con thành 2 cột masonry (full width, thẻ cao thấp vẫn khít). */
export function Masonry({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`columns-1 xl:columns-2 gap-x-6 [&>*]:mb-6 [&>*]:break-inside-avoid ${className}`}>{children}</div>
}

/**
 * Danh sách kéo–thả (drag & drop) để sắp xếp lại thứ tự.
 * `children(item, index, handle)` — đặt `handle` vào chỗ muốn dùng làm tay nắm kéo.
 */
export function SortableList<T extends { id: string }>({ items, onChange, className = 'space-y-3', children }: {
  items: T[]
  onChange: (items: T[]) => void
  className?: string
  children: (item: T, index: number, handle: React.ReactNode) => React.ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.id === active.id)
    const to = items.findIndex((i) => i.id === over.id)
    if (from < 0 || to < 0) return
    onChange(arrayMove(items, from, to))
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, i) => <SortableRow key={item.id} id={item.id}>{(handle) => children(item, i, handle)}</SortableRow>)}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({ id, children }: { id: string; children: (handle: React.ReactNode) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 30 : undefined, position: 'relative' }
  const handle = (
    <button type="button" {...attributes} {...listeners}
      className="cursor-grab active:cursor-grabbing touch-none grid place-items-center size-8 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0"
      aria-label="Kéo để sắp xếp">
      <GripVertical className="size-5" />
    </button>
  )
  return <div ref={setNodeRef} style={style} className={isDragging ? 'ring-2 ring-primary/50 rounded-2xl shadow-xl' : ''}>{children(handle)}</div>
}

/** Nút xoá nhỏ (đi kèm tay nắm kéo) — hỏi xác nhận trước khi xoá. */
export function DeleteBtn({ onClick, title = 'Xoá mục này?', desc = 'Mục sẽ bị xoá khỏi nội dung. Nhớ bấm “Lưu thay đổi” để áp dụng lên website.' }: { onClick: () => void; title?: string; desc?: string }) {
  return (
    <ConfirmDialog
      title={title} desc={desc} confirmText="Xoá" destructive onConfirm={onClick}
      trigger={<Button type="button" variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"><Trash2 className="size-4" /></Button>}
    />
  )
}

export interface TabDef { key: string; label: string; icon?: React.ReactNode; content: React.ReactNode }
/** Bố cục tab dọc: danh sách tab bên trái, nội dung bên phải (mobile: tab cuộn ngang trên đầu). */
export function SideTabs({ tabs, defaultKey }: { tabs: TabDef[]; defaultKey?: string }) {
  const [active, setActive] = useState(defaultKey ?? tabs[0]?.key)
  const cur = tabs.find((t) => t.key === active) ?? tabs[0]
  return (
    <div className="grid lg:grid-cols-[224px_1fr] gap-5 items-start">
      <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-20 lg:rounded-xl lg:border lg:bg-card lg:p-2">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setActive(t.key)}
            className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap text-left shrink-0 transition-colors [&_svg]:size-[18px] [&_svg]:shrink-0',
              active === t.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/75 hover:bg-secondary')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      <div className="min-w-0">{cur?.content}</div>
    </div>
  )
}

export function PageHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-bold text-2xl lg:text-[1.7rem] tracking-tight text-foreground">{title}</h1>
      {desc && <p className="text-muted-foreground mt-1">{desc}</p>}
    </div>
  )
}

export function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export function Area({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function PhoneField({ label, value, onChange, placeholder = '090 941 073' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="tel" inputMode="numeric" value={value} onChange={(e) => onChange(formatVnPhone(e.target.value))} placeholder={placeholder} />
    </div>
  )
}

export function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>Biểu tượng</Label>
      <Combobox
        value={value}
        onChange={onChange}
        placeholder="Chọn biểu tượng"
        searchPlaceholder="Tìm biểu tượng…"
        options={ICON_OPTIONS.map((k) => ({ value: k, label: k, icon: <Icon name={k} className="size-4 text-primary" /> }))}
      />
    </div>
  )
}

export function ImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (dataUrl: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const openMedia = useMedia()
  const lib = useMediaLib()
  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const url = String(reader.result); onChange(url); lib.add([{ name: file.name, url }]) } // tải lên → tự lưu vào Thư viện Media
    reader.readAsDataURL(file)
  }
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <img src={value} alt="" className="size-16 rounded-lg border object-cover bg-muted shrink-0" />
        <div className="space-y-2">
          <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}><Upload className="size-4" /> Tải ảnh lên</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => openMedia(onChange)}><ImageIcon className="size-4" /> Từ thư viện</Button>
          </div>
          <p className="text-[.75rem] text-muted-foreground">PNG/JPG. Ảnh tải lên được lưu vào Thư viện Media để dùng lại.</p>
        </div>
      </div>
    </div>
  )
}

export function RowActions({ onUp, onDown, onDelete }: { onUp?: () => void; onDown?: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="size-8" onClick={onUp} disabled={!onUp}><ArrowUp className="size-4" /></Button>
      <Button variant="ghost" size="icon" className="size-8" onClick={onDown} disabled={!onDown}><ArrowDown className="size-4" /></Button>
      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={onDelete}><Trash2 className="size-4" /></Button>
    </div>
  )
}

export function move<T>(arr: T[], from: number, dir: -1 | 1): T[] {
  const to = from + dir
  if (to < 0 || to >= arr.length) return arr
  const next = arr.slice()
  const [it] = next.splice(from, 1)
  next.splice(to, 0, it)
  return next
}
