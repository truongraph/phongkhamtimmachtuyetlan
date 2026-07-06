import { useContent, type RowBlock, type RowElement, type RowElementKind, type SectionMeta, type SiteContent } from '@/store/content'
import { Icon, ICON_OPTIONS } from '@/lib/icons'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  DndContext, closestCorners, PointerSensor, KeyboardSensor, useSensor, useSensors, useDroppable, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus, Trash2, GripVertical, Image as ImageIcon, Type, Heading,
  MousePointerClick, Columns3, Sparkles, Video, StretchVertical, Minus, MapPin, List, X, Quote, Images, Code,
  Newspaper, Share2, Table,
} from 'lucide-react'

const KIND_META: Record<RowElementKind, { label: string; icon: typeof Type }> = {
  image: { label: 'Ảnh', icon: ImageIcon },
  heading: { label: 'Tiêu đề', icon: Heading },
  text: { label: 'Đoạn chữ', icon: Type },
  button: { label: 'Nút bấm', icon: MousePointerClick },
  icon: { label: 'Icon', icon: Sparkles },
  video: { label: 'Video', icon: Video },
  spacer: { label: 'Khoảng trắng', icon: StretchVertical },
  divider: { label: 'Đường kẻ', icon: Minus },
  map: { label: 'Bản đồ', icon: MapPin },
  list: { label: 'Danh sách', icon: List },
  quote: { label: 'Trích dẫn', icon: Quote },
  gallery: { label: 'Thư viện ảnh', icon: Images },
  html: { label: 'HTML', icon: Code },
  latestposts: { label: 'Bài viết mới', icon: Newspaper },
  socials: { label: 'Mạng xã hội', icon: Share2 },
  table: { label: 'Bảng', icon: Table },
  columns: { label: 'Cột', icon: Columns3 },
}
const ADD_KINDS: RowElementKind[] = ['image', 'heading', 'text', 'button', 'icon', 'list', 'video', 'map', 'divider', 'spacer']

function makeEl(kind: RowElementKind, id: string): RowElement {
  switch (kind) {
    case 'image': return { id, kind, url: '/doctor.webp', alt: '' }
    case 'heading': return { id, kind, text: 'Tiêu đề mới' }
    case 'text': return { id, kind, text: 'Nội dung mô tả…' }
    case 'button': return { id, kind, text: 'Nút bấm', href: '#' }
    case 'icon': return { id, kind, name: 'heart' }
    case 'video': return { id, kind, url: '' }
    case 'spacer': return { id, kind, size: 'md' }
    case 'divider': return { id, kind }
    case 'map': return { id, kind, address: '' }
    case 'list': return { id, kind, items: ['Mục thứ nhất', 'Mục thứ hai'], icon: 'check' }
    case 'quote': return { id, kind, text: 'Trích dẫn…', cite: '' }
    case 'gallery': return { id, kind, images: [] }
    case 'html': return { id, kind, html: '' }
    case 'latestposts': return { id, kind, count: 3 }
    case 'socials': return { id, kind, items: [] }
    case 'table': return { id, kind, rows: [['Cột 1', 'Cột 2'], ['', '']] }
    case 'columns': return { id, kind, cols: [{ id: `${id}-a`, elements: [] }, { id: `${id}-b`, elements: [] }] }
  }
}

/** Chọn ảnh từ máy → data URL (giống EditableImage). */
function pickImageFile(onPick: (url: string) => void) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onPick(String(reader.result))
    reader.readAsDataURL(file)
  }
  input.click()
}

