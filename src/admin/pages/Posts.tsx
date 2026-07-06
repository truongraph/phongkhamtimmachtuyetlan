import { useState } from 'react'
import { useContent, newPost, slugify, type Post } from '@/store/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PageHead } from '../parts'
import { GutenbergEditor } from '../posts/PostGutenberg'
import { Plus, Newspaper, SquarePen, Trash2, ExternalLink, CalendarDays, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

function fmtDate(d: string) { try { return new Date(d).toLocaleDateString('vi-VN') } catch { return d } }

/** Quản lý BÀI VIẾT / TIN TỨC (sửa bằng trình soạn Gutenberg). */
export function Posts() {
  const posts = useContent((s) => s.content.posts)
  const blog = useContent((s) => s.content.blog)
  const setLayout = useContent((s) => s.setLayout)
  const [openId, setOpenId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const editBlog = (fn: (b: typeof blog) => void) => setLayout((c) => fn(c.blog))
  const delPost = (id: string) => { setLayout((c) => { c.posts = c.posts.filter((p) => p.id !== id) }); toast.success('Đã xóa bài viết') }
  const addPost = () => {
    const title = newTitle.trim() || 'Bài viết mới'
    const nid = useContent.getState().newId
    const taken = new Set(posts.map((p) => p.slug))
    let slug = slugify(title); let k = 2
    while (taken.has(slug)) slug = `${slugify(title)}-${k++}`
    let id = ''
    setLayout((c) => { const p: Post = newPost(nid, title, slug); id = p.id; c.posts.unshift(p) })
    setNewTitle(''); setAddOpen(false); setOpenId(id)
  }

  // Đang mở 1 bài → trình soạn Gutenberg toàn màn hình.
  if (openId && posts.some((p) => p.id === openId)) {
    return <GutenbergEditor kind="post" id={openId} onClose={() => setOpenId(null)} onDelete={() => delPost(openId)} />
  }

  return (
    <div>
      <PageHead title="Bài viết / Tin tức" desc="Viết bài kiến thức sức khỏe & tin tức phòng khám bằng trình soạn khối trực quan." />

      <div className="rounded-xl border bg-card p-4 mb-5 grid sm:grid-cols-3 gap-4">
        <div><label className="text-[.72rem] font-semibold text-muted-foreground mb-1 block">Tiêu đề trang tin</label><Input value={blog.title} onChange={(e) => editBlog((b) => { b.title = e.target.value })} /></div>
        <div><label className="text-[.72rem] font-semibold text-muted-foreground mb-1 block">Đường dẫn</label><div className="flex items-center gap-1.5"><span className="text-muted-foreground text-sm">/</span><Input value={blog.slug} onChange={(e) => editBlog((b) => { b.slug = slugify(e.target.value) })} /></div></div>
        <div><label className="text-[.72rem] font-semibold text-muted-foreground mb-1 block">Giới thiệu ngắn</label><Input value={blog.intro} onChange={(e) => editBlog((b) => { b.intro = e.target.value })} /></div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold"><Newspaper className="size-4" /> {posts.length} bài viết</span>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm"><a href={`/${blog.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Xem trang tin</a></Button>
          <Button onClick={() => { setNewTitle(''); setAddOpen(true) }}><Plus className="size-4" /> Viết bài</Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center"><Newspaper className="size-8 mx-auto text-muted-foreground/50 mb-3" /><p className="text-sm text-muted-foreground">Chưa có bài viết nào.</p><Button className="mt-4" onClick={() => setAddOpen(true)}><Plus className="size-4" /> Viết bài đầu tiên</Button></div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border bg-card p-3 hover:border-primary/40 transition-colors">
              {p.cover ? <img src={p.cover} alt="" className="size-16 rounded-lg object-cover border shrink-0" /> : <span className="size-16 rounded-lg grid place-items-center bg-primary/10 text-primary shrink-0"><Newspaper className="size-6" /></span>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><h3 className="font-semibold truncate">{p.title || '(Chưa đặt tiêu đề)'}</h3>{p.published ? <span className="text-[.6rem] font-bold text-emerald-600 bg-emerald-500/10 rounded-full px-1.5 py-0.5 shrink-0 inline-flex items-center gap-1"><Eye className="size-3" /> Đăng</span> : <span className="text-[.6rem] font-bold text-amber-600 bg-amber-500/10 rounded-full px-1.5 py-0.5 shrink-0 inline-flex items-center gap-1"><EyeOff className="size-3" /> Nháp</span>}</div>
                <div className="text-[.72rem] text-muted-foreground mt-0.5 flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {fmtDate(p.date)} · /{blog.slug}/{p.slug}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setOpenId(p.id)}><SquarePen className="size-3.5" /> Sửa</Button>
              <ConfirmDialog title={`Xóa bài “${p.title}”?`} desc="Bài viết sẽ bị xóa vĩnh viễn." confirmText="Xóa bài" destructive onConfirm={() => delPost(p.id)} trigger={<Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></Button>} />
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Viết bài mới</DialogTitle>
          <DialogDescription>Đặt tiêu đề bài. Đường dẫn tự tạo từ tiêu đề (sửa được sau).</DialogDescription>
          <Input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Vd: 5 dấu hiệu cảnh báo bệnh tim…" onKeyDown={(e) => { if (e.key === 'Enter') addPost() }} />
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAddOpen(false)}>Hủy</Button><Button onClick={addPost}><Plus className="size-4" /> Tạo & soạn</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
