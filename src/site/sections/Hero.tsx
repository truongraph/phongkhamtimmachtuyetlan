import { useState, useEffect } from 'react'
import { useContent } from '@/store/content'
import { useTemplate, useSkin, type ImageShape } from '../templates'
import { useBookings, sendBookingEmail } from '@/store/bookings'
import { sendBookingEmailEdge } from '@/lib/backend'
import { Icon } from '@/lib/icons'
import { Phone, Check, CalendarCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'
import { formatVnPhone, phoneDigits } from '@/lib/format'

function imageRadius(shape: ImageShape): string {
  switch (shape) {
    case 'arch': return '200px 200px 22px 22px'
    case 'circle': return '999px'
    case 'square': return '10px'
    default: return '24px'
  }
}

const DECOR = ['blobs', 'grid', 'rings', 'mesh'] as const
function decorKind(id: string): (typeof DECOR)[number] {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return DECOR[h % DECOR.length]
}

/** Lớp nền trang trí phía sau hero — mỗi mẫu một kiểu để trông sinh động, khác biệt. */
function HeroDecor() {
  const tpl = useTemplate()
  const k = decorKind(tpl.id)
  const mask = { WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 72%)', maskImage: 'linear-gradient(to bottom, black, transparent 72%)' } as React.CSSProperties
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {k === 'blobs' && <>
        <div className="absolute -right-40 -top-28 size-[520px] rounded-full" style={{ background: 'radial-gradient(circle,var(--tl-soft),transparent 66%)' }} />
        <div className="absolute -left-32 -bottom-32 size-[440px] rounded-full" style={{ background: 'radial-gradient(circle,color-mix(in srgb,var(--tl-accent) 20%,transparent),transparent 66%)' }} />
      </>}
      {k === 'grid' && <>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--tl-soft) 1.6px, transparent 0)', backgroundSize: '26px 26px', opacity: .7, ...mask }} />
        <div className="absolute -right-40 -top-28 size-[480px] rounded-full" style={{ background: 'radial-gradient(circle,var(--tl-soft),transparent 66%)' }} />
      </>}
      {k === 'rings' && (
        <div className="absolute -right-56 -top-56 size-[600px] rounded-full" style={{ background: 'repeating-radial-gradient(circle, var(--tl-soft) 0 2px, transparent 2px 48px)', opacity: .5 }} />
      )}
      {k === 'mesh' && <>
        <div className="absolute -right-40 -top-32 size-[520px] rounded-full blur-2xl" style={{ background: 'radial-gradient(circle,var(--tl-soft),transparent 70%)' }} />
        <div className="absolute left-[8%] -bottom-44 size-[520px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle,color-mix(in srgb,var(--tl-primary) 16%,transparent),transparent 70%)' }} />
      </>}
    </div>
  )
}

function DoctorImage({ max = 'max-w-[380px]' }: { max?: string }) {
  const { hero, stats } = useContent((s) => s.published)
  const tpl = useTemplate()
  const isCircle = tpl.image === 'circle'
  const s0 = stats[0]
  return (
    <figure className={`relative justify-self-center w-full ${max}`}>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[104%] h-[82%] -z-0"
        style={{ borderRadius: isCircle ? '999px' : imageRadius(tpl.image), background: 'linear-gradient(160deg,var(--tl-primary),var(--tl-deep))' }} />
      <div className="absolute -right-3 -top-3 size-16 rounded-full opacity-90 -z-0" style={{ background: 'var(--tl-accent)', filter: 'blur(2px)' }} />
      <div className="relative z-[1] overflow-hidden" style={{ borderRadius: imageRadius(tpl.image), filter: 'drop-shadow(0 24px 40px rgba(8,40,72,.28))' }}>
        <img src={hero.doctorPhotoUrl} alt="Bác sĩ" className="w-full object-cover" style={{ aspectRatio: isCircle ? '1/1' : '83/100', objectPosition: 'top center' }} />
      </div>
      {s0 && (
        <div className="absolute z-[2] left-[-14px] bottom-8 bg-white rounded-2xl shadow-xl border px-4 py-3 flex items-center gap-3" style={{ borderColor: 'var(--tl-line)' }}>
          <span className="grid place-items-center size-10 rounded-xl shrink-0" style={{ background: 'var(--tl-soft)', color: 'var(--tl-primary)' }}><Icon name={s0.icon} className="size-5" /></span>
          <div><b className="block site-head font-bold text-[1.2rem] leading-none" style={{ color: 'var(--tl-primary)' }}>{s0.value}</b><span className="text-[.72rem]" style={{ color: 'var(--tl-slate)' }}>{s0.label}</span></div>
        </div>
      )}
    </figure>
  )
}

