import { useRef } from 'react'
import { useContent, DEFAULT_CONTENT, type SiteContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { PageHead, Field } from '../parts'
import { toast } from 'sonner'
import { RotateCcw, Download, Upload, Trash2, Mail } from 'lucide-react'

export function Backup() {
  const c = useContent((s) => s.content)
  const set = useContent((s) => s.set)
  const reset = useContent((s) => s.reset)
  const replace = useContent((s) => s.replace)
  const fileRef = useRef<HTMLInputElement>(null)

  function exportJson() {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `noi-dung-website-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as SiteContent
        replace({ ...DEFAULT_CONTENT, ...data })
        toast.success('Đã nhập nội dung từ tệp')
      } catch { toast.error('Tệp không hợp lệ') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Sao lưu & Email" desc="Cấu hình nhận đặt lịch qua email, sao lưu và khôi phục dữ liệu." />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="size-5 text-primary" /> Nhận đặt lịch qua email (tuỳ chọn)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Để nhận yêu cầu đặt lịch qua email trên mọi thiết bị: tạo Access Key miễn phí tại <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="text-primary font-medium underline">web3forms.com</a> rồi dán vào đây. Bỏ trống nếu chỉ xem trong mục “Đặt lịch”.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email nhận thông báo" value={c.booking.notifyEmail} onChange={(v) => set((d) => { d.booking.notifyEmail = v })} placeholder="ban@example.com" />
            <Field label="Web3Forms Access Key" value={c.booking.web3formsKey} onChange={(v) => set((d) => { d.booking.web3formsKey = v })} placeholder="dán key…" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sao lưu &amp; khôi phục dữ liệu</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={exportJson}><Download className="size-4" /> Xuất nội dung (JSON)</Button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJson} />
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Nhập nội dung</Button>
          <span className="text-sm text-muted-foreground">Dùng để sao lưu hoặc chuyển nội dung sang trình duyệt/máy khác.</span>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div><div className="font-semibold">Khôi phục mặc định</div><div className="text-sm text-muted-foreground">Đưa toàn bộ nội dung về bản gốc ban đầu.</div></div>
          <ConfirmDialog
            title="Khôi phục nội dung về mặc định?"
            desc="Toàn bộ nội dung sẽ trở về bản gốc ban đầu. Hành động này không thể hoàn tác."
            confirmText="Khôi phục" destructive
            onConfirm={() => { reset(); toast.success('Đã khôi phục mặc định') }}
            trigger={<Button variant="outline" className="text-destructive border-destructive/40 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/60"><RotateCcw className="size-4" /> Khôi phục</Button>}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div><div className="font-semibold">Xoá dữ liệu trên trình duyệt này</div><div className="text-sm text-muted-foreground">Xoá nội dung, đặt lịch cục bộ &amp; phiên đăng nhập lưu trong trình duyệt rồi tải lại từ đầu. Đăng nhập lại sẽ tự cấu hình. <b>Dữ liệu online (Supabase) không bị xoá.</b></div></div>
          <ConfirmDialog
            title="Xoá dữ liệu trên trình duyệt này?"
            desc="Xoá nội dung, đặt lịch cục bộ & phiên đăng nhập rồi tải lại từ đầu. Dữ liệu online (Supabase) không bị xoá."
            confirmText="Xoá & tải lại" destructive
            onConfirm={() => {
              Object.keys(localStorage).filter((k) => k.startsWith('tl_')).forEach((k) => localStorage.removeItem(k))
              location.reload()
            }}
            trigger={<Button variant="outline" className="text-destructive border-destructive/40 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/60"><Trash2 className="size-4" /> Xoá &amp; tải lại</Button>}
          />
        </CardContent>
      </Card>
    </div>
  )
}
