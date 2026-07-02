import { useContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHead, Field, Area, ImageUpload, IconPicker, SortableList, DeleteBtn, SideTabs } from '../parts'
import { Plus, UserSquare, AlignLeft, Tags, GraduationCap, Quote } from 'lucide-react'

export function AboutEditor() {
  const a = useContent((s) => s.content.about)
  const set = useContent((s) => s.set)
  const newId = useContent((s) => s.newId)
  return (
    <div className="space-y-6">
      <PageHead title="Giới thiệu bác sĩ" desc="Tiểu sử, bằng cấp và trích dẫn." />

      <SideTabs tabs={[
        {
          key: 'head', label: 'Tiêu đề & ảnh', icon: <UserSquare />, content: (
            <Card>
              <CardHeader><CardTitle>Tiêu đề &amp; ảnh</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Nhãn nhỏ" value={a.eyebrow} onChange={(v) => set((c) => { c.about.eyebrow = v })} />
                  <Field label="Tiêu đề" value={a.title} onChange={(v) => set((c) => { c.about.title = v })} />
                  <Field label="Từ nhấn (đỏ)" value={a.titleHighlight} onChange={(v) => set((c) => { c.about.titleHighlight = v })} />
                </div>
                <ImageUpload label="Ảnh bác sĩ" value={a.photoUrl} onChange={(v) => set((c) => { c.about.photoUrl = v })} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Tên hiển thị dưới ảnh" value={a.photoName} onChange={(v) => set((c) => { c.about.photoName = v })} />
                  <Field label="Chức danh dưới ảnh" value={a.photoRole} onChange={(v) => set((c) => { c.about.photoRole = v })} />
                </div>
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'paragraphs', label: 'Đoạn giới thiệu', icon: <AlignLeft />, content: (
            <Card>
              <CardHeader><CardTitle>Đoạn giới thiệu</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <SortableList items={a.paragraphs.map((text, i) => ({ id: String(i), text }))} onChange={(list) => set((c) => { c.about.paragraphs = list.map((x) => x.text) })}>
                  {(it, i, handle) => (
                    <div className="flex gap-2 items-start">
                      <div className="pt-7">{handle}</div>
                      <div className="flex-1">
                        <Area label={`Đoạn ${i + 1}`} rows={4} value={it.text} onChange={(v) => set((c) => { c.about.paragraphs[i] = v })} />
                      </div>
                      <div className="pt-7"><DeleteBtn onClick={() => set((c) => { c.about.paragraphs.splice(i, 1) })} /></div>
                    </div>
                  )}
                </SortableList>
                <Button variant="outline" size="sm" onClick={() => set((c) => { c.about.paragraphs.push('Nội dung mới...') })}><Plus className="size-4" /> Thêm đoạn</Button>
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'tags', label: 'Thẻ tổ chức', icon: <Tags />, content: (
            <Card>
              <CardHeader><CardTitle>Thẻ tổ chức (tags)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <SortableList items={a.tags.map((text, i) => ({ id: String(i), text }))} onChange={(list) => set((c) => { c.about.tags = list.map((x) => x.text) })} className="space-y-2">
                  {(it, i, handle) => (
                    <div className="flex items-center gap-2">
                      {handle}
                      <Input value={it.text} onChange={(e) => set((c) => { c.about.tags[i] = e.target.value })} />
                      <DeleteBtn onClick={() => set((c) => { c.about.tags.splice(i, 1) })} />
                    </div>
                  )}
                </SortableList>
                <Button variant="outline" size="sm" onClick={() => set((c) => { c.about.tags.push('Tổ chức mới') })}><Plus className="size-4" /> Thêm thẻ</Button>
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'credentials', label: 'Bằng cấp', icon: <GraduationCap />, content: (
            <Card>
              <CardHeader><CardTitle>Bằng cấp &amp; chứng chỉ</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <SortableList items={a.credentials} onChange={(list) => set((c) => { c.about.credentials = list })}>
                  {(cr, i, handle) => (
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">{handle}<span className="text-sm font-semibold text-muted-foreground">Mục #{i + 1}</span></div>
                        <DeleteBtn onClick={() => set((c) => { c.about.credentials.splice(i, 1) })} />
                      </div>
                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-[200px_1fr] gap-3">
                          <IconPicker value={cr.icon} onChange={(v) => set((c) => { c.about.credentials[i].icon = v })} />
                          <Field label="Tiêu đề" value={cr.title} onChange={(v) => set((c) => { c.about.credentials[i].title = v })} />
                        </div>
                        <Field label="Mô tả" value={cr.sub} onChange={(v) => set((c) => { c.about.credentials[i].sub = v })} />
                      </div>
                    </div>
                  )}
                </SortableList>
                <Button variant="outline" size="sm" onClick={() => set((c) => { c.about.credentials.push({ id: newId(), icon: 'award', title: 'Bằng cấp mới', sub: 'Mô tả' }) })}><Plus className="size-4" /> Thêm mục</Button>
              </CardContent>
            </Card>
          ),
        },
        {
          key: 'quote', label: 'Trích dẫn', icon: <Quote />, content: (
            <Card>
              <CardHeader><CardTitle>Trích dẫn</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Area label="Nội dung trích dẫn" value={a.quote} onChange={(v) => set((c) => { c.about.quote = v })} />
                <Field label="Nguồn / ghi chú" value={a.quoteCite} onChange={(v) => set((c) => { c.about.quoteCite = v })} />
              </CardContent>
            </Card>
          ),
        },
      ]} />
    </div>
  )
}