/** Bảng sửa 1 phần tử theo loại. */
function ElEditor({ el, onPatch }: { el: RowElement; onPatch: (patch: Record<string, unknown>) => void }) {
  if (el.kind === 'image') {
    return (
      <div className="space-y-2">
        <img src={el.url} alt="" className="h-24 w-full rounded-md border object-cover bg-muted" />
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => pickImageFile((url) => onPatch({ url }))}>
            <ImageIcon className="size-3.5" /> Đổi ảnh
          </Button>
        </div>
        <Input value={el.alt || ''} onChange={(e) => onPatch({ alt: e.target.value })} placeholder="Mô tả ảnh (alt)" className="h-9" />
      </div>
    )
  }
  if (el.kind === 'heading') {
    return <Input value={el.text} onChange={(e) => onPatch({ text: e.target.value })} placeholder="Tiêu đề" />
  }
  if (el.kind === 'text') {
    return <Textarea value={el.text} onChange={(e) => onPatch({ text: e.target.value })} placeholder="Nội dung" className="min-h-[70px]" />
  }
  if (el.kind === 'icon') {
    return (
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-md border bg-muted/40 text-primary shrink-0"><Icon name={el.name} className="size-5" /></span>
        <Select value={el.name} onValueChange={(v) => onPatch({ name: v })}>
          <SelectTrigger className="h-9 text-[.82rem]"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-64">
            {ICON_OPTIONS.map((n) => (
              <SelectItem key={n} value={n}><span className="flex items-center gap-2"><Icon name={n} className="size-4" /> {n}</span></SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }
  if (el.kind === 'video') {
    return (
      <div className="space-y-1.5">
        <Input value={el.url} onChange={(e) => onPatch({ url: e.target.value })} placeholder="Dán liên kết nhúng (YouTube/Vimeo)" className="h-9" />
        <p className="text-[.68rem] text-muted-foreground leading-snug">Dùng liên kết <b>nhúng</b> (vd: https://www.youtube.com/embed/XXXX).</p>
      </div>
    )
  }
  if (el.kind === 'spacer') {
    return (
      <Select value={el.size || 'md'} onValueChange={(v) => onPatch({ size: v })}>
        <SelectTrigger className="h-9 text-[.82rem]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="sm">Nhỏ</SelectItem>
          <SelectItem value="md">Vừa</SelectItem>
          <SelectItem value="lg">Lớn</SelectItem>
        </SelectContent>
      </Select>
    )
  }
  if (el.kind === 'divider') {
    return <p className="text-[.72rem] text-muted-foreground">Đường kẻ ngang — ngăn cách nội dung.</p>
  }
  if (el.kind === 'map') {
    return (
      <div className="space-y-1.5">
        <Input value={el.address} onChange={(e) => onPatch({ address: e.target.value })} placeholder="Địa chỉ (vd: 16/63 Tuệ Tĩnh, Phường Phú Thọ, TP.HCM)" className="h-9" />
        <p className="text-[.68rem] text-muted-foreground leading-snug">Nhập địa chỉ — bản đồ Google tự hiển thị (không cần API key).</p>
      </div>
    )
  }
  if (el.kind === 'list') {
    return (
      <div className="space-y-2">
        <Textarea value={el.items.join('\n')} onChange={(e) => onPatch({ items: e.target.value.split('\n') })} placeholder="Mỗi dòng một mục" className="min-h-[80px]" />
        <div className="flex items-center gap-2">
          <span className="text-[.72rem] text-muted-foreground shrink-0">Icon:</span>
          <span className="grid size-9 place-items-center rounded-md border bg-muted/40 text-primary shrink-0"><Icon name={el.icon || 'check'} className="size-5" /></span>
          <Select value={el.icon || 'check'} onValueChange={(v) => onPatch({ icon: v })}>
            <SelectTrigger className="h-9 text-[.82rem]"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-64">
              {ICON_OPTIONS.map((n) => <SelectItem key={n} value={n}><span className="flex items-center gap-2"><Icon name={n} className="size-4" /> {n}</span></SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }
  if (el.kind === 'quote') {
    return (
      <div className="space-y-2">
        <Textarea value={el.text} onChange={(e) => onPatch({ text: e.target.value })} placeholder="Nội dung trích dẫn" className="min-h-[70px]" />
        <Input value={el.cite || ''} onChange={(e) => onPatch({ cite: e.target.value })} placeholder="Nguồn / tác giả" className="h-9" />
      </div>
    )
  }
  if (el.kind === 'html') {
    return <Textarea value={el.html} onChange={(e) => onPatch({ html: e.target.value })} placeholder="<div>…</div>" className="min-h-[90px] font-mono text-[.8rem]" />
  }
  if (el.kind === 'gallery' || el.kind === 'latestposts' || el.kind === 'socials' || el.kind === 'table' || el.kind === 'columns') {
    return <p className="text-[.72rem] text-muted-foreground">Chỉnh trong trình soạn bài viết/trang.</p>
  }
  return (
    <div className="space-y-2">
      <Input value={el.text} onChange={(e) => onPatch({ text: e.target.value })} placeholder="Chữ trên nút" className="h-9" />
      <Input value={el.href} onChange={(e) => onPatch({ href: e.target.value })} placeholder="Liên kết (vd: #dat-lich)" className="h-9" />
    </div>
  )
}

/** Thẻ phần tử kéo-thả được; `children` nhận props của tay cầm kéo (grip). */
function SortableCard({ id, children }: { id: string; children: (handle: Record<string, unknown>) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : undefined, zIndex: isDragging ? 30 : undefined }
  return <div ref={setNodeRef} style={style}>{children({ ...attributes, ...listeners })}</div>
}

/** Vùng thả của một cột — sáng lên khi rê phần tử vào. */
function ColumnZone({ colId, children }: { colId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'col:' + colId })
  return <div ref={setNodeRef} className={`space-y-2.5 rounded-md min-h-[44px] transition-colors ${isOver ? 'ring-1 ring-primary/40 bg-primary/5' : ''}`}>{children}</div>
}

/** Vị trí khối cần sửa: trang chủ, một trang phụ, hoặc một bài viết. */
export type RowTarget = { scope: 'home' | 'page' | 'post'; ownerId?: string; blockId: string }

/** Mảng sections chứa khối theo phạm vi. */
function arrOf(c: SiteContent, t: RowTarget): SectionMeta[] | undefined {
  if (t.scope === 'page') return c.pages.find((p) => p.id === t.ownerId)?.sections
  if (t.scope === 'post') return c.posts.find((p) => p.id === t.ownerId)?.sections
  return c.sections
}

/** Modal dựng KHỐI TỰ DO: chia cột & thêm/sửa/xóa ảnh–chữ–nút trong từng cột. */
export function RowEditorDialog({ target, onClose }: { target: RowTarget | null; onClose: () => void }) {
  const section = useContent((s) => (target ? arrOf(s.content, target)?.find((x) => x.id === target.blockId) : undefined))
  const setLayout = useContent((s) => s.setLayout)
  const newId = useContent((s) => s.newId)
  const block = section?.row

  // Mọi thay đổi ghi thẳng vào khối (áp dụng LIVE, giống thao tác bố cục).
  const edit = (fn: (r: RowBlock) => void) =>
    setLayout((c) => { const it = target ? arrOf(c, target)?.find((x) => x.id === target.blockId) : undefined; if (it?.row) fn(it.row) })

  const setCols = (n: number) => edit((r) => {
    while (r.cols.length < n) r.cols.push({ id: newId(), elements: [] })
    if (r.cols.length > n) r.cols = r.cols.slice(0, n)
  })
  const addEl = (colId: string, kind: RowElementKind) =>
    edit((r) => { const col = r.cols.find((c) => c.id === colId); if (col) col.elements.push(makeEl(kind, newId())) })
  const patchEl = (colId: string, elId: string, patch: Record<string, unknown>) =>
    edit((r) => { const el = r.cols.find((c) => c.id === colId)?.elements.find((e) => e.id === elId); if (el) Object.assign(el, patch) })
  const removeEl = (colId: string, elId: string) =>
    edit((r) => { const col = r.cols.find((c) => c.id === colId); if (col) col.elements = col.elements.filter((e) => e.id !== elId) })
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  // Tìm cột + vị trí của một phần tử theo id.
  const findEl = (elId: string) => {
    if (!block) return null
    for (const col of block.cols) {
      const idx = col.elements.findIndex((e) => e.id === elId)
      if (idx >= 0) return { colId: col.id, idx }
    }
    return null
  }
  // Kéo-thả: đổi thứ tự trong cột & di chuyển phần tử giữa các cột.
  const onDragEnd = (e: DragEndEvent) => {
    if (!block) return
    const { active, over } = e
    if (!over) return
    const from = findEl(String(active.id))
    if (!from) return
    const overId = String(over.id)
    let toColId: string, toIdx: number
    if (overId.startsWith('col:')) {
      toColId = overId.slice(4)
      toIdx = block.cols.find((c) => c.id === toColId)?.elements.length ?? 0
    } else {
      const t = findEl(overId); if (!t) return
      toColId = t.colId; toIdx = t.idx
    }
    if (from.colId === toColId && from.idx === toIdx) return
    edit((r) => {
      const src = r.cols.find((c) => c.id === from.colId); if (!src) return
      const [el] = src.elements.splice(from.idx, 1)
      const dst = r.cols.find((c) => c.id === toColId); if (!dst) return
      let insert = toIdx
      if (from.colId === toColId && from.idx < toIdx) insert = toIdx - 1
      dst.elements.splice(Math.min(insert, dst.elements.length), 0, el)
    })
  }

  return (
    <Dialog open={!!target} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2"><Columns3 className="size-5 text-primary" /> Dựng khối tự do</DialogTitle>
        <DialogDescription>Chia cột rồi thêm ảnh, tiêu đề, đoạn chữ hoặc nút vào từng cột. Thay đổi hiện ngay trên khung xem trước.</DialogDescription>

        {block ? (
          <>
            {/* Thanh cài đặt khối */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border bg-muted/30 p-3">
              <div>
                <div className="text-[.7rem] font-semibold text-muted-foreground mb-1">Số cột</div>
                <div className="inline-flex rounded-md border bg-background p-0.5">
                  {[1, 2, 3].map((n) => (
                    <button key={n} onClick={() => setCols(n)}
                      className={`size-8 rounded text-sm font-semibold transition-colors ${block.cols.length === n ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[.7rem] font-semibold text-muted-foreground mb-1">Nền</div>
                <Select value={block.bg || 'none'} onValueChange={(v) => edit((r) => { r.bg = v as RowBlock['bg'] })}>
                  <SelectTrigger className="h-9 text-[.82rem]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Trắng</SelectItem>
                    <SelectItem value="tint">Tông nhạt</SelectItem>
                    <SelectItem value="soft">Nền màu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-[.7rem] font-semibold text-muted-foreground mb-1">Khoảng đệm</div>
                <Select value={block.py || 'md'} onValueChange={(v) => edit((r) => { r.py = v as RowBlock['py'] })}>
                  <SelectTrigger className="h-9 text-[.82rem]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Gọn</SelectItem>
                    <SelectItem value="md">Vừa</SelectItem>
                    <SelectItem value="lg">Rộng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-[.7rem] font-semibold text-muted-foreground mb-1">Căn dọc</div>
                <Select value={block.align || 'center'} onValueChange={(v) => edit((r) => { r.align = v as RowBlock['align'] })}>
                  <SelectTrigger className="h-9 text-[.82rem]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Giữa</SelectItem>
                    <SelectItem value="start">Trên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cài đặt nâng cao: nền ảnh · độ tối · chữ sáng · tỉ lệ cột · tràn viền */}
            <div className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-lg border bg-muted/30 p-3">
              <div>
                <div className="text-[.7rem] font-semibold text-muted-foreground mb-1">Ảnh nền</div>
                {block.bgImage ? (
                  <div className="flex items-center gap-1.5">
                    <img src={block.bgImage} alt="" className="h-9 w-14 rounded object-cover border" />
                    <Button size="sm" variant="outline" className="h-9" onClick={() => pickImageFile((url) => edit((r) => { r.bgImage = url }))}>Đổi</Button>
                    <Button size="sm" variant="outline" className="h-9 px-2 text-destructive hover:text-destructive" title="Bỏ ảnh nền" onClick={() => edit((r) => { delete r.bgImage })}><X className="size-4" /></Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="h-9" onClick={() => pickImageFile((url) => edit((r) => { r.bgImage = url }))}><ImageIcon className="size-4" /> Chọn ảnh</Button>
                )}
              </div>
              {block.bgImage && (
                <div>
                  <div className="text-[.7rem] font-semibold text-muted-foreground mb-1">Độ tối ({block.overlay ?? 0}%)</div>
                  <Slider min={0} max={80} value={[block.overlay ?? 0]} onValueChange={([v]) => edit((r) => { r.overlay = v })} className="w-32 h-9" />
                </div>
              )}
              <label className="flex items-center gap-2 h-9 cursor-pointer">
                <Switch checked={!!block.light} onCheckedChange={(v) => edit((r) => { r.light = v })} />
                <span className="text-[.8rem] font-medium">Chữ sáng</span>
              </label>
              <label className="flex items-center gap-2 h-9 cursor-pointer">
                <Switch checked={!!block.wide} onCheckedChange={(v) => edit((r) => { r.wide = v })} />
                <span className="text-[.8rem] font-medium">Tràn viền</span>
              </label>
              {block.cols.length === 2 && (
                <div>
                  <div className="text-[.7rem] font-semibold text-muted-foreground mb-1">Tỉ lệ cột</div>
                  <Select value={block.layout || 'equal'} onValueChange={(v) => edit((r) => { r.layout = v as RowBlock['layout'] })}>
                    <SelectTrigger className="h-9 w-36 text-[.82rem]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal">Đều nhau</SelectItem>
                      <SelectItem value="wideLeft">Rộng bên trái</SelectItem>
                      <SelectItem value="wideRight">Rộng bên phải</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Các cột — kéo tay cầm ⠿ để đổi thứ tự / chuyển phần tử sang cột khác */}
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
              <div className={`grid gap-3 ${block.cols.length >= 3 ? 'sm:grid-cols-3' : block.cols.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                {block.cols.map((col, ci) => (
                  <div key={col.id} className="rounded-lg border bg-card p-2.5 space-y-2.5">
                    <div className="text-[.72rem] font-bold uppercase tracking-wider text-muted-foreground">Cột {ci + 1}</div>
                    <SortableContext items={col.elements.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                      <ColumnZone colId={col.id}>
                        {col.elements.length === 0 && <div className="rounded-md border border-dashed py-4 text-center text-[.75rem] text-muted-foreground">Kéo phần tử vào đây hoặc thêm bên dưới</div>}
                        {col.elements.map((el) => {
                          const M = KIND_META[el.kind]
                          return (
                            <SortableCard key={el.id} id={el.id}>
                              {(handle) => (
                                <div className="rounded-md border bg-background p-2 space-y-2">
                                  <div className="flex items-center gap-1.5">
                                    <button {...handle} type="button" title="Kéo để sắp xếp / chuyển cột" className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"><GripVertical className="size-3.5" /></button>
                                    <M.icon className="size-3.5 text-primary" />
                                    <span className="text-[.72rem] font-semibold flex-1">{M.label}</span>
                                    <button onClick={() => removeEl(col.id, el.id)} title="Xóa" className="grid size-6 place-items-center rounded text-destructive hover:bg-destructive/10"><Trash2 className="size-3.5" /></button>
                                  </div>
                                  <ElEditor el={el} onPatch={(patch) => patchEl(col.id, el.id, patch)} />
                                </div>
                              )}
                            </SortableCard>
                          )
                        })}
                      </ColumnZone>
                    </SortableContext>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {ADD_KINDS.map((k) => {
                        const M = KIND_META[k]
                        return (
                          <button key={k} onClick={() => addEl(col.id, k)}
                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[.72rem] font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                            <Plus className="size-3" /> <M.icon className="size-3.5" /> {M.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </DndContext>

            <div className="flex justify-end pt-1">
              <Button onClick={onClose}>Xong</Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