function HeroText({ center }: { center?: boolean }) {
  const { hero, info } = useContent((s) => s.published)
  const sk = useSkin()
  const tel = info.phone.replace(/\s/g, '')
  return (
    <div className={center ? 'text-center max-w-2xl mx-auto' : ''}>
      <span className={`inline-flex items-center gap-2 bg-white border rounded-full pl-2 pr-4 py-1.5 text-[.65rem] lg:text-[.82rem] font-semibold shadow-sm mb-5`} style={{ borderColor: 'var(--tl-line)', color: 'var(--tl-slate)' }}>
        <span className="size-2 rounded-full animate-pulse" style={{ background: 'var(--tl-accent)' }} />
        {hero.badgePrefix} <b style={{ color: 'var(--tl-navy)' }}>{hero.badgeStrong}</b> {hero.badgeSuffix}
      </span>
      <h1 className="site-head font-bold leading-[1.16] text-[clamp(2.1rem,4.6vw,3.2rem)]" style={{ color: 'var(--tl-ink)' }}>
        {hero.title} <span style={{ color: 'var(--tl-accent)' }}>{hero.titleHighlight}</span>
      </h1>
      <p className={`mt-4 text-[1.1rem] ${center ? 'mx-auto' : ''} max-w-[46ch]`} style={{ color: 'var(--tl-slate)' }}>{hero.subtitle}</p>
      <ul className={`mt-6 grid gap-3 ${center ? 'max-w-lg mx-auto text-left' : ''}`}>
        {hero.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="grid place-items-center size-[28px] rounded-full shrink-0 mt-0.5" style={sk.icon(i)}><Check className="size-[16px]" strokeWidth={3} /></span>
            <span style={{ color: 'var(--tl-ink)' }}>{b}</span>
          </li>
        ))}
      </ul>
      <div className={`mt-7 flex flex-wrap gap-3 ${center ? 'justify-center' : ''}`}>
        <a href={`tel:${tel}`} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,.16)]" style={{ background: 'var(--tl-accent)', borderRadius: 'var(--tl-btn)' }}>
          <Phone className="size-[18px]" /> Gọi: {info.phone}
        </a>
        <a href="#dat-lich" className="inline-flex items-center justify-center px-6 py-3.5 font-semibold bg-white border" style={{ borderColor: 'var(--tl-line)', color: 'var(--tl-primary)', borderRadius: 'var(--tl-btn)' }}>Đặt lịch khám</a>
      </div>
    </div>
  )
}

function StatsInline() {
  const stats = useContent((s) => s.published.stats)
  const sk = useSkin()
  return (
    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3">
          <span className={`grid place-items-center size-11 ${sk.iconShape} shrink-0`} style={sk.icon(i)}><Icon name={s.icon} className="size-6" /></span>
          <div><b className="block site-head font-bold text-[1.3rem] leading-none" style={{ color: 'var(--tl-primary)' }}>{s.value}</b><span className="text-[.82rem]" style={{ color: 'var(--tl-slate)' }}>{s.label}</span></div>
        </div>
      ))}
    </div>
  )
}

