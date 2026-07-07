import { createContext, useContext, useRef, useState } from 'react'
import { useContent } from '@/store/content'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, ImageOff, Check } from 'lucide-react'

/** Đọc nhiều tệp ảnh → data URL. */
export function filesToItems(files: File[]): Promise<{ name: string; url: string }[]> {
  return Promise.all(files.map((f) => new Promise<{ name: string; url: string }>((res) => {
    const r = new FileReader(); r.onload = () => res({ name: f.name, url: String(r.result) }); r.readAsDataURL(f)
  })))
}

/** Mở hộp chọn tệp nhiều ảnh. */
export function pickFiles(onFiles: (files: File[]) => void) {
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.multiple = true
  input.onchange = () => { const files = Array.from(input.files || []); if (files.length) onFiles(files) }
  input.click()
}

/** Hook thao tác thư viện media (thêm/xóa) — dùng chung cho picker & trang quản lý. */
export function useMediaLib() {
  const media = useContent((s) => s.content.media)
  const setLayout = useContent((s) => s.setLayout)
  const newId = useContent((s) => s.newId)
  const add = (items: { name: string; url: string }[]) => setLayout((c) => {
    items.forEach((it) => c.media.unshift({ id: newId(), name: it.name, url: it.url, ts: new Date().toISOString() }))
  })
  const remove = (id: string) => setLayout((c) => { c.media = c.media.filter((m) => m.id !== id) })
  const upload = (after?: (urls: string[]) => void) => pickFiles((files) => filesToItems(files).then((items) => { add(items); after?.(items.map((i) => i.url)) }))
  return { media, add, remove, upload }
}

// Cung cấp hàm mở hộp chọn ảnh cho toàn admin.
const MediaCtx = createContext<(cb: (url: string) => void) => void>(() => {})
/** Gọi `const openMedia = useMedia(); openMedia(url => …)` để chọn ảnh từ thư viện ở bất kỳ đâu trong admin. */
export const useMedia = () => useContext(MediaCtx)
/** Bọc quanh khu admin: cấp context + render sẵn 1 hộp chọn ảnh dùng chung. */
export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const cbRef = useRef<(url: string) => void>(() => {})
  const openMedia = (cb: (url: string) => void) => { cbRef.current = cb; setOpen(true) }
  return <MediaCtx.Provider value={openMedia}>{children}<MediaPicker open={open} onOpenChange={setOpen} onPick={(url) => cbRef.current(url)} /></MediaCtx.Provider>
}

/** Hộp chọn ảnh từ THƯ VIỆN MEDIA (hoặc tải ảnh mới). */
export function MediaPicker({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (url: string) => void }) {
  const { media, remove, upload } = useMediaLib()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <DialogTitle>Thư viện Media</DialogTitle>
            <DialogDescription>Bấm một ảnh để chọn, hoặc tải ảnh mới lên.</DialogDescription>
          </div>
          <Button size="sm" onClick={() => upload((urls) => { if (urls[0]) { onPick(urls[0]); onOpenChange(false) } })}><Upload className="size-4" /> Tải ảnh lên</Button>
        </div>
        {media.length === 0 ? (
          <div className="rounded-xl border border-dashed py-14 text-center text-sm text-muted-foreground"><ImageOff className="size-8 mx-auto mb-2 opacity-50" /> Chưa có ảnh nào — bấm “Tải ảnh lên”.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {media.map((m) => (
              <button key={m.id} type="button" onClick={() => { onPick(m.url); onOpenChange(false) }}
                className="group relative aspect-square rounded-lg border overflow-hidden hover:ring-2 hover:ring-primary transition-shadow">
                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 grid place-items-center transition-colors"><Check className="size-6 text-white opacity-0 group-hover:opacity-100 drop-shadow" /></span>
                <button type="button" onClick={(e) => { e.stopPropagation(); remove(m.id) }} title="Xóa" className="absolute top-1 right-1 grid size-6 place-items-center rounded bg-black/55 text-white opacity-0 group-hover:opacity-100"><Trash2 className="size-3.5" /></button>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
