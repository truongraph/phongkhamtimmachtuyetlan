import { PageHead } from '../parts'
import { useMediaLib } from '../media/MediaPicker'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { Upload, Trash2, Image as ImageIcon, Copy } from 'lucide-react'
import { toast } from 'sonner'

/** Trang THƯ VIỆN MEDIA — quản lý ảnh dùng chung. */
export function Media() {
  const { media, remove, upload } = useMediaLib()
  const copy = (url: string) => { navigator.clipboard?.writeText(url).then(() => toast.success('Đã copy liên kết ảnh')) }

  return (
    <div>
      <PageHead title="Thư viện Media" desc="Tải ảnh lên một lần, dùng lại ở nhiều nơi (ảnh bìa bài viết, khối ảnh…). Bấm nút chọn ảnh ở trình soạn để lấy lại từ đây." />

      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold"><ImageIcon className="size-4" /> {media.length} ảnh</span>
        <Button onClick={() => upload(() => toast.success('Đã tải ảnh lên thư viện'))}><Upload className="size-4" /> Tải ảnh lên</Button>
      </div>

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <ImageIcon className="size-9 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">Chưa có ảnh nào trong thư viện.</p>
          <Button className="mt-4" onClick={() => upload(() => toast.success('Đã tải ảnh lên thư viện'))}><Upload className="size-4" /> Tải ảnh đầu tiên</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {media.map((m) => (
            <div key={m.id} className="group rounded-xl border bg-card overflow-hidden">
              <div className="aspect-square bg-muted/40 overflow-hidden"><img src={m.url} alt={m.name} className="w-full h-full object-cover" /></div>
              <div className="flex items-center gap-1 p-2">
                <span className="flex-1 min-w-0 text-[.72rem] text-muted-foreground truncate" title={m.name}>{m.name || 'ảnh'}</span>
                <button onClick={() => copy(m.url)} title="Copy liên kết" className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"><Copy className="size-3.5" /></button>
                <ConfirmDialog title="Xóa ảnh này?" desc="Ảnh sẽ bị gỡ khỏi thư viện (các nơi đang dùng ảnh này sẽ mất ảnh)." confirmText="Xóa" destructive onConfirm={() => remove(m.id)}
                  trigger={<button className="grid size-7 place-items-center rounded text-destructive hover:bg-destructive/10"><Trash2 className="size-3.5" /></button>} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
