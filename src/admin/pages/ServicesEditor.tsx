import { useContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHead, Field, Area, IconPicker, SortableList, DeleteBtn } from '../parts'
import { Plus } from 'lucide-react'

export function ServicesEditor() {
  const c = useContent((s) => s.content)
  const set = useContent((s) => s.set)
  const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Dịch vụ" desc="Danh sách dịch vụ hiển thị trên website." />

      <Card>
        <CardHeader><CardTitle>Tiêu đề khu vực</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Nhãn nhỏ" value={c.servicesEyebrow} onChange={(v) => set((d) => { d.servicesEyebrow = v })} />
            <Field label="Tiêu đề" value={c.servicesTitle} onChange={(v) => set((d) => { d.servicesTitle = v })} />
            <Field label="Từ nhấn (đỏ)" value={c.servicesTitleHighlight} onChange={(v) => set((d) => { d.servicesTitleHighlight = v })} />
          </div>
          <Area label="Mô tả ngắn" value={c.servicesLead} onChange={(v) => set((d) => { d.servicesLead = v })} />
        </CardContent>
      </Card>

      <SortableList items={c.services} onChange={(list) => set((d) => { d.services = list })}>
        {(sv, i, handle) => (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">{handle}<span className="text-sm font-semibold text-muted-foreground">Dịch vụ #{i + 1}</span></div>
                <DeleteBtn onClick={() => set((d) => { d.services.splice(i, 1) })} />
              </div>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-[200px_1fr] gap-3">
                  <IconPicker value={sv.icon} onChange={(v) => set((d) => { d.services[i].icon = v })} />
                  <Field label="Tên dịch vụ" value={sv.title} onChange={(v) => set((d) => { d.services[i].title = v })} />
                </div>
                <Field label="Mô tả" value={sv.desc} onChange={(v) => set((d) => { d.services[i].desc = v })} />
              </div>
            </CardContent>
          </Card>
        )}
      </SortableList>
      <Button variant="outline" onClick={() => set((d) => { d.services.push({ id: newId(), icon: 'heart', title: 'Dịch vụ mới', desc: 'Mô tả dịch vụ' }) })}><Plus className="size-4" /> Thêm dịch vụ</Button>
    </div>
  )
}
