import { useContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHead, Field, IconPicker, SortableList, DeleteBtn } from '../parts'
import { Plus } from 'lucide-react'

export function SpecialtiesEditor() {
  const c = useContent((s) => s.content)
  const set = useContent((s) => s.set)
  const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Lĩnh vực chuyên môn" desc="Các thế mạnh chuyên sâu." />

      <Card>
        <CardHeader><CardTitle>Tiêu đề khu vực</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <Field label="Nhãn nhỏ" value={c.specialtiesEyebrow} onChange={(v) => set((d) => { d.specialtiesEyebrow = v })} />
          <Field label="Tiêu đề" value={c.specialtiesTitle} onChange={(v) => set((d) => { d.specialtiesTitle = v })} />
          <Field label="Từ nhấn (đỏ)" value={c.specialtiesTitleHighlight} onChange={(v) => set((d) => { d.specialtiesTitleHighlight = v })} />
        </CardContent>
      </Card>

      <SortableList items={c.specialties} onChange={(list) => set((d) => { d.specialties = list })}>
        {(sp, i, handle) => (
          <Card>
            <CardContent className="p-4 flex items-end gap-3 flex-wrap">
              <div className="self-center">{handle}</div>
              <div className="w-[200px]"><IconPicker value={sp.icon} onChange={(v) => set((d) => { d.specialties[i].icon = v })} /></div>
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <span className="text-sm font-medium">Tên chuyên môn</span>
                <Input value={sp.title} onChange={(e) => set((d) => { d.specialties[i].title = e.target.value })} />
              </div>
              <DeleteBtn onClick={() => set((d) => { d.specialties.splice(i, 1) })} />
            </CardContent>
          </Card>
        )}
      </SortableList>
      <Button variant="outline" onClick={() => set((d) => { d.specialties.push({ id: newId(), icon: 'heart', title: 'Chuyên môn mới' }) })}><Plus className="size-4" /> Thêm chuyên môn</Button>
    </div>
  )
}
