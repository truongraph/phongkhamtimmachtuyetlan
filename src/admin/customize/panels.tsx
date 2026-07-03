import { useContent, type SiteContent } from '@/store/content'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Combobox } from '@/components/ui/combobox'
import { Field, Area, IconPicker, ImageUpload, PhoneField, SortableList, DeleteBtn } from '../parts'
import { AddressPicker } from '../AddressPicker'
import { provinceName } from '@/lib/vn-address'
import { FONTS, FONT_NAMES, fontStack, fontCategory, googleFontsHref } from '@/lib/fonts'
import {
  Plus, Type, ListChecks, CalendarCheck, Stethoscope, ShieldCheck, HeartPulse, UserSquare,
  AlignLeft, Tags, GraduationCap, Quote, FlaskConical, Building2, MapPin, Globe, Clock, Image as ImageIcon,
  Palette, Megaphone, PanelBottom, HelpCircle, MessageSquareQuote, CircleDollarSign, Images, type LucideIcon,
} from 'lucide-react'

export type PanelKey =
  | 'hero' | 'about' | 'services' | 'why' | 'specialties' | 'journey'
  | 'faq' | 'testimonials' | 'pricing' | 'gallery' | 'contact' | 'settings'
export interface SectionMeta { key: string; title: string; icon: LucideIcon; Body: React.FC<{ sk: string }> }

/* ============ KHỐI GỌN DÙNG CHUNG ============ */

function ItemCard({ handle, index, label, onDelete, children }: {
  handle: React.ReactNode; index: number; label: string; onDelete: () => void; children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-background p-2.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">{handle}<span className="text-[.72rem] font-bold uppercase tracking-wide text-muted-foreground">{label} #{index + 1}</span></div>
        <DeleteBtn onClick={onDelete} />
      </div>
      {children}
    </div>
  )
}

/** Nút "Thêm…" luôn DÍNH ở đáy vùng cuộn (sticky), có dải nền che nội dung trôi bên dưới. */
function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-3 -mb-3 mt-1 px-3 py-2.5 bg-neutral-100/95 backdrop-blur border-t border-border/70">
      <Button type="button" variant="default" size="sm" className="w-full" onClick={onClick}><Plus className="size-4" /> {children}</Button>
    </div>
  )
}

function CColor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[.82rem]">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-9 rounded-md border cursor-pointer bg-white p-0.5 shrink-0" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono h-9" />
      </div>
    </div>
  )
}

function CFont({ label, value, onChange, sample }: { label: string; value: string; onChange: (v: string) => void; sample: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[.82rem]">{label}</Label>
      <Combobox
        value={value} onChange={onChange} placeholder="Chọn phông chữ" searchPlaceholder="Tìm phông…"
        options={FONTS.map((f) => ({ value: f.name, label: f.name, keywords: f.category, icon: <span className="w-7 text-center text-base" style={{ fontFamily: fontStack(f.name) }}>Aa</span> }))}
      />
      <p className="text-xs text-muted-foreground truncate" style={{ fontFamily: fontStack(value) }}>{sample}</p>
    </div>
  )
}

/* ============ TRANG CHỦ (HERO) ============ */
function HeroTitleBody() {
  const h = useContent((s) => s.content.hero); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Huy hiệu — trước" value={h.badgePrefix} onChange={(v) => set((c) => { c.hero.badgePrefix = v })} />
      <Field label="Huy hiệu — đậm" value={h.badgeStrong} onChange={(v) => set((c) => { c.hero.badgeStrong = v })} />
      <Field label="Huy hiệu — sau" value={h.badgeSuffix} onChange={(v) => set((c) => { c.hero.badgeSuffix = v })} />
      <Area label="Tiêu đề chính" rows={2} value={h.title} onChange={(v) => set((c) => { c.hero.title = v })} />
      <Field label="Từ nhấn (màu đỏ)" value={h.titleHighlight} onChange={(v) => set((c) => { c.hero.titleHighlight = v })} />
      <Area label="Mô tả ngắn" value={h.subtitle} onChange={(v) => set((c) => { c.hero.subtitle = v })} />
    </>
  )
}
function HeroBulletsBody() {
  const h = useContent((s) => s.content.hero); const set = useContent((s) => s.set)
  return (
    <>
      <SortableList items={h.bullets.map((text, i) => ({ id: String(i), text }))} onChange={(list) => set((c) => { c.hero.bullets = list.map((x) => x.text) })} className="space-y-2">
        {(it, i, handle) => (
          <div className="flex items-center gap-2">
            {handle}
            <Input value={it.text} onChange={(e) => set((c) => { c.hero.bullets[i] = e.target.value })} />
            <DeleteBtn onClick={() => set((c) => { c.hero.bullets.splice(i, 1) })} />
          </div>
        )}
      </SortableList>
      <AddBtn onClick={() => set((c) => { c.hero.bullets.push('Nội dung mới') })}>Thêm điểm</AddBtn>
    </>
  )
}
function HeroFormBody() {
  const h = useContent((s) => s.content.hero); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Tiêu đề form" value={h.bookingTitle} onChange={(v) => set((c) => { c.hero.bookingTitle = v })} />
      <Field label="Mô tả form" value={h.bookingSubtitle} onChange={(v) => set((c) => { c.hero.bookingSubtitle = v })} />
      <ImageUpload label="Ảnh bác sĩ" value={h.doctorPhotoUrl} onChange={(v) => set((c) => { c.hero.doctorPhotoUrl = v })} />
    </>
  )
}

