import { useContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHead, Field, IconPicker, SortableList, DeleteBtn } from '../parts'
import { Plus } from 'lucide-react'

export function WhyEditor() {
  const c = useContent((s) => s.content)
  const set = useContent((s) => s.set)
  const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Cam kết (Vì sao chọn)" desc="Các lý do khách hàng nên chọn phòng khám." />

      <Card>
        <CardHeader><CardTitle>Tiêu đề khu vực</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <Field label="Nhãn nhỏ" value={c.whyEyebrow} onChange={(v) => set((d) => { d.whyEyebrow = v })} />
          <Field label="Tiêu đề" value={c.whyTitle} onChange={(v) => set((d) => { d.whyTitle = v })} />
          <Field label="Từ nhấn (đỏ)" value={c.whyTitleHighlight} onChange={(v) => set((d) => { d.whyTitleHighlight = v })} />
        </CardContent>
      </Card>

      <SortableList items={c.whys} onChange={(list) => set((d) => { d.whys = list })}>
        {(w, i, handle) => (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">{handle}<span className="text-sm font-semibold text-muted-foreground">Cam kết #{i + 1}</span></div>
                <DeleteBtn onClick={() => set((d) => { d.whys.splice(i, 1) })} />
              </div>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-[200px_1fr] gap-3">
                  <IconPicker value={w.icon} onChange={(v) => set((d) => { d.whys[i].icon = v })} />
                  <Field label="Tiêu đề" value={w.title} onChange={(v) => set((d) => { d.whys[i].title = v })} />
                </div>
                <Field label="Mô tả" value={w.desc} onChange={(v) => set((d) => { d.whys[i].desc = v })} />
              </div>
            </CardContent>
          </Card>
        )}
      </SortableList>
      <Button variant="outline" onClick={() => set((d) => { d.whys.push({ id: newId(), icon: 'check', title: 'Cam kết mới', desc: 'Mô tả' }) })}><Plus className="size-4" /> Thêm cam kết</Button>
    </div>
  )
}