export function BookingForm() {
  const { hero, info, services, booking } = useContent((s) => s.published)
  const addBooking = useBookings((s) => s.add)
  const tel = info.phone.replace(/\s/g, '')
  const [f, setF] = useState({ name: '', phone: '', service: '', date: '', time: 'Chiều (17:00–20:00)', note: '' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [sending, setSending] = useState(false)
  const upd = (patch: Partial<typeof f>) => setF((s) => ({ ...s, ...patch }))

  // Tự ẩn thông báo sau vài giây (thành công lâu hơn để khách kịp đọc xác nhận).
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), msg.ok ? 8000 : 6000)
    return () => clearTimeout(t)
  }, [msg])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!f.name.trim() || !f.phone.trim()) { setMsg({ ok: false, text: 'Vui lòng nhập họ tên và số điện thoại.' }); return }
    const digits = phoneDigits(f.phone)
    if (digits.length < 9 || digits.length > 11) { setMsg({ ok: false, text: 'Số điện thoại chưa hợp lệ (9–11 chữ số).' }); return }
    setSending(true)
    const payload = { name: f.name.trim(), phone: f.phone.trim(), service: f.service || 'Tư vấn chung', date: f.date, time: f.time, note: f.note.trim() }
    const saved = await addBooking(payload)
    const emailed = await sendBookingEmail(booking, payload)
    sendBookingEmailEdge(payload)
    setSending(false)
    if (saved || emailed) {
      setMsg({ ok: true, text: `Cảm ơn ${payload.name}! Phòng khám đã nhận yêu cầu và sẽ liên hệ số ${payload.phone} để xác nhận lịch hẹn.` })
      setF({ name: '', phone: '', service: '', date: '', time: 'Chiều (17:00–20:00)', note: '' })
    } else {
      setMsg({ ok: false, text: `Xin lỗi, hệ thống chưa gửi được yêu cầu. Vui lòng gọi trực tiếp hotline ${info.phone} để được hỗ trợ ngay.` })
    }
  }

  return (
    <div className="bg-white border overflow-hidden shadow-sm w-full" style={{ borderColor: 'var(--tl-line)', borderRadius: 'calc(var(--tl-radius) + 6px)' }}>
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--tl-line)' }}>
        <span className="grid place-items-center size-11 rounded-xl shrink-0" style={{ background: 'var(--tl-soft)', color: 'var(--tl-primary)' }}><CalendarCheck className="size-[22px]" /></span>
        <div><h3 className="site-head font-bold text-[1.2rem]" style={{ color: 'var(--tl-ink)' }}>{hero.bookingTitle}</h3><p className="text-[.85rem]" style={{ color: 'var(--tl-slate)' }}>{hero.bookingSubtitle}</p></div>
      </div>
      <form className="p-6 space-y-4" onSubmit={submit}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Họ và tên *</Label><Input value={f.name} onChange={(e) => upd({ name: e.target.value })} placeholder="Nguyễn Văn A" /></div>
          <div className="space-y-1.5"><Label>Số điện thoại *</Label><Input type="tel" inputMode="numeric" value={f.phone} onChange={(e) => upd({ phone: formatVnPhone(e.target.value) })} placeholder="090 941 073" /></div>
        </div>
        <div className="space-y-1.5">
          <Label>Dịch vụ</Label>
          <Combobox
            value={f.service}
            onChange={(service) => upd({ service })}
            placeholder="Chọn dịch vụ cần khám"
            searchPlaceholder="Tìm dịch vụ…"
            options={[...services.map((s) => ({ value: s.title, label: s.title })), { value: 'Khác', label: 'Khác / Tư vấn chung' }]}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Ngày mong muốn</Label><DatePicker value={f.date} onChange={(date) => upd({ date })} disablePast placeholder="Chọn ngày khám" /></div>
          <div className="space-y-1.5">
            <Label>Buổi khám</Label>
            <Combobox
              value={f.time}
              onChange={(time) => upd({ time })}
              placeholder="Chọn buổi khám"
              searchPlaceholder="Tìm buổi khám…"
              options={[
                { value: 'Chiều (17:00–20:00)', label: 'Chiều (17:00–20:00)' },
                { value: 'Sáng CN (08:00–11:00)', label: 'Sáng CN (08:00–11:00)' },
                { value: 'Bác sĩ tư vấn giờ phù hợp', label: 'Bác sĩ tư vấn giờ phù hợp' },
              ]}
            />
          </div>
        </div>
        <div className="space-y-1.5"><Label>Ghi chú (triệu chứng, mong muốn…)</Label><Textarea value={f.note} onChange={(e) => upd({ note: e.target.value })} rows={2} placeholder="VD: hay hồi hộp, khó thở khi gắng sức…" /></div>
        <Button type="submit" disabled={sending} className="w-full h-11 text-white" style={{ background: 'var(--tl-primary)', borderRadius: 'var(--tl-btn)' }}>
          {sending ? 'Đang gửi…' : 'Gửi đăng ký khám'}
        </Button>
        {msg && <div className="border px-3.5 py-3 text-[.9rem] font-medium rounded-lg" style={msg.ok ? { background: '#EAF7EE', borderColor: '#B7E3C4', color: '#1B6B3A' } : { background: '#FDECEC', borderColor: '#F5C2C2', color: '#B8151E' }}>{msg.text}</div>}
        <p className="text-center text-[.85rem]" style={{ color: 'var(--tl-slate)' }}>Hoặc gọi ngay <a href={`tel:${tel}`} className="font-bold" style={{ color: 'var(--tl-primary)' }}>{info.phone}</a></p>
      </form>
    </div>
  )
}

