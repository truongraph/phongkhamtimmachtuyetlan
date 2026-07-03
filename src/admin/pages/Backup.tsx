import { useRef, useState, useEffect } from 'react'
import { useContent, DEFAULT_CONTENT, type SiteContent } from '@/store/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { PageHead, Field } from '../parts'
import { isBackend, fetchBookingEmail, saveBookingEmail, sendTestBookingEmail, DEFAULT_EMAIL_CFG, type BookingEmailCfg } from '@/lib/backend'
import { toast } from 'sonner'
import { RotateCcw, Download, Upload, Trash2, Mail, Send, Loader2, Check } from 'lucide-react'

function LabeledInput({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

/** Cấu hình nhận đặt lịch qua Gmail SMTP (giống WP Mail SMTP) — lưu riêng, an toàn trên Supabase. */
function SmtpEmailCard() {
  const clinicName = useContent((s) => s.content.info.clinicName)
  const theme = useContent((s) => s.content.theme)
  const [cfg, setCfg] = useState<BookingEmailCfg>(DEFAULT_EMAIL_CFG)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const upd = (p: Partial<BookingEmailCfg>) => setCfg((s) => ({ ...s, ...p }))

  useEffect(() => {
    if (!isBackend) return
    fetchBookingEmail().then((c) => { if (c) setCfg(c) })
  }, [])

  async function save() {
    setSaving(true)
    const r = await saveBookingEmail(cfg)
    setSaving(false)
    if (r.ok) toast.success('Đã lưu cấu hình email')
    else toast.error(r.msg || 'Lưu thất bại')
    return r.ok
  }
  async function test() {
    setTesting(true)
    const ok = await save() // lưu trước để máy chủ đọc đúng cấu hình mới nhất
    if (!ok) { setTesting(false); return }
    const r = await sendTestBookingEmail(clinicName, theme.primary, theme.accent)
    setTesting(false)
    if (r.ok) toast.success(`Đã gửi email thử tới ${cfg.mail_to || cfg.smtp_user}`)
    else toast.error(r.msg || 'Gửi thử thất bại')
  }

  if (!isBackend) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="size-5 text-primary" /> Nhận đặt lịch qua Gmail (SMTP)</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-800 p-4 text-sm">
            Cấu hình SMTP cần <b>chế độ online (Supabase)</b>. Hãy điền Supabase vào <b>.env</b> để bật. Khi chưa có, bạn vẫn có thể dùng <b>Web3Forms</b> ở khung bên dưới.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="size-5 text-primary" /> Nhận đặt lịch qua Gmail (SMTP)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5">
          <div>
            <div className="font-medium text-sm">Bật gửi email khi có đặt lịch</div>
            <div className="text-xs text-muted-foreground">Mỗi khi khách đặt lịch, hệ thống tự gửi email báo cho bạn.</div>
          </div>
          <Switch checked={cfg.enabled} onCheckedChange={(v) => upd({ enabled: v })} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <LabeledInput label="Gmail dùng để gửi" value={cfg.smtp_user} onChange={(v) => upd({ smtp_user: v })} placeholder="ban@gmail.com" />
          <LabeledInput label="Mật khẩu ứng dụng (App Password)" type="password" value={cfg.smtp_pass} onChange={(v) => upd({ smtp_pass: v })} placeholder="16 ký tự — không phải mật khẩu Gmail" />
          <LabeledInput label="Email nhận thông báo" value={cfg.mail_to} onChange={(v) => upd({ mail_to: v })} placeholder="mặc định = Gmail ở trên" />
          <LabeledInput label="Tên hiển thị người gửi" value={cfg.mail_from} onChange={(v) => upd({ mail_from: v })} placeholder={clinicName} />
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground select-none">Nâng cao (máy chủ SMTP)</summary>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <LabeledInput label="SMTP host" value={cfg.smtp_host} onChange={(v) => upd({ smtp_host: v })} placeholder="smtp.gmail.com" />
            <LabeledInput label="Cổng (port)" value={String(cfg.smtp_port)} onChange={(v) => upd({ smtp_port: Number(v) || 465 })} placeholder="465" />
          </div>
        </details>

        <div className="rounded-lg bg-secondary p-3.5 text-[.82rem] text-muted-foreground leading-relaxed">
          <b className="text-foreground">Cách lấy App Password Gmail:</b> bật <b>Xác minh 2 bước</b> cho tài khoản Gmail → vào <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-primary underline">myaccount.google.com/apppasswords</a> → tạo “Mật khẩu ứng dụng” (16 ký tự) → dán vào ô trên. <b>Đừng</b> dùng mật khẩu đăng nhập Gmail thường.
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={save} disabled={saving || testing}>{saving ? <><Loader2 className="size-4 animate-spin" /> Đang lưu…</> : <><Check className="size-4" /> Lưu cấu hình</>}</Button>
          <Button variant="outline" onClick={test} disabled={saving || testing || !cfg.smtp_user || !cfg.smtp_pass}>{testing ? <><Loader2 className="size-4 animate-spin" /> Đang gửi…</> : <><Send className="size-4" /> Gửi thử</>}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

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

      <SmtpEmailCard />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="size-5 text-muted-foreground" /> Cách khác — Web3Forms (không cần máy chủ)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Không muốn dùng SMTP? Tạo Access Key miễn phí tại <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="text-primary font-medium underline">web3forms.com</a> rồi dán vào đây. Bỏ trống nếu chỉ xem trong mục “Đặt lịch”.</p>
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
