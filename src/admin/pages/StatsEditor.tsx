import { useContent } from '@/store/content'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHead, Field, IconPicker, SortableList, DeleteBtn } from '../parts'
import { Plus } from 'lucide-react'

export function StatsEditor() {
  const c = useContent((s) => s.content)
  const set = useContent((s) => s.set)
  const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Dải số liệu" desc="Các con số nổi bật hiển thị trên trang (năm kinh nghiệm, chứng chỉ…)." />

      <SortableList items={c.stats} onChange={(list) => set((d) => { d.stats = list })}>
        {(st, i, handle) => (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">{handle}<span className="text-sm font-semibold text-muted-foreground">Số liệu #{i + 1}</span></div>
                <DeleteBtn onClick={() => set((d) => { d.stats.splice(i, 1) })} />
              </div>
              <div className="grid sm:grid-cols-[200px_1fr_1fr] gap-3">
                <IconPicker value={st.icon} onChange={(v) => set((d) => { d.stats[i].icon = v })} />
                <Field label="Con số" value={st.value} onChange={(v) => set((d) => { d.stats[i].value = v })} />
                <Field label="Nhãn" value={st.label} onChange={(v) => set((d) => { d.stats[i].label = v })} />
              </div>
            </CardContent>
          </Card>
        )}
      </SortableList>
      <Button variant="outline" onClick={() => set((d) => { d.stats.push({ id: newId(), icon: 'heart', value: '0', label: 'Nhãn mới' }) })}><Plus className="size-4" /> Thêm số liệu</Button>
    </div>
  )
}