export function BookingBand() {
  const { hero } = useContent((s) => s.published)
  return (
    <section id="dat-lich-band" className="py-12 lg:py-16" style={{ background: 'var(--tl-tint)' }}>
      <div className="container grid lg:grid-cols-[1fr_.85fr] gap-8 items-center">
        <div>
          <h2 className="site-head font-bold text-[clamp(1.6rem,3.4vw,2.3rem)]" style={{ color: 'var(--tl-ink)' }}>{hero.bookingTitle} <span style={{ color: 'var(--tl-accent)' }}>ngay hôm nay</span></h2>
          <p className="mt-3 text-[1.05rem] max-w-[48ch]" style={{ color: 'var(--tl-slate)' }}>{hero.bookingSubtitle}. Điền thông tin để bác sĩ liên hệ xác nhận lịch hẹn phù hợp nhất với bạn.</p>
        </div>
        <div className="max-w-[460px] w-full justify-self-center lg:justify-self-end"><BookingForm /></div>
      </div>
    </section>
  )
}

export function Hero() {
  const tpl = useTemplate()
  const v = tpl.hero
  return (
    <section id="dat-lich" className="relative overflow-hidden py-12 sm:py-16 lg:py-20" style={{ background: 'linear-gradient(180deg,var(--tl-tint),#fff)' }}>
      <HeroDecor />
      <div className="container relative">
        {v === 'form' && (
          <div className="grid gap-9 lg:grid-cols-[1.05fr_.95fr] items-center">
            <HeroText />
            <div className="max-w-[460px] w-full justify-self-center lg:justify-self-auto"><BookingForm /></div>
          </div>
        )}
        {v === 'split' && (
          <div className="grid gap-9 lg:grid-cols-[1.05fr_.95fr] items-center">
            <HeroText />
            <DoctorImage />
          </div>
        )}
        {v === 'imageLeft' && (
          <div className="grid gap-9 lg:grid-cols-[.9fr_1.1fr] items-center">
            <div className="order-2 lg:order-1"><DoctorImage /></div>
            <div className="order-1 lg:order-2"><HeroText /></div>
          </div>
        )}
        {v === 'centered' && (
          <div className="flex flex-col items-center">
            <HeroText center />
            <div className="mt-10 w-full max-w-[420px]"><DoctorImage max="max-w-[420px]" /></div>
          </div>
        )}
        {v === 'statband' && (
          <div className="grid gap-9 lg:grid-cols-[1.05fr_.95fr] items-center">
            <div><HeroText /><StatsInline /></div>
            <DoctorImage />
          </div>
        )}
      </div>
    </section>
  )
}

