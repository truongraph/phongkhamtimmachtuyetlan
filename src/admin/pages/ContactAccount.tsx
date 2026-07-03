import { useState } from 'react'
import { useContent } from '@/store/content'
import { useAuth } from '@/store/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHead, Field, Area } from '../parts'
import { isBackend } from '@/lib/backend'
import { toast } from 'sonner'

export function ContactEditor() {
  const c = useContent((s) => s.content)
  const set = useContent((s) => s.set)
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHead title="Liên hệ" desc="Mô tả khu vực liên hệ. Số điện thoại, địa chỉ và giờ làm việc chỉnh trong Cài đặt chung." />
      <Card>
        <CardHeader><CardTitle>Nội dung</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Nhãn nhỏ" value={c.contactEyebrow} onChange={(v) => set((d) => { d.contactEyebrow = v })} />
            <Field label="Tiêu đề" value={c.contactTitle} onChange={(v) => set((d) => { d.contactTitle = v })} />
            <Field label="Từ nhấn (đỏ)" value={c.contactTitleHighlight} onChange={(v) => set((d) => { d.contactTitleHighlight = v })} />
          </div>
          <Area label="Mô tả ngắn khu vực liên hệ" value={c.contactLead} onChange={(v) => set((d) => { d.contactLead = v })} />
          <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
            Bản đồ tự động lấy theo địa chỉ: <b className="text-foreground">{c.info.address} {c.info.addressNote}</b>. Đổi địa chỉ trong <b>Cài đặt chung</b>.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function Account() {
  const { username, changeCredentials } = useAuth()
  const [u, setU] = useState(username)
  const [cur, setCur] = useState('')
  const [np, setNp] = useState('')
  const [np2, setNp2] = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (np !== np2) { toast.error('Mật khẩu mới không khớp.'); return }
    const r = await changeCredentials(u, cur, np)
    if (r.ok) { toast.success(r.msg); setCur(''); setNp(''); setNp2('') }
    else toast.error(r.msg)
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <PageHead title="Tài khoản" desc="Đổi tên đăng nhập và mật khẩu quản trị." />
      <Card>
        <CardHeader><CardTitle>Thông tin đăng nhập</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5"><Label>Tên đăng nhập</Label><Input value={u} onChange={(e) => setU(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Mật khẩu hiện tại</Label><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="••••••••" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Mật khẩu mới</Label><Input type="password" value={np} onChange={(e) => setNp(e.target.value)} placeholder="Tối thiểu 6 ký tự" /></div>
              <div className="space-y-1.5"><Label>Nhập lại mật khẩu mới</Label><Input type="password" value={np2} onChange={(e) => setNp2(e.target.value)} /></div>
            </div>
            <Button type="submit">Cập nhật tài khoản</Button>
          </form>
        </CardContent>
      </Card>
      <div className={`rounded-lg border p-4 text-sm ${isBackend ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'}`}>
        {isBackend
          ? <><b>Đang chạy online (Supabase):</b> đăng nhập bằng Supabase Auth, đổi mật khẩu được lưu an toàn phía máy chủ. Trường "mật khẩu hiện tại" không bắt buộc ở chế độ này.</>
          : <><b>Lưu ý bảo mật:</b> đây là xác thực phía trình duyệt (demo). Điền Supabase vào <b>.env</b> để bật đăng nhập máy chủ an toàn.</>}
      </div>
    </div>
  )
}
