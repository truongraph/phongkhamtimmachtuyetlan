import { useContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHead, Field, SortableList, DeleteBtn } from '../parts'
import { Plus } from 'lucide-react'

export function JourneyEditor() {
  const c = useContent((s) => s.content)
  const set = useContent((s) => s.set)
  const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Đào tạo & Nghiên cứu" desc="Bằng cấp, chứng chỉ, kinh nghiệm và công trình nghiên cứu." />

      <Card>
        <CardHeader><CardTitle>Tiêu đề khu vực</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <Field label="Nhãn nhỏ" value={c.journeyEyebrow} onChange={(v) => set((d) => { d.journeyEyebrow = v })} />
          <Field label="Tiêu đề" value={c.journeyTitle} onChange={(v) => set((d) => { d.journeyTitle = v })} />
          <Field label="Từ nhấn (đỏ)" value={c.journeyTitleHighlight} onChange={(v) => set((d) => { d.journeyTitleHighlight = v })} />
        </CardContent>
      </Card>

      <Tabs defaultValue={c.timeline[0]?.key ?? 'edu'}>
        <TabsList className="flex-wrap h-auto">
          {c.timeline.map((t) => <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>)}
          <TabsTrigger value="__research">Nghiên cứu</TabsTrigger>
        </TabsList>

        {c.timeline.map((tab, ti) => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]"><Field label="Tên tab" value={tab.label} onChange={(v) => set((d) => { d.timeline[ti].label = v })} /></div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={!!tab.twoCol} onCheckedChange={(v) => set((d) => { d.timeline[ti].twoCol = v })} />
                  <Label>Hiển thị 2 cột</Label>
                </div>
              </CardContent>
            </Card>

            <SortableList items={tab.items} onChange={(list) => set((d) => { d.timeline[ti].items = list })} className="space-y-4">
              {(it, ii, handle) => (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">{handle}<span className="text-sm font-semibold text-muted-foreground">Mốc #{ii + 1}</span></div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2"><Switch checked={!!it.now} onCheckedChange={(v) => set((d) => { d.timeline[ti].items[ii].now = v })} /><Label className="text-xs">Hiện tại</Label></div>
                        <DeleteBtn onClick={() => set((d) => { d.timeline[ti].items.splice(ii, 1) })} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-[140px_1fr] gap-3">
                        <Field label="Năm" value={it.year} onChange={(v) => set((d) => { d.timeline[ti].items[ii].year = v })} />
                        <Field label="Tiêu đề" value={it.title} onChange={(v) => set((d) => { d.timeline[ti].items[ii].title = v })} />
                      </div>
                      <Field label="Nơi / mô tả" value={it.place} onChange={(v) => set((d) => { d.timeline[ti].items[ii].place = v })} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </SortableList>
            <Button variant="outline" size="sm" onClick={() => set((d) => { d.timeline[ti].items.push({ id: newId(), year: '2024', title: 'Mốc mới', place: 'Mô tả' }) })}><Plus className="size-4" /> Thêm mốc</Button>
          </TabsContent>
        ))}

        <TabsContent value="__research" className="space-y-4">
          <SortableList items={c.research} onChange={(list) => set((d) => { d.research = list })} className="space-y-4">
            {(r, ri, handle) => (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">{handle}<span className="text-sm font-semibold text-muted-foreground">Nghiên cứu #{ri + 1}</span></div>
                    <DeleteBtn onClick={() => set((d) => { d.research.splice(ri, 1) })} />
                  </div>
                  <div className="grid sm:grid-cols-[140px_1fr] gap-3">
                    <div className="space-y-3">
                      <Field label="Năm" value={r.year} onChange={(v) => set((d) => { d.research[ri].year = v })} />
                      <Field label="Nhãn" value={r.tag} onChange={(v) => set((d) => { d.research[ri].tag = v })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tiêu đề công trình</Label>
                      <Input value={r.title} onChange={(e) => set((d) => { d.research[ri].title = e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </SortableList>
          <Button variant="outline" size="sm" onClick={() => set((d) => { d.research.push({ id: newId(), year: '2024', title: 'Công trình mới', tag: 'Tim mạch' }) })}><Plus className="size-4" /> Thêm nghiên cứu</Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
