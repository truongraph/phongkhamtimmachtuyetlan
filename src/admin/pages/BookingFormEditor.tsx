import { useState } from 'react'
import { useContent, newField, type FormField, type FormFieldType } from '@/store/content'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { PageHead, DeleteBtn } from '../parts'
import { FieldControl } from '@/site/sections/Hero'
import { ThemeStyle } from '@/site/ThemeStyle'
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Type, Phone, Mail, AlignLeft, List, Calendar, Clock, CheckSquare, Plus, CalendarCheck, ArrowLeft, GripVertical } from 'lucide-react'

const TYPE_META: Record<FormFieldType, { label: string; icon: typeof Type }> = {
  text: { label: 'Chữ ngắn', icon: Type },
  phone: { label: 'Điện thoại', icon: Phone },
  email: { label: 'Email', icon: Mail },
  textarea: { label: 'Chữ dài', icon: AlignLeft },
  select: { label: 'Lựa chọn', icon: List },
  date: { label: 'Ngày', icon: Calendar },
  time: { label: 'Buổi / giờ', icon: Clock },
  checkbox: { label: 'Ô tick', icon: CheckSquare },
}
const CORE = ['name', 'phone', 'service', 'date', 'time', 'note']
const CORE_LABEL: Record<string, string> = { name: 'Họ tên', phone: 'SĐT', service: 'Dịch vụ', date: 'Ngày', time: 'Buổi', note: 'Ghi chú' }

const optionsFor = (f: FormField, services: { title: string }[]) =>
  (f.key === 'service' && (!f.options || !f.options.length)) ? [...services.map((s) => s.title), 'Khác / Tư vấn chung'] : (f.options ?? [])