/* ============ GIỚI THIỆU (ABOUT) ============ */
function AboutHeadBody() {
  const a = useContent((s) => s.content.about); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Nhãn nhỏ" value={a.eyebrow} onChange={(v) => set((c) => { c.about.eyebrow = v })} />
      <Field label="Tiêu đề" value={a.title} onChange={(v) => set((c) => { c.about.title = v })} />
      <Field label="Từ nhấn (đỏ)" value={a.titleHighlight} onChange={(v) => set((c) => { c.about.titleHighlight = v })} />
      <ImageUpload label="Ảnh bác sĩ" value={a.photoUrl} onChange={(v) => set((c) => { c.about.photoUrl = v })} />
      <Field label="Tên hiển thị dưới ảnh" value={a.photoName} onChange={(v) => set((c) => { c.about.photoName = v })} />
      <Field label="Chức danh dưới ảnh" value={a.photoRole} onChange={(v) => set((c) => { c.about.photoRole = v })} />
    </>
  )
}
function AboutParagraphsBody() {
  const a = useContent((s) => s.content.about); const set = useContent((s) => s.set)
  return (
    <>
      <SortableList items={a.paragraphs.map((text, i) => ({ id: String(i), text }))} onChange={(list) => set((c) => { c.about.paragraphs = list.map((x) => x.text) })} className="space-y-2">
        {(it, i, handle) => (
          <div className="flex gap-2 items-start">
            <div className="pt-1.5">{handle}</div>
            <div className="flex-1"><Area label={`Đoạn ${i + 1}`} rows={4} value={it.text} onChange={(v) => set((c) => { c.about.paragraphs[i] = v })} /></div>
            <div className="pt-1.5"><DeleteBtn onClick={() => set((c) => { c.about.paragraphs.splice(i, 1) })} /></div>
          </div>
        )}
      </SortableList>
      <AddBtn onClick={() => set((c) => { c.about.paragraphs.push('Nội dung mới...') })}>Thêm đoạn</AddBtn>
    </>
  )
}
function AboutTagsBody() {
  const a = useContent((s) => s.content.about); const set = useContent((s) => s.set)
  return (
    <>
      <SortableList items={a.tags.map((text, i) => ({ id: String(i), text }))} onChange={(list) => set((c) => { c.about.tags = list.map((x) => x.text) })} className="space-y-2">
        {(it, i, handle) => (
          <div className="flex items-center gap-2">
            {handle}
            <Input value={it.text} onChange={(e) => set((c) => { c.about.tags[i] = e.target.value })} />
            <DeleteBtn onClick={() => set((c) => { c.about.tags.splice(i, 1) })} />
          </div>
        )}
      </SortableList>
      <AddBtn onClick={() => set((c) => { c.about.tags.push('Tổ chức mới') })}>Thêm thẻ</AddBtn>
    </>
  )
}
function AboutCredsBody() {
  const a = useContent((s) => s.content.about); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={a.credentials} onChange={(list) => set((c) => { c.about.credentials = list })} className="space-y-2.5">
        {(cr, i, handle) => (
          <ItemCard handle={handle} index={i} label="Mục" onDelete={() => set((c) => { c.about.credentials.splice(i, 1) })}>
            <IconPicker value={cr.icon} onChange={(v) => set((c) => { c.about.credentials[i].icon = v })} />
            <Field label="Tiêu đề" value={cr.title} onChange={(v) => set((c) => { c.about.credentials[i].title = v })} />
            <Field label="Mô tả" value={cr.sub} onChange={(v) => set((c) => { c.about.credentials[i].sub = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((c) => { c.about.credentials.push({ id: newId(), icon: 'award', title: 'Bằng cấp mới', sub: 'Mô tả' }) })}>Thêm mục</AddBtn>
    </>
  )
}
function AboutQuoteBody() {
  const a = useContent((s) => s.content.about); const set = useContent((s) => s.set)
  return (
    <>
      <Area label="Nội dung trích dẫn" value={a.quote} onChange={(v) => set((c) => { c.about.quote = v })} />
      <Field label="Nguồn / ghi chú" value={a.quoteCite} onChange={(v) => set((c) => { c.about.quoteCite = v })} />
    </>
  )
}

/* ============ DỊCH VỤ / CAM KẾT (icon + tiêu đề + mô tả) ============ */
function ServicesHeadBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Nhãn nhỏ" value={c.servicesEyebrow} onChange={(v) => set((d) => { d.servicesEyebrow = v })} />
      <Field label="Tiêu đề" value={c.servicesTitle} onChange={(v) => set((d) => { d.servicesTitle = v })} />
      <Field label="Từ nhấn (đỏ)" value={c.servicesTitleHighlight} onChange={(v) => set((d) => { d.servicesTitleHighlight = v })} />
      <Area label="Mô tả ngắn" value={c.servicesLead} onChange={(v) => set((d) => { d.servicesLead = v })} />
    </>
  )
}
function ServicesItemsBody() {
  const list = useContent((s) => s.content.services); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={list} onChange={(l) => set((d) => { d.services = l })} className="space-y-2.5">
        {(sv, i, handle) => (
          <ItemCard handle={handle} index={i} label="Dịch vụ" onDelete={() => set((d) => { d.services.splice(i, 1) })}>
            <IconPicker value={sv.icon} onChange={(v) => set((d) => { d.services[i].icon = v })} />
            <Field label="Tên dịch vụ" value={sv.title} onChange={(v) => set((d) => { d.services[i].title = v })} />
            <Field label="Mô tả" value={sv.desc} onChange={(v) => set((d) => { d.services[i].desc = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.services.push({ id: newId(), icon: 'heart', title: 'Dịch vụ mới', desc: 'Mô tả dịch vụ' }) })}>Thêm dịch vụ</AddBtn>
    </>
  )
}
function WhyHeadBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Nhãn nhỏ" value={c.whyEyebrow} onChange={(v) => set((d) => { d.whyEyebrow = v })} />
      <Field label="Tiêu đề" value={c.whyTitle} onChange={(v) => set((d) => { d.whyTitle = v })} />
      <Field label="Từ nhấn (đỏ)" value={c.whyTitleHighlight} onChange={(v) => set((d) => { d.whyTitleHighlight = v })} />
    </>
  )
}
function WhyItemsBody() {
  const list = useContent((s) => s.content.whys); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={list} onChange={(l) => set((d) => { d.whys = l })} className="space-y-2.5">
        {(w, i, handle) => (
          <ItemCard handle={handle} index={i} label="Cam kết" onDelete={() => set((d) => { d.whys.splice(i, 1) })}>
            <IconPicker value={w.icon} onChange={(v) => set((d) => { d.whys[i].icon = v })} />
            <Field label="Tiêu đề" value={w.title} onChange={(v) => set((d) => { d.whys[i].title = v })} />
            <Field label="Mô tả" value={w.desc} onChange={(v) => set((d) => { d.whys[i].desc = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.whys.push({ id: newId(), icon: 'check', title: 'Cam kết mới', desc: 'Mô tả' }) })}>Thêm cam kết</AddBtn>
    </>
  )
}

/* ============ CHUYÊN MÔN ============ */
function SpecHeadBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Nhãn nhỏ" value={c.specialtiesEyebrow} onChange={(v) => set((d) => { d.specialtiesEyebrow = v })} />
      <Field label="Tiêu đề" value={c.specialtiesTitle} onChange={(v) => set((d) => { d.specialtiesTitle = v })} />
      <Field label="Từ nhấn (đỏ)" value={c.specialtiesTitleHighlight} onChange={(v) => set((d) => { d.specialtiesTitleHighlight = v })} />
    </>
  )
}
function SpecItemsBody() {
  const list = useContent((s) => s.content.specialties); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={list} onChange={(l) => set((d) => { d.specialties = l })} className="space-y-2.5">
        {(sp, i, handle) => (
          <ItemCard handle={handle} index={i} label="Chuyên môn" onDelete={() => set((d) => { d.specialties.splice(i, 1) })}>
            <IconPicker value={sp.icon} onChange={(v) => set((d) => { d.specialties[i].icon = v })} />
            <Field label="Tên chuyên môn" value={sp.title} onChange={(v) => set((d) => { d.specialties[i].title = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.specialties.push({ id: newId(), icon: 'heart', title: 'Chuyên môn mới' }) })}>Thêm chuyên môn</AddBtn>
    </>
  )
}

/* ============ ĐÀO TẠO & NGHIÊN CỨU ============ */
function JourneyHeadBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Nhãn nhỏ" value={c.journeyEyebrow} onChange={(v) => set((d) => { d.journeyEyebrow = v })} />
      <Field label="Tiêu đề" value={c.journeyTitle} onChange={(v) => set((d) => { d.journeyTitle = v })} />
      <Field label="Từ nhấn (đỏ)" value={c.journeyTitleHighlight} onChange={(v) => set((d) => { d.journeyTitleHighlight = v })} />
    </>
  )
}
function JourneyTabBody({ sk }: { sk: string }) {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  const key = sk.replace(/^tab:/, '')
  const ti = c.timeline.findIndex((t) => t.key === key)
  if (ti < 0) return null
  const tab = c.timeline[ti]
  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[150px]"><Field label="Tên tab" value={tab.label} onChange={(v) => set((d) => { d.timeline[ti].label = v })} /></div>
        <label className="flex items-center gap-2 text-[.8rem] pt-5"><Switch checked={!!tab.twoCol} onCheckedChange={(v) => set((d) => { d.timeline[ti].twoCol = v })} /> 2 cột</label>
      </div>
      <SortableList items={tab.items} onChange={(list) => set((d) => { d.timeline[ti].items = list })} className="space-y-2.5">
        {(it, ii, handle) => (
          <ItemCard handle={handle} index={ii} label="Mốc" onDelete={() => set((d) => { d.timeline[ti].items.splice(ii, 1) })}>
            <Field label="Năm" value={it.year} onChange={(v) => set((d) => { d.timeline[ti].items[ii].year = v })} />
            <Field label="Tiêu đề" value={it.title} onChange={(v) => set((d) => { d.timeline[ti].items[ii].title = v })} />
            <Field label="Nơi / mô tả" value={it.place} onChange={(v) => set((d) => { d.timeline[ti].items[ii].place = v })} />
            <label className="flex items-center gap-2 text-[.8rem]"><Switch checked={!!it.now} onCheckedChange={(v) => set((d) => { d.timeline[ti].items[ii].now = v })} /> Đánh dấu "hiện tại"</label>
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.timeline[ti].items.push({ id: newId(), year: '2024', title: 'Mốc mới', place: 'Mô tả' }) })}>Thêm mốc</AddBtn>
    </>
  )
}
function JourneyResearchBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={c.research} onChange={(list) => set((d) => { d.research = list })} className="space-y-2.5">
        {(r, ri, handle) => (
          <ItemCard handle={handle} index={ri} label="Nghiên cứu" onDelete={() => set((d) => { d.research.splice(ri, 1) })}>
            <Field label="Năm" value={r.year} onChange={(v) => set((d) => { d.research[ri].year = v })} />
            <Field label="Nhãn" value={r.tag} onChange={(v) => set((d) => { d.research[ri].tag = v })} />
            <Field label="Tiêu đề công trình" value={r.title} onChange={(v) => set((d) => { d.research[ri].title = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.research.push({ id: newId(), year: '2024', title: 'Công trình mới', tag: 'Tim mạch' }) })}>Thêm nghiên cứu</AddBtn>
    </>
  )
}

