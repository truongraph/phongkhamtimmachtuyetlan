import { useContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHead, Field, Area, ImageUpload, SortableList, DeleteBtn, SideTabs } from '../parts'
import { Plus, Type, ListChecks, CalendarCheck } from 'lucide-react'

export function HeroEditor() {
  const h = useContent((s) => s.content.hero)
  const set = useContent((s) => s.set)
  return (
    <div className="space-y-6">
      <PageHead title="Trang chủ" desc="Phần đầu trang cùng form đăng ký khám." />

      <SideTabs tabs={[
        {
          key: 'title', label: 'Huy hiệu & tiêu đề', icon: <Type />, content: (
            <Card>
              <CardHeader><CardTitle>Huy hiệu &amp; tiêu đề</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Huy hiệu — trước" value={h.badgePrefix} onChange={(v) => set((c) => { c.hero.badgePrefix = v })} />
                  <Field label="Huy hiệu — đậm" value={h.badgeStrong} onChange={(v) => set((c) => { c.hero.badgeStrong = v })} />
                  <Field label="Huy hiệu — sau" value={h.badgeSuffix} onChange={(v) => set((c) => { c.hero.badgeSuffix = v })} />
                </div>
                <Area label="Tiêu đề chính" rows={2} value={h.title} onChange={(v) => set((c) => { c.hero.title = v })} />
                <Field label="Từ nhấn (màu đỏ)" value={h.titleHighlight} onChange={(v) => set((c) => { c.hero.titleHighlight = v })} />
                <Area label="Mô tả ngắn" value={h.subtitle} onChange={(v) => set((c) => { c.hero.subtitle = v })} />
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'bullets', label: 'Điểm nổi bật', icon: <ListChecks />, content: (
            <Card>
              <CardHeader><CardTitle>Các điểm nổi bật (dấu tích)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <SortableList items={h.bullets.map((text, i) => ({ id: String(i), text }))} onChange={(list) => set((c) => { c.hero.bullets = list.map((x) => x.text) })} className="space-y-2">
                  {(it, i, handle) => (
                    <div className="flex items-center gap-2">
                      {handle}
                      <Input value={it.text} onChange={(e) => set((c) => { c.hero.bullets[i] = e.target.value })} />
                      <DeleteBtn onClick={() => set((c) => { c.hero.bullets.splice(i, 1) })} />
                    </div>
                  )}
                </SortableList>
                <Button variant="outline" size="sm" onClick={() => set((c) => { c.hero.bullets.push('Nội dung mới') })}><Plus className="size-4" /> Thêm điểm</Button>
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'form', label: 'Form & ảnh', icon: <CalendarCheck />, content: (
            <Card>
              <CardHeader><CardTitle>Form đặt lịch &amp; ảnh bác sĩ</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Tiêu đề form" value={h.bookingTitle} onChange={(v) => set((c) => { c.hero.bookingTitle = v })} />
                  <Field label="Mô tả form" value={h.bookingSubtitle} onChange={(v) => set((c) => { c.hero.bookingSubtitle = v })} />
                </div>
                <ImageUpload label="Ảnh bác sĩ (trong form)" value={h.doctorPhotoUrl} onChange={(v) => set((c) => { c.hero.doctorPhotoUrl = v })} />
              </CardContent>
            </Card>
          ),
        },
      ]} />
    </div>
  )
}