/** Một trường trên canvas: chia cột đúng (nửa/cả hàng), bấm để chọn, kéo ⠿ để đổi thứ tự. */
function CanvasField({ f, selected, onSelect, options }: { f: FormField; selected: boolean; onSelect: () => void; options: string[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: f.id })
  const full = f.width === 'full' || f.type === 'checkbox' || f.type === 'textarea'
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform), transition,
    zIndex: isDragging ? 30 : undefined, opacity: isDragging ? 0.6 : undefined,
    ['--tw-ring-offset-color' as any]: '#fff',
  }
  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}
      className={`${full ? 'col-span-2' : 'col-span-1'} relative group rounded-lg cursor-pointer ${selected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/50 hover:ring-offset-2'}`}>
      <div className="space-y-1.5 pointer-events-none select-none">
        <FieldControl f={f} value="" onChange={() => {}} options={options} />
      </div>
      <div className={`absolute -top-2.5 left-2 ${selected ? '' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} onClick={(e) => e.stopPropagation()}>
        <button {...attributes} {...listeners} type="button" aria-label="Kéo để sắp xếp"
          className="grid place-items-center size-6 rounded-md bg-white border shadow-sm text-primary cursor-grab active:cursor-grabbing touch-none"><GripVertical className="size-4" /></button>
      </div>
    </div>
  )
}

/** Trình dựng FORM ĐẶT LỊCH: trái = chọn thành phần, phải = canvas kéo-thả trực tiếp. */
export function BookingFormEditor() {
  const form = useContent((s) => s.content.bookingForm)
  const services = useContent((s) => s.content.services)
  const info = useContent((s) => s.content.info)
  const hero = useContent((s) => s.content.hero)
  const set = useContent((s) => s.set)
  const newId = useContent((s) => s.newId)
  const [selId, setSelId] = useState<string | null>(null)

  const fields = form.fields
  const sel = selId ? fields.find((f) => f.id === selId) ?? null : null

  const setFields = (next: FormField[]) => set((c) => { c.bookingForm.fields = next })
  const patch = (id: string, p: Partial<FormField>) => set((c) => { const f = c.bookingForm.fields.find((x) => x.id === id); if (f) Object.assign(f, p) })
  const add = (type: FormFieldType) => { const f = newField(newId, type); set((c) => { c.bookingForm.fields.push(f) }); setSelId(f.id) }
  const del = (id: string) => { set((c) => { c.bookingForm.fields = c.bookingForm.fields.filter((x) => x.id !== id) }); setSelId(null) }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = fields.findIndex((x) => x.id === active.id)
    const to = fields.findIndex((x) => x.id === over.id)
    if (from < 0 || to < 0) return
    setFields(arrayMove(fields, from, to))
  }

  return (
    <div>
      <PageHead title="Form đặt lịch khám" desc="Bên trái chọn thành phần để thêm; bên phải là form thật — bấm một trường để sửa, kéo ⠿ để đổi thứ tự ngay trên form." />

      <div className="grid lg:grid-cols-[330px_minmax(0,1fr)] gap-6 items-start">
        {/* ============ TRÁI: chọn thành phần / sửa trường đang chọn ============ */}
        <div className="lg:sticky lg:top-20 space-y-4">
          {sel ? (
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="flex items-center gap-2 -mt-1">
                <button onClick={() => setSelId(null)} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Xong</button>
                {CORE.includes(sel.key) && <span className="ml-auto text-[.66rem] font-bold rounded-full bg-primary/10 text-primary px-2 py-0.5">Lõi · {CORE_LABEL[sel.key]}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">{(() => { const M = TYPE_META[sel.type]; return <><M.icon className="size-[18px] text-primary" /> {M.label}</> })()}</div>
              <div><Label>Nhãn hiển thị</Label><Input value={sel.label} onChange={(e) => patch(sel.id, { label: e.target.value })} className="mt-1" /></div>
              {sel.type !== 'checkbox' && sel.type !== 'date' && (
                <div><Label>Gợi ý (placeholder)</Label><Input value={sel.placeholder || ''} onChange={(e) => patch(sel.id, { placeholder: e.target.value })} className="mt-1" /></div>
              )}
              {(sel.type === 'select' || sel.type === 'time') && (
                <div>
                  <Label>Lựa chọn — mỗi dòng một mục{sel.key === 'service' ? ' (để trống sẽ tự lấy từ danh sách Dịch vụ)' : ''}</Label>
                  <Textarea value={(sel.options || []).join('\n')} onChange={(e) => patch(sel.id, { options: e.target.value.split('\n') })} className="mt-1 min-h-[92px]" placeholder={'Lựa chọn 1\nLựa chọn 2'} />
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer"><Switch checked={!!sel.required} onCheckedChange={(v) => patch(sel.id, { required: v })} /> Bắt buộc</label>
                {sel.type !== 'checkbox' && sel.type !== 'textarea' && (
                  <Select value={sel.width || 'full'} onValueChange={(v) => patch(sel.id, { width: v as 'full' | 'half' })}>
                    <SelectTrigger className="h-9 w-32 text-[.82rem]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Cả hàng</SelectItem>
                      <SelectItem value="half">Nửa hàng</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="pt-1 border-t flex justify-end"><DeleteBtn onClick={() => del(sel.id)} title="Xóa trường này?" desc="Trường sẽ bị gỡ khỏi form. Nhớ bấm “Lưu thay đổi”." /></div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-card p-4">
                <div className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Plus className="size-4" /> Thêm thành phần</div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(TYPE_META) as FormFieldType[]).map((t) => {
                    const M = TYPE_META[t]
                    return (
                      <button key={t} type="button" onClick={() => add(t)}
                        className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[.82rem] font-medium text-foreground/80 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors">
                        <M.icon className="size-4 shrink-0 text-primary" /> {M.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <Label>Chữ trên nút gửi</Label>
                <Input value={form.submitText || ''} onChange={(e) => set((c) => { c.bookingForm.submitText = e.target.value })} placeholder="Gửi đăng ký khám" className="mt-1.5" />
              </div>
              <p className="text-[.75rem] text-muted-foreground leading-relaxed px-1">Bấm vào một trường ở form bên phải để sửa. Kéo tay nắm <b className="text-foreground">⠿</b> để đổi thứ tự.</p>
            </>
          )}
        </div>

        {/* ============ PHẢI: canvas form thật, kéo-thả trực tiếp ============ */}
        <div className="tl-site rounded-2xl border overflow-hidden" style={{ background: 'var(--tl-tint)' }}>
          <ThemeStyle />
          <div className="p-4 sm:p-6">
            <div className="bg-white border overflow-hidden shadow-sm w-full mx-auto max-w-[520px]" style={{ borderColor: 'var(--tl-line)', borderRadius: 'calc(var(--tl-radius) + 6px)' }}>
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--tl-line)' }}>
                <span className="grid place-items-center size-11 rounded-xl shrink-0" style={{ background: 'var(--tl-soft)', color: 'var(--tl-primary)' }}><CalendarCheck className="size-[22px]" /></span>
                <div>
                  <h3 className="site-head font-bold text-[1.2rem]" style={{ color: 'var(--tl-ink)' }}>{hero.bookingTitle}</h3>
                  <p className="text-[.85rem]" style={{ color: 'var(--tl-slate)' }}>{hero.bookingSubtitle}</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {fields.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-12 text-center text-[.85rem] text-muted-foreground">Chưa có trường nào — thêm từ bảng bên trái.</div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={fields.map((f) => f.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 gap-3">
                        {fields.map((f) => (
                          <CanvasField key={f.id} f={f} selected={sel?.id === f.id} onSelect={() => setSelId(f.id)} options={optionsFor(f, services)} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
                <button type="button" className="w-full h-11 text-white font-semibold" style={{ background: 'var(--tl-primary)', borderRadius: 'var(--tl-btn)' }}>{form.submitText || 'Gửi đăng ký khám'}</button>
                <p className="text-center text-[.85rem]" style={{ color: 'var(--tl-slate)' }}>Hoặc gọi ngay <b style={{ color: 'var(--tl-primary)' }}>{info.phone}</b></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