/* ============ CÀI ĐẶT CHUNG ============ */
function SetInfoBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Tên phòng khám" value={c.info.clinicName} onChange={(v) => set((d) => { d.info.clinicName = v })} />
      <Field label="Dòng phụ (tagline)" value={c.info.tagline} onChange={(v) => set((d) => { d.info.tagline = v })} />
      <PhoneField label="Số điện thoại" value={c.info.phone} onChange={(v) => set((d) => { d.info.phone = v })} />
      <Field label="Phương châm" value={c.info.slogan} onChange={(v) => set((d) => { d.info.slogan = v })} />
    </>
  )
}
function SetAddressBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <AddressPicker
      value={{ street: c.info.street, ward: c.info.ward, province: c.info.province }}
      onChange={(v) => set((d) => {
        d.info.street = v.street; d.info.ward = v.ward; d.info.province = v.province
        d.info.address = [v.street, v.ward].filter(Boolean).join(', ')
        d.info.addressNote = provinceName(v.province)
      })}
    />
  )
}
function SetSeoBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Tiêu đề trang" value={c.seo.title} onChange={(v) => set((d) => { d.seo.title = v })} />
      <Area label="Mô tả trang" rows={3} value={c.seo.description} onChange={(v) => set((d) => { d.seo.description = v })} />
    </>
  )
}
function SetHoursBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={c.info.hours} onChange={(list) => set((d) => { d.info.hours = list })} className="space-y-2">
        {(h, i, handle) => (
          <div className="flex items-center gap-1.5">
            {handle}
            <Input className="flex-1" value={h.label} onChange={(e) => set((d) => { d.info.hours[i].label = e.target.value })} placeholder="Thứ 2 – Thứ 7" />
            <Input className="flex-1" value={h.value} onChange={(e) => set((d) => { d.info.hours[i].value = e.target.value })} placeholder="17:00 – 20:00" />
            <DeleteBtn onClick={() => set((d) => { d.info.hours.splice(i, 1) })} />
          </div>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.info.hours.push({ id: newId(), label: 'Ngày mới', value: '08:00 – 11:00' }) })}>Thêm dòng</AddBtn>
    </>
  )
}
function SetLogoBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return <ImageUpload label="Logo phòng khám" value={c.info.logoUrl} onChange={(v) => set((d) => { d.info.logoUrl = v })} />
}
function SetThemeBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <link rel="stylesheet" href={googleFontsHref(FONT_NAMES, '500;700')} />
      <CColor label="Màu chính" value={c.theme.primary} onChange={(v) => set((d) => { d.theme.primary = v })} />
      <CColor label="Màu phụ" value={c.theme.navy} onChange={(v) => set((d) => { d.theme.navy = v })} />
      <CColor label="Màu đỏ (nhấn)" value={c.theme.accent} onChange={(v) => set((d) => { d.theme.accent = v })} />
      <CFont label="Phông tiêu đề" value={c.theme.fontHeading || 'Lora'} sample="Chăm sóc sức khỏe tim mạch tận tâm"
        onChange={(v) => set((d) => { d.theme.fontHeading = v; d.theme.headingFont = fontCategory(v) === 'serif' ? 'display' : 'sans' })} />
      <CFont label="Phông nội dung" value={c.theme.fontBody || 'Inter'} sample="Chẩn đoán chính xác, điều trị hiệu quả."
        onChange={(v) => set((d) => { d.theme.fontBody = v })} />
      <div className="space-y-1.5">
        <Label className="text-[.82rem]">Bo góc ({c.theme.radius}px)</Label>
        <input type="range" min={0} max={24} value={c.theme.radius} onChange={(e) => set((d) => { d.theme.radius = Number(e.target.value) })} className="w-full accent-primary" />
      </div>
    </>
  )
}
function SetCtaBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Tiêu đề" value={c.cta.title} onChange={(v) => set((d) => { d.cta.title = v })} />
      <Field label="Từ nhấn (màu đỏ)" value={c.cta.titleHighlight} onChange={(v) => set((d) => { d.cta.titleHighlight = v })} />
      <Area label="Mô tả" rows={2} value={c.cta.lead} onChange={(v) => set((d) => { d.cta.lead = v })} />
    </>
  )
}
function SetFooterBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return <Area label="Mô tả ở chân trang" value={c.footerAbout} onChange={(v) => set((d) => { d.footerAbout = v })} />
}

