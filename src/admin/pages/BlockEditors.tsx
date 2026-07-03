import { useContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHead, Field, Area, ImageUpload, SortableList, DeleteBtn } from '../parts'
import { Plus } from 'lucide-react'

/** Thẻ "Tiêu đề khu vực" dùng chung (nhãn nhỏ · tiêu đề · từ nhấn [+ mô tả]). */
function HeadCard({ eyebrow, title, hi, lead, on }: {
  eyebrow: string; title: string; hi: string; lead?: string
  on: { eyebrow: (v: string) => void; title: (v: string) => void; hi: (v: string) => void; lead?: (v: string) => void }
}) {
  return (
    <Card>
      <CardHeader><CardTitle>Tiêu đề khu vực</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Nhãn nhỏ" value={eyebrow} onChange={on.eyebrow} />
          <Field label="Tiêu đề" value={title} onChange={on.title} />
          <Field label="Từ nhấn (đỏ)" value={hi} onChange={on.hi} />
        </div>
        {on.lead && <Area label="Mô tả ngắn" value={lead ?? ''} onChange={on.lead} />}
      </CardContent>
    </Card>
  )
}

function ItemCard({ handle, label, index, onDelete, children }: {
  handle: React.ReactNode; label: string; index: number; onDelete: () => void; children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">{handle}<span className="text-sm font-semibold text-muted-foreground">{label} #{index + 1}</span></div>
          <DeleteBtn onClick={onDelete} />
        </div>
        <div className="space-y-3">{children}</div>
      </CardContent>
    </Card>
  )
}

export function FaqEditor() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Câu hỏi thường gặp" desc="Danh sách hỏi – đáp giúp giải đáp thắc mắc của bệnh nhân." />
      <HeadCard eyebrow={c.faqEyebrow} title={c.faqTitle} hi={c.faqTitleHighlight}
        on={{ eyebrow: (v) => set((d) => { d.faqEyebrow = v }), title: (v) => set((d) => { d.faqTitle = v }), hi: (v) => set((d) => { d.faqTitleHighlight = v }) }} />
      <SortableList items={c.faqs} onChange={(l) => set((d) => { d.faqs = l })}>
        {(f, i, handle) => (
          <ItemCard handle={handle} label="Câu hỏi" index={i} onDelete={() => set((d) => { d.faqs.splice(i, 1) })}>
            <Field label="Câu hỏi" value={f.q} onChange={(v) => set((d) => { d.faqs[i].q = v })} />
            <Area label="Trả lời" value={f.a} onChange={(v) => set((d) => { d.faqs[i].a = v })} />
          </ItemCard>
        )}
      </SortableList>
      <Button variant="outline" onClick={() => set((d) => { d.faqs.push({ id: newId(), q: 'Câu hỏi mới?', a: 'Nội dung trả lời...' }) })}><Plus className="size-4" /> Thêm câu hỏi</Button>
    </div>
  )
}

export function TestimonialsEditor() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Cảm nhận bệnh nhân" desc="Trích lời khen / đánh giá của bệnh nhân." />
      <HeadCard eyebrow={c.testimonialsEyebrow} title={c.testimonialsTitle} hi={c.testimonialsTitleHighlight}
        on={{ eyebrow: (v) => set((d) => { d.testimonialsEyebrow = v }), title: (v) => set((d) => { d.testimonialsTitle = v }), hi: (v) => set((d) => { d.testimonialsTitleHighlight = v }) }} />
      <SortableList items={c.testimonials} onChange={(l) => set((d) => { d.testimonials = l })}>
        {(t, i, handle) => (
          <ItemCard handle={handle} label="Cảm nhận" index={i} onDelete={() => set((d) => { d.testimonials.splice(i, 1) })}>
            <Area label="Nội dung cảm nhận" value={t.quote} onChange={(v) => set((d) => { d.testimonials[i].quote = v })} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Tên người" value={t.name} onChange={(v) => set((d) => { d.testimonials[i].name = v })} />
              <Field label="Vai trò / mô tả" value={t.role} onChange={(v) => set((d) => { d.testimonials[i].role = v })} />
            </div>
            <ImageUpload label="Ảnh (tùy chọn)" value={t.photoUrl} onChange={(v) => set((d) => { d.testimonials[i].photoUrl = v })} />
          </ItemCard>
        )}
      </SortableList>
      <Button variant="outline" onClick={() => set((d) => { d.testimonials.push({ id: newId(), quote: 'Nội dung cảm nhận...', name: 'Tên khách hàng', role: 'Bệnh nhân', photoUrl: '' }) })}><Plus className="size-4" /> Thêm cảm nhận</Button>
    </div>
  )
}

export function PricingEditor() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Bảng giá dịch vụ" desc="Danh sách dịch vụ kèm mức giá tham khảo." />
      <HeadCard eyebrow={c.pricingEyebrow} title={c.pricingTitle} hi={c.pricingTitleHighlight} lead={c.pricingLead}
        on={{ eyebrow: (v) => set((d) => { d.pricingEyebrow = v }), title: (v) => set((d) => { d.pricingTitle = v }), hi: (v) => set((d) => { d.pricingTitleHighlight = v }), lead: (v) => set((d) => { d.pricingLead = v }) }} />
      <SortableList items={c.pricing} onChange={(l) => set((d) => { d.pricing = l })}>
        {(p, i, handle) => (
          <ItemCard handle={handle} label="Mục giá" index={i} onDelete={() => set((d) => { d.pricing.splice(i, 1) })}>
            <div className="grid sm:grid-cols-[1fr_160px] gap-3">
              <Field label="Tên dịch vụ" value={p.name} onChange={(v) => set((d) => { d.pricing[i].name = v })} />
              <Field label="Giá" value={p.price} onChange={(v) => set((d) => { d.pricing[i].price = v })} />
            </div>
            <Field label="Ghi chú" value={p.note} onChange={(v) => set((d) => { d.pricing[i].note = v })} />
          </ItemCard>
        )}
      </SortableList>
      <Button variant="outline" onClick={() => set((d) => { d.pricing.push({ id: newId(), name: 'Dịch vụ mới', price: '0đ', note: '' }) })}><Plus className="size-4" /> Thêm mục giá</Button>
    </div>
  )
}

export function GalleryEditor() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Thư viện ảnh" desc="Lưới ảnh phòng khám / trang thiết bị / hoạt động." />
      <HeadCard eyebrow={c.galleryEyebrow} title={c.galleryTitle} hi={c.galleryTitleHighlight}
        on={{ eyebrow: (v) => set((d) => { d.galleryEyebrow = v }), title: (v) => set((d) => { d.galleryTitle = v }), hi: (v) => set((d) => { d.galleryTitleHighlight = v }) }} />
      <SortableList items={c.gallery} onChange={(l) => set((d) => { d.gallery = l })}>
        {(g, i, handle) => (
          <ItemCard handle={handle} label="Ảnh" index={i} onDelete={() => set((d) => { d.gallery.splice(i, 1) })}>
            <ImageUpload label="Ảnh" value={g.url} onChange={(v) => set((d) => { d.gallery[i].url = v })} />
            <Field label="Chú thích" value={g.caption} onChange={(v) => set((d) => { d.gallery[i].caption = v })} />
          </ItemCard>
        )}
      </SortableList>
      <Button variant="outline" onClick={() => set((d) => { d.gallery.push({ id: newId(), url: '/doctor.webp', caption: 'Ảnh mới' }) })}><Plus className="size-4" /> Thêm ảnh</Button>
    </div>
  )
}
