import { Link } from 'react-router-dom'
import { useContent } from '@/store/content'
import { useBookings } from '@/store/bookings'
import { getTemplate } from '@/site/templates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Blocks, Stethoscope, GraduationCap, Settings, Home, User, ExternalLink, CalendarClock,
  Phone, LayoutTemplate, HeartPulse, ShieldCheck, ArrowRight, Palette,
} from 'lucide-react'

export function Dashboard() {
  const c = useContent((s) => s.content)
  const bookings = useBookings((s) => s.items)
  const newCount = bookings.filter((b) => b.status === 'new').length
  const tpl = getTemplate(c.template)

  const stats = [
    { label: 'Đặt lịch mới', value: newCount, icon: CalendarClock, to: '/admin/bookings', tone: 'text-rose-600 bg-rose-50 dark:text-rose-300 dark:bg-rose-500/15' },
    { label: 'Dịch vụ', value: c.services.length, icon: Stethoscope, to: '/admin/services', tone: 'text-sky-600 bg-sky-50 dark:text-sky-300 dark:bg-sky-500/15' },
    { label: 'Chuyên môn', value: c.specialties.length, icon: HeartPulse, to: '/admin/specialties', tone: 'text-violet-600 bg-violet-50 dark:text-violet-300 dark:bg-violet-500/15' },
    { label: 'Phần đang hiện', value: c.sections.filter((s) => s.visible).length + 1, icon: Blocks, to: '/admin/layout', tone: 'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/15' },
  ]
  const quick = [
    { to: '/admin/layout', icon: Blocks, label: 'Bố cục & Xem trước', desc: 'Kéo–thả, ẩn/hiện, xem trực tiếp' },
    { to: '/admin/themes', icon: LayoutTemplate, label: 'Kho giao diện', desc: '20 mẫu, đổi 1 chạm' },
    { to: '/admin/hero', icon: Home, label: 'Trang chủ', desc: 'Tiêu đề & form đặt lịch' },
    { to: '/admin/services', icon: Stethoscope, label: 'Dịch vụ', desc: 'Thêm/sửa/xoá dịch vụ' },
    { to: '/admin/about', icon: User, label: 'Giới thiệu bác sĩ', desc: 'Tiểu sử, thành tựu' },
    { to: '/admin/settings', icon: Settings, label: 'Cài đặt chung', desc: 'Màu, phông, logo, liên hệ' },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/75 text-primary-foreground p-6 sm:p-7">
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
        <div className="absolute -right-6 bottom-0 opacity-15"><HeartPulse className="size-40" /></div>
        <div className="relative">
          <div className="text-sm/relaxed text-primary-foreground/80">Bảng quản trị website</div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">{c.info.clinicName}</h1>
          <p className="text-primary-foreground/85 mt-1 max-w-xl">Quản lý nội dung, giao diện và lịch hẹn. Mọi thay đổi áp dụng ngay.</p>
          <div className="flex flex-wrap gap-2.5 mt-4">
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white text-primary px-4 py-2 text-sm font-semibold hover:bg-white/90"><ExternalLink className="size-4" /> Xem website</a>
            <Link to="/admin/themes" className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"><Palette className="size-4" /> Đổi giao diện</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group">
            <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <span className={`grid place-items-center size-12 rounded-xl shrink-0 ${s.tone}`}><s.icon className="size-6" /></span>
                <div>
                  <div className="text-3xl font-bold leading-none tabular-nums">{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1.5">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent bookings + current design */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold flex items-center gap-2"><CalendarClock className="size-4 text-primary" /> Đặt lịch gần đây</div>
              <Link to="/admin/bookings" className="text-sm text-primary hover:underline inline-flex items-center gap-1">Tất cả <ArrowRight className="size-3.5" /></Link>
            </div>
            {bookings.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <CalendarClock className="size-8 mx-auto mb-2 opacity-40" />
                Chưa có yêu cầu đặt lịch nào.
              </div>
            ) : (
              <div className="divide-y -mb-1">
                {bookings.slice(0, 6).map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3 text-sm gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid place-items-center size-9 rounded-full bg-secondary text-primary font-semibold shrink-0">{b.name.charAt(0).toUpperCase()}</span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{b.name}</div>
                        <div className="text-muted-foreground text-xs flex items-center gap-1.5">
                          <Phone className="size-3" /> {b.phone}<span className="truncate hidden sm:inline">· {b.service}</span>
                        </div>
                      </div>
                    </div>
                    {b.status === 'new' ? <Badge className="bg-amber-500">Mới</Badge> : b.status === 'accepted' ? <Badge>Đã tiếp nhận</Badge> : <Badge variant="success">Hoàn tất</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="font-semibold flex items-center gap-2 mb-3"><LayoutTemplate className="size-4 text-primary" /> Giao diện đang dùng</div>
            <div className="rounded-xl border p-4">
              <div className="font-semibold">{tpl.name}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{tpl.desc}</p>
              <div className="flex gap-1.5 mt-3">
                {[tpl.theme.primary, tpl.theme.navy, tpl.theme.accent].map((col, i) => (
                  <span key={i} className="size-6 rounded-md ring-1 ring-black/5" style={{ background: col }} />
                ))}
              </div>
            </div>
            <Link to="/admin/themes" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">Chọn mẫu khác <ArrowRight className="size-3.5" /></Link>
            <div className="mt-4 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              Sao lưu nội dung định kỳ trong <Link to="/admin/settings" className="text-primary font-medium">Cài đặt</Link> để an toàn.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <div className="text-sm font-semibold text-muted-foreground mb-3">Thao tác nhanh</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quick.map((q) => (
            <Link key={q.to} to={q.to} className="group">
              <Card className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all">
                <CardContent className="p-5 flex items-center gap-4">
                  <span className="grid place-items-center size-11 rounded-xl bg-secondary text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><q.icon className="size-5" /></span>
                  <div className="flex-1"><div className="font-semibold">{q.label}</div><div className="text-sm text-muted-foreground">{q.desc}</div></div>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