/* ============ FAQ ============ */
function FaqHeadBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Nhãn nhỏ" value={c.faqEyebrow} onChange={(v) => set((d) => { d.faqEyebrow = v })} />
      <Field label="Tiêu đề" value={c.faqTitle} onChange={(v) => set((d) => { d.faqTitle = v })} />
      <Field label="Từ nhấn (đỏ)" value={c.faqTitleHighlight} onChange={(v) => set((d) => { d.faqTitleHighlight = v })} />
    </>
  )
}
function FaqItemsBody() {
  const list = useContent((s) => s.content.faqs); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={list} onChange={(l) => set((d) => { d.faqs = l })} className="space-y-2.5">
        {(f, i, handle) => (
          <ItemCard handle={handle} index={i} label="Câu hỏi" onDelete={() => set((d) => { d.faqs.splice(i, 1) })}>
            <Field label="Câu hỏi" value={f.q} onChange={(v) => set((d) => { d.faqs[i].q = v })} />
            <Area label="Trả lời" rows={3} value={f.a} onChange={(v) => set((d) => { d.faqs[i].a = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.faqs.push({ id: newId(), q: 'Câu hỏi mới?', a: 'Nội dung trả lời...' }) })}>Thêm câu hỏi</AddBtn>
    </>
  )
}

/* ============ CẢM NHẬN BỆNH NHÂN ============ */
function TestimonialsHeadBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Nhãn nhỏ" value={c.testimonialsEyebrow} onChange={(v) => set((d) => { d.testimonialsEyebrow = v })} />
      <Field label="Tiêu đề" value={c.testimonialsTitle} onChange={(v) => set((d) => { d.testimonialsTitle = v })} />
      <Field label="Từ nhấn (đỏ)" value={c.testimonialsTitleHighlight} onChange={(v) => set((d) => { d.testimonialsTitleHighlight = v })} />
    </>
  )
}
function TestimonialsItemsBody() {
  const list = useContent((s) => s.content.testimonials); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={list} onChange={(l) => set((d) => { d.testimonials = l })} className="space-y-2.5">
        {(t, i, handle) => (
          <ItemCard handle={handle} index={i} label="Cảm nhận" onDelete={() => set((d) => { d.testimonials.splice(i, 1) })}>
            <Area label="Nội dung cảm nhận" rows={3} value={t.quote} onChange={(v) => set((d) => { d.testimonials[i].quote = v })} />
            <Field label="Tên người" value={t.name} onChange={(v) => set((d) => { d.testimonials[i].name = v })} />
            <Field label="Vai trò / mô tả" value={t.role} onChange={(v) => set((d) => { d.testimonials[i].role = v })} />
            <ImageUpload label="Ảnh (tùy chọn)" value={t.photoUrl} onChange={(v) => set((d) => { d.testimonials[i].photoUrl = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.testimonials.push({ id: newId(), quote: 'Nội dung cảm nhận...', name: 'Tên khách hàng', role: 'Bệnh nhân', photoUrl: '' }) })}>Thêm cảm nhận</AddBtn>
    </>
  )
}

/* ============ BẢNG GIÁ ============ */
function PricingHeadBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Nhãn nhỏ" value={c.pricingEyebrow} onChange={(v) => set((d) => { d.pricingEyebrow = v })} />
      <Field label="Tiêu đề" value={c.pricingTitle} onChange={(v) => set((d) => { d.pricingTitle = v })} />
      <Field label="Từ nhấn (đỏ)" value={c.pricingTitleHighlight} onChange={(v) => set((d) => { d.pricingTitleHighlight = v })} />
      <Area label="Mô tả ngắn" value={c.pricingLead} onChange={(v) => set((d) => { d.pricingLead = v })} />
    </>
  )
}
function PricingItemsBody() {
  const list = useContent((s) => s.content.pricing); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={list} onChange={(l) => set((d) => { d.pricing = l })} className="space-y-2.5">
        {(p, i, handle) => (
          <ItemCard handle={handle} index={i} label="Mục giá" onDelete={() => set((d) => { d.pricing.splice(i, 1) })}>
            <Field label="Tên dịch vụ" value={p.name} onChange={(v) => set((d) => { d.pricing[i].name = v })} />
            <Field label="Giá" value={p.price} onChange={(v) => set((d) => { d.pricing[i].price = v })} />
            <Field label="Ghi chú" value={p.note} onChange={(v) => set((d) => { d.pricing[i].note = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.pricing.push({ id: newId(), name: 'Dịch vụ mới', price: '0đ', note: '' }) })}>Thêm mục giá</AddBtn>
    </>
  )
}

/* ============ THƯ VIỆN ẢNH ============ */
function GalleryHeadBody() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <>
      <Field label="Nhãn nhỏ" value={c.galleryEyebrow} onChange={(v) => set((d) => { d.galleryEyebrow = v })} />
      <Field label="Tiêu đề" value={c.galleryTitle} onChange={(v) => set((d) => { d.galleryTitle = v })} />
      <Field label="Từ nhấn (đỏ)" value={c.galleryTitleHighlight} onChange={(v) => set((d) => { d.galleryTitleHighlight = v })} />
    </>
  )
}
function GalleryItemsBody() {
  const list = useContent((s) => s.content.gallery); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <>
      <SortableList items={list} onChange={(l) => set((d) => { d.gallery = l })} className="space-y-2.5">
        {(g, i, handle) => (
          <ItemCard handle={handle} index={i} label="Ảnh" onDelete={() => set((d) => { d.gallery.splice(i, 1) })}>
            <ImageUpload label="Ảnh" value={g.url} onChange={(v) => set((d) => { d.gallery[i].url = v })} />
            <Field label="Chú thích" value={g.caption} onChange={(v) => set((d) => { d.gallery[i].caption = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.gallery.push({ id: newId(), url: '/doctor.webp', caption: 'Ảnh mới' }) })}>Thêm ảnh</AddBtn>
    </>
  )
}

/* ============ REGISTRY: mỗi panel → danh sách phần con ============ */
export const PANEL_SECTIONS: Partial<Record<PanelKey, (c: SiteContent) => SectionMeta[]>> = {
  hero: (c) => [
    { key: 'title', title: 'Huy hiệu & tiêu đề', icon: Type, Body: HeroTitleBody },
    { key: 'bullets', title: `Điểm nổi bật (${c.hero.bullets.length})`, icon: ListChecks, Body: HeroBulletsBody },
    { key: 'form', title: 'Form đặt lịch & ảnh', icon: CalendarCheck, Body: HeroFormBody },
  ],
  about: (c) => [
    { key: 'head', title: 'Tiêu đề & ảnh', icon: UserSquare, Body: AboutHeadBody },
    { key: 'paragraphs', title: `Đoạn giới thiệu (${c.about.paragraphs.length})`, icon: AlignLeft, Body: AboutParagraphsBody },
    { key: 'tags', title: `Thẻ tổ chức (${c.about.tags.length})`, icon: Tags, Body: AboutTagsBody },
    { key: 'credentials', title: `Bằng cấp & chứng chỉ (${c.about.credentials.length})`, icon: GraduationCap, Body: AboutCredsBody },
    { key: 'quote', title: 'Trích dẫn', icon: Quote, Body: AboutQuoteBody },
  ],
  services: (c) => [
    { key: 'head', title: 'Tiêu đề khu vực', icon: Type, Body: ServicesHeadBody },
    { key: 'items', title: `Danh sách dịch vụ (${c.services.length})`, icon: Stethoscope, Body: ServicesItemsBody },
  ],
  why: (c) => [
    { key: 'head', title: 'Tiêu đề khu vực', icon: Type, Body: WhyHeadBody },
    { key: 'items', title: `Danh sách cam kết (${c.whys.length})`, icon: ShieldCheck, Body: WhyItemsBody },
  ],
  specialties: (c) => [
    { key: 'head', title: 'Tiêu đề khu vực', icon: Type, Body: SpecHeadBody },
    { key: 'items', title: `Lĩnh vực (${c.specialties.length})`, icon: HeartPulse, Body: SpecItemsBody },
  ],
  journey: (c) => [
    { key: 'head', title: 'Tiêu đề khu vực', icon: Type, Body: JourneyHeadBody },
    ...c.timeline.map((t) => ({ key: `tab:${t.key}`, title: `${t.label} (${t.items.length})`, icon: GraduationCap, Body: JourneyTabBody as React.FC<{ sk: string }> })),
    { key: 'research', title: `Nghiên cứu (${c.research.length})`, icon: FlaskConical, Body: JourneyResearchBody },
  ],
  faq: (c) => [
    { key: 'head', title: 'Tiêu đề khu vực', icon: Type, Body: FaqHeadBody },
    { key: 'items', title: `Câu hỏi (${c.faqs.length})`, icon: HelpCircle, Body: FaqItemsBody },
  ],
  testimonials: (c) => [
    { key: 'head', title: 'Tiêu đề khu vực', icon: Type, Body: TestimonialsHeadBody },
    { key: 'items', title: `Cảm nhận (${c.testimonials.length})`, icon: MessageSquareQuote, Body: TestimonialsItemsBody },
  ],
  pricing: (c) => [
    { key: 'head', title: 'Tiêu đề khu vực', icon: Type, Body: PricingHeadBody },
    { key: 'items', title: `Mục giá (${c.pricing.length})`, icon: CircleDollarSign, Body: PricingItemsBody },
  ],
  gallery: (c) => [
    { key: 'head', title: 'Tiêu đề khu vực', icon: Type, Body: GalleryHeadBody },
    { key: 'items', title: `Ảnh (${c.gallery.length})`, icon: Images, Body: GalleryItemsBody },
  ],
  settings: () => [
    { key: 'info', title: 'Thông tin phòng khám', icon: Building2, Body: SetInfoBody },
    { key: 'address', title: 'Địa chỉ', icon: MapPin, Body: SetAddressBody },
    { key: 'seo', title: 'SEO (Google & tab trình duyệt)', icon: Globe, Body: SetSeoBody },
    { key: 'hours', title: 'Giờ làm việc', icon: Clock, Body: SetHoursBody },
    { key: 'logo', title: 'Logo', icon: ImageIcon, Body: SetLogoBody },
    { key: 'theme', title: 'Màu sắc & phông chữ', icon: Palette, Body: SetThemeBody },
    { key: 'cta', title: 'Dải kêu gọi cuối trang', icon: Megaphone, Body: SetCtaBody },
    { key: 'footer', title: 'Chân trang', icon: PanelBottom, Body: SetFooterBody },
  ],
}

/** Panel phẳng: Dải số liệu (icon · con số · nhãn). */
export function StatsPanel() {
  const list = useContent((s) => s.content.stats); const set = useContent((s) => s.set); const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-2.5">
      <SortableList items={list} onChange={(l) => set((d) => { d.stats = l })} className="space-y-2.5">
        {(st, i, handle) => (
          <ItemCard handle={handle} index={i} label="Số liệu" onDelete={() => set((d) => { d.stats.splice(i, 1) })}>
            <IconPicker value={st.icon} onChange={(v) => set((d) => { d.stats[i].icon = v })} />
            <Field label="Con số" value={st.value} onChange={(v) => set((d) => { d.stats[i].value = v })} />
            <Field label="Nhãn" value={st.label} onChange={(v) => set((d) => { d.stats[i].label = v })} />
          </ItemCard>
        )}
      </SortableList>
      <AddBtn onClick={() => set((d) => { d.stats.push({ id: newId(), icon: 'heart', value: '0', label: 'Nhãn mới' }) })}>Thêm số liệu</AddBtn>
    </div>
  )
}

/** Panel phẳng (không có lớp con): Liên hệ. */
export function ContactPanel() {
  const c = useContent((s) => s.content); const set = useContent((s) => s.set)
  return (
    <div className="space-y-3">
      <Field label="Nhãn nhỏ" value={c.contactEyebrow} onChange={(v) => set((d) => { d.contactEyebrow = v })} />
      <Field label="Tiêu đề" value={c.contactTitle} onChange={(v) => set((d) => { d.contactTitle = v })} />
      <Field label="Từ nhấn (đỏ)" value={c.contactTitleHighlight} onChange={(v) => set((d) => { d.contactTitleHighlight = v })} />
      <Area label="Mô tả ngắn khu vực liên hệ" value={c.contactLead} onChange={(v) => set((d) => { d.contactLead = v })} />
      <div className="rounded-lg bg-secondary p-3 text-[.78rem] text-muted-foreground">
        Số điện thoại, địa chỉ (bản đồ) và giờ làm việc chỉnh trong mục <b className="text-foreground">Cài đặt chung</b>.
      </div>
    </div>
  )
}
