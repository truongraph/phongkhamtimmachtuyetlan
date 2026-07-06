import { useState } from 'react'
import { useContent, newPage, slugify, type PageDef } from '@/store/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PageHead } from '../parts'
import { GutenbergEditor } from '../posts/PostGutenberg'
import { Plus, FileText, SquarePen, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

/** Quản lý TRANG PHỤ (sửa bằng trình soạn Gutenberg) + trình dựng Menu. */
export function Pages() {
  const pages = useContent((s) => s.content.pages)
  const setLayout = useContent((s) => s.setLayout)
  const [openId, setOpenId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const delPage = (id: string) => { setLayout((c) => { c.pages = c.pages.filter((p) => p.id !== id) }); toast.success('Đã xóa trang') }
  const addPage = () => {
    const title = newTitle.trim() || 'Trang mới'
    const nid = useContent.getState().newId
    const taken = new Set(pages.map((p) => p.slug))
    let slug = slugify(title); let k = 2
    while (taken.has(slug)) slug = `${slugify(title)}-${k++}`
    let id = ''
    setLayout((c) => { const p: PageDef = newPage(nid, title, slug); id = p.id; c.pages.push(p) })
    setNewTitle(''); setAddOpen(false); setOpenId(id)
  }

  // Đang mở 1 trang → trình soạn Gutenberg toàn màn hình.
  if (openId && pages.some((p) => p.id === openId)) {
    return <GutenbergEditor kind="page" id={openId} onClose={() => setOpenId(null)} onDelete={() => delPage(openId)} />
  }

  return (
    <div>
      <PageHead title="Trang" desc="Tạo các trang phụ (Giới thiệu, Dịch vụ, Tuyển dụng…) và soạn nội dung bằng trình khối trực quan. Sắp menu điều hướng trong mục Menu." />

      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold"><FileText className="size-4" /> {pages.length} trang phụ</span>
        <Button onClick={() => { setNewTitle(''); setAddOpen(true) }}><Plus className="size-4" /> Thêm trang</Button>
      </div>

      <div className="rounded-xl border bg-muted/30 p-4 mb-4 flex items-center gap-3">
        <span className="grid place-items-center size-10 rounded-lg bg-primary text-primary-foreground shrink-0"><FileText className="size-5" /></span>
        <div className="flex-1 min-w-0"><div className="font-semibold text-sm">Trang chủ</div><div className="text-[.72rem] text-muted-foreground">/ · Sửa trong “Tùy chỉnh giao diện”</div></div>
        <Button asChild variant="outline" size="sm"><a href="/" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Xem</a></Button>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center">
          <FileText className="size-8 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">Chưa có trang phụ nào.</p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}><Plus className="size-4" /> Tạo trang đầu tiên</Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pages.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-4 flex items-center gap-3 hover:border-primary/40 transition-colors">
              <span className="grid place-items-center size-10 rounded-lg bg-primary/10 text-primary shrink-0"><FileText className="size-5" /></span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{p.title || '(Chưa đặt tên)'}</div>
                <div className="text-[.72rem] text-muted-foreground truncate">/{p.slug}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setOpenId(p.id)}><SquarePen className="size-3.5" /> Soạn</Button>
              <ConfirmDialog title={`Xóa trang “${p.title}”?`} desc="Toàn bộ nội dung trang sẽ bị xóa." confirmText="Xóa trang" destructive onConfirm={() => delPage(p.id)}
                trigger={<Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></Button>} />
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Thêm trang mới</DialogTitle>
          <DialogDescription>Đặt tên trang. Đường dẫn sẽ tự tạo từ tên (có thể sửa sau).</DialogDescription>
          <Input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Vd: Giới thiệu, Dịch vụ…" onKeyDown={(e) => { if (e.key === 'Enter') addPage() }} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Hủy</Button>
            <Button onClick={addPage}><Plus className="size-4" /> Tạo & soạn</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
