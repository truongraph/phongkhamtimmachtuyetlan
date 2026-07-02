import { useContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import { PageHead, Field, Area, ImageUpload, PhoneField, SideTabs, SortableList, DeleteBtn } from '../parts'
import { AddressPicker } from '../AddressPicker'
import { provinceName } from '@/lib/vn-address'
import { FONTS, FONT_NAMES, fontStack, fontCategory, googleFontsHref } from '@/lib/fonts'
import { Plus, Building2, MapPin, Globe, Clock, Image as ImageIcon, Palette, AlignLeft } from 'lucide-react'

function FontField({ label, value, onChange, sample }: { label: string; value: string; onChange: (v: string) => void; sample: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Combobox
        value={value}
        onChange={onChange}
        placeholder="Chọn phông chữ"
        searchPlaceholder="Tìm phông…"
        options={FONTS.map((f) => ({
          value: f.name,
          label: f.name,
          keywords: f.category,
          icon: <span className="w-7 text-center text-base" style={{ fontFamily: fontStack(f.name) }}>Aa</span>,
        }))}
      />
      <p className="text-sm text-muted-foreground truncate" style={{ fontFamily: fontStack(value) }}>{sample}</p>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-10 rounded-md border cursor-pointer bg-white p-0.5" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
      </div>
    </div>
  )
}

export function Settings() {
  const c = useContent((s) => s.content)
  const set = useContent((s) => s.set)

  return (
    <div className="space-y-6">
      <PageHead title="Cài đặt chung" desc="Thông tin phòng khám, màu sắc, phông chữ và logo." />
      {/* nạp trước các phông để xem thử trong bảng chọn */}
      <link rel="stylesheet" href={googleFontsHref(FONT_NAMES, '500;700')} />

      <SideTabs tabs={[
        {
          key: 'info', label: 'Thông tin', icon: <Building2 />, content: (
            <Card>
              <CardHeader><CardTitle>Thông tin phòng khám</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <Field label="Tên phòng khám" value={c.info.clinicName} onChange={(v) => set((d) => { d.info.clinicName = v })} />
                <Field label="Dòng phụ (tagline)" value={c.info.tagline} onChange={(v) => set((d) => { d.info.tagline = v })} />
                <PhoneField label="Số điện thoại" value={c.info.phone} onChange={(v) => set((d) => { d.info.phone = v })} />
                <Field label="Phương châm" value={c.info.slogan} onChange={(v) => set((d) => { d.info.slogan = v })} />
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'address', label: 'Địa chỉ', icon: <MapPin />, content: (
            <Card>
              <CardHeader><CardTitle>Địa chỉ phòng khám</CardTitle></CardHeader>
              <CardContent>
                <AddressPicker
                  value={{ street: c.info.street, ward: c.info.ward, province: c.info.province }}
                  onChange={(v) => set((d) => {
                    d.info.street = v.street; d.info.ward = v.ward; d.info.province = v.province
                    d.info.address = [v.street, v.ward].filter(Boolean).join(', ')
                    d.info.addressNote = provinceName(v.province)
                  })}
                />
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'seo', label: 'SEO', icon: <Globe />, content: (
            <Card>
              <CardHeader><CardTitle>SEO (hiển thị trên Google & tab trình duyệt)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="Tiêu đề trang (title)" value={c.seo.title} onChange={(v) => set((d) => { d.seo.title = v })} />
                <Area label="Mô tả trang (description)" rows={2} value={c.seo.description} onChange={(v) => set((d) => { d.seo.description = v })} />
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'hours', label: 'Giờ làm việc', icon: <Clock />, content: (
            <Card>
              <CardHeader><CardTitle>Giờ làm việc</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <SortableList items={c.info.hours} onChange={(list) => set((d) => { d.info.hours = list })} className="space-y-2">
                  {(h, i, handle) => (
                    <div className="flex items-center gap-2">
                      {handle}
                      <Input className="flex-1" value={h.label} onChange={(e) => set((d) => { d.info.hours[i].label = e.target.value })} placeholder="Thứ 2 – Thứ 7" />
                      <Input className="flex-1" value={h.value} onChange={(e) => set((d) => { d.info.hours[i].value = e.target.value })} placeholder="17:00 – 20:00" />
                      <DeleteBtn onClick={() => set((d) => { d.info.hours.splice(i, 1) })} />
                    </div>
                  )}
                </SortableList>
                <Button variant="outline" size="sm" onClick={() => set((d) => { d.info.hours.push({ id: Math.random().toString(36).slice(2, 9), label: 'Ngày mới', value: '08:00 – 11:00' }) })}><Plus className="size-4" /> Thêm dòng</Button>
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'logo', label: 'Logo', icon: <ImageIcon />, content: (
            <Card>
              <CardHeader><CardTitle>Logo</CardTitle></CardHeader>
              <CardContent>
                <ImageUpload label="Logo phòng khám" value={c.info.logoUrl} onChange={(v) => set((d) => { d.info.logoUrl = v })} />
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'theme', label: 'Giao diện', icon: <Palette />, content: (
            <Card>
              <CardHeader><CardTitle>Giao diện (màu &amp; phông)</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-3 gap-4">
                  <ColorField label="Màu chính" value={c.theme.primary} onChange={(v) => set((d) => { d.theme.primary = v })} />
                  <ColorField label="Màu phụ" value={c.theme.navy} onChange={(v) => set((d) => { d.theme.navy = v })} />
                  <ColorField label="Màu đỏ" value={c.theme.accent} onChange={(v) => set((d) => { d.theme.accent = v })} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FontField
                    label="Phông tiêu đề"
                    value={c.theme.fontHeading || 'Lora'}
                    sample="Chăm sóc sức khỏe tim mạch tận tâm"
                    onChange={(v) => set((d) => { d.theme.fontHeading = v; d.theme.headingFont = fontCategory(v) === 'serif' ? 'display' : 'sans' })}
                  />
                  <FontField
                    label="Phông nội dung (mặc định Inter)"
                    value={c.theme.fontBody || 'Inter'}
                    sample="Chẩn đoán chính xác, điều trị hiệu quả, chi phí hợp lý."
                    onChange={(v) => set((d) => { d.theme.fontBody = v })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Bo góc ({c.theme.radius}px)</Label>
                  <input type="range" min={0} max={24} value={c.theme.radius} onChange={(e) => set((d) => { d.theme.radius = Number(e.target.value) })} className="w-full mt-3 accent-primary" />
                </div>
                <div className="rounded-lg border p-4 flex items-center gap-3 flex-wrap" style={{ background: c.theme.primary + '10' }}>
                  <span className="size-8 rounded-md" style={{ background: c.theme.primary }} />
                  <span className="size-8 rounded-md" style={{ background: c.theme.navy }} />
                  <span className="size-8 rounded-md" style={{ background: c.theme.accent }} />
                  <span className="text-sm text-muted-foreground">Xem trước bảng màu — bấm “Xem website” để thấy toàn bộ.</span>
                </div>
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'footer', label: 'Chân trang', icon: <AlignLeft />, content: (
            <Card>
              <CardHeader><CardTitle>Chân trang (Footer)</CardTitle></CardHeader>
              <CardContent>
                <Area label="Mô tả ở chân trang" value={c.footerAbout} onChange={(v) => set((d) => { d.footerAbout = v })} />
              </CardContent>
            </Card>
          ),
        },
      ]} />
    </div>
  )
}
