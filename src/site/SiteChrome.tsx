import { useEffect, useState } from 'react'
import { useContent } from '@/store/content'
import { useTemplate } from './templates'
import { Icon } from '@/lib/icons'
import { Phone, User, Activity, HeartPulse, MapPin, ChevronUp } from 'lucide-react'
import { openBooking } from './sections/Hero'
import { Editable, EditableImage } from './edit'

// spy = id khu vực dùng để tô sáng mục menu (Trang chủ link về #top nhưng sáng theo khu vực hero).
const NAV: { id: string; label: string; spy?: string }[] = [
  { id: 'top', label: 'Trang chủ', spy: 'dat-lich' },
  { id: 'gioi-thieu', label: 'Giới thiệu' },
  { id: 'dich-vu', label: 'Dịch vụ' },
  { id: 'chuyen-mon', label: 'Chuyên môn' },
  { id: 'dao-tao', label: 'Đào tạo' },
  { id: 'lien-he', label: 'Liên hệ' },
]

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [ids.join(',')])
  return active
}

function Logo() {
  const info = useContent((s) => s.published.info)
  return (
    <a href="#top" aria-label={info.clinicName} className="flex items-center">
      <EditableImage path="info.logoUrl" src={info.logoUrl} alt={info.clinicName} className="h-14 md:h-16 w-auto max-w-[240px] object-contain" />
    </a>
  )
}

function NavLinks({ active, light, center }: { active: string; light?: boolean; center?: boolean }) {
  return (
    <nav className={`hidden lg:flex items-center gap-1 ${center ? 'justify-center' : ''}`}>
      {NAV.map((n) => {
        const on = active === (n.spy ?? n.id)
        return (
          <a key={n.id} href={`#${n.id}`} className="relative px-3 py-2 rounded-lg text-[.94rem] font-semibold transition-colors"
            style={{ color: light ? (on ? '#fff' : 'rgba(255,255,255,.82)') : (on ? 'var(--tl-primary)' : 'var(--tl-ink)') }}>
            {n.label}
            <span className="absolute left-3 right-3 -bottom-[1px] h-[2.5px] rounded origin-left transition-transform"
              style={{ background: light ? '#fff' : 'var(--tl-accent)', transform: on ? 'scaleX(1)' : 'scaleX(0)' }} />
          </a>
        )
      })}
    </nav>
  )
}

function Cta({ tel, bar }: { tel: string; bar?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <a href="#dat-lich" onClick={(e) => { e.preventDefault(); openBooking() }} className="hidden md:inline-flex items-center px-5 py-3 text-[.95rem] font-semibold"
        style={bar ? { background: '#fff', color: 'var(--tl-primary)', borderRadius: 'var(--tl-btn)' } : { background: 'var(--tl-accent)', color: '#fff', borderRadius: 'var(--tl-btn)' }}>Đặt lịch khám</a>
      <a href={`tel:${tel}`} className="md:hidden grid place-items-center size-11 text-white" style={{ background: 'var(--tl-accent)', borderRadius: 'var(--tl-btn)' }} aria-label="Gọi">
        <Phone className="size-5" />
      </a>
    </div>
  )
}

export function SiteHeader({ tel }: { tel: string }) {
  const info = useContent((s) => s.published.info)
  const tpl = useTemplate()
  const [scrolled, setScrolled] = useState(false)
  const active = useScrollSpy(NAV.map((n) => n.spy ?? n.id))
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 6)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const isBar = tpl.header === 'bar'
  // "Tráng gương": khi đã cuộn thì nền bán trong suốt + làm mờ hậu cảnh (frosted glass).
  const glass: React.CSSProperties = { WebkitBackdropFilter: 'blur(14px)', backdropFilter: 'blur(14px)' }
  const headerStyle: React.CSSProperties = isBar
    ? (scrolled
        ? { background: 'color-mix(in srgb, var(--tl-primary) 78%, transparent)', ...glass }
        : { background: 'var(--tl-primary)' })
    : (scrolled
        ? { background: 'rgba(255,255,255,.7)', borderBottom: '1px solid var(--tl-line)', ...glass }
        : { background: '#fff', borderBottom: '1px solid var(--tl-line)' })
  const headerCls = `sticky top-0 z-40 transition-shadow ${scrolled ? 'shadow-[0_4px_20px_rgba(18,40,63,.10)]' : ''}`

  return (
    <>
      {tpl.header === 'utility' && (
        <div className="hidden md:flex h-10 items-center text-[13px]" style={{ background: 'var(--tl-deep)', color: '#cfe1f4' }}>
          <div className="container flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <Icon name="clock" className="size-[15px]" style={{ color: 'var(--tl-soft)' }} />
              {info.hours[0] && <>Thứ 2 – Thứ 7: <Editable as="b" path={`info.hours.${info.hours[0].id}.value`} className="text-white font-semibold">{info.hours[0].value}</Editable></>}
              {info.hours[1] && <> · CN: <Editable as="b" path={`info.hours.${info.hours[1].id}.value`} className="text-white font-semibold">{info.hours[1].value}</Editable></>}
            </span>
            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-2"><MapPin className="size-[15px]" style={{ color: 'var(--tl-soft)' }} /> <Editable as="span" path="info.address">{info.address}</Editable></span>
              <a href={`tel:${tel}`} className="inline-flex items-center gap-2 hover:text-white">
                <Phone className="size-[15px]" style={{ color: 'var(--tl-soft)' }} /> Hotline: <Editable as="b" path="info.phone" className="text-white font-semibold">{info.phone}</Editable>
              </a>
            </div>
          </div>
        </div>
      )}

      {tpl.header === 'centered' ? (
        <header className={headerCls} style={headerStyle}>
          <div className="container">
            <div className="flex h-[64px] md:h-[68px] items-center justify-between gap-4">
              <Logo />
              <Cta tel={tel} />
            </div>
            <div className="hidden lg:block border-t pb-1.5" style={{ borderColor: 'var(--tl-line)' }}>
              <NavLinks active={active} center />
            </div>
          </div>
        </header>
      ) : (
        <header className={headerCls} style={headerStyle}>
          <div className="container flex h-[64px] md:h-[74px] items-center justify-between gap-4">
            <Logo />
            <NavLinks active={active} light={isBar} />
            <Cta tel={tel} bar={isBar} />
          </div>
        </header>
      )}

      {/* mobile bottom tab bar */}
      <nav className="lg:hidden fixed left-0 right-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t shadow-[0_-4px_20px_rgba(18,40,63,.08)]" style={{ borderColor: 'var(--tl-line)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around">
          {[
            { id: 'gioi-thieu', label: 'Giới thiệu', I: User },
            { id: 'dich-vu', label: 'Dịch vụ', I: Activity },
            { id: '__call', label: 'Gọi ngay', I: Phone },
            { id: 'chuyen-mon', label: 'Chuyên môn', I: HeartPulse },
            { id: 'lien-he', label: 'Liên hệ', I: MapPin },
          ].map((t) =>
            t.id === '__call' ? (
              <a key={t.id} href={`tel:${tel}`} className="flex-1 flex flex-col items-center gap-1 pt-[9px] pb-2 text-[.66rem] font-bold" style={{ color: 'var(--tl-accent)' }}>
                <span className="grid place-items-center size-11 -mt-5 rounded-full text-white border-[3px] border-white shadow-lg" style={{ background: 'var(--tl-accent)' }}><Phone className="size-[22px]" /></span>
                {t.label}
              </a>
            ) : (
              <a key={t.id} href={`#${t.id}`} className="relative flex-1 flex flex-col items-center gap-[3px] pt-[9px] pb-2 text-[.66rem] font-semibold transition-colors"
                style={{ color: active === t.id ? 'var(--tl-primary)' : 'var(--tl-slate)' }}>
                <span className="absolute top-0 left-[37%] -translate-x-1/2 w-[26px] h-[3px] rounded-b transition-transform origin-top" style={{ background: 'var(--tl-accent)', transform: active === t.id ? 'scaleX(1)' : 'scaleX(0)' }} />
                <t.I className="size-[21px]" />
                {t.label}
              </a>
            )
          )}
        </div>
      </nav>
    </>
  )
}

export function SiteFooter() {
  const { info, footerAbout } = useContent((s) => s.published)
  return (
    <footer className="text-white/65 pt-[52px] pb-20 lg:pb-10 text-[.92rem]" style={{ background: 'linear-gradient(180deg,color-mix(in srgb,var(--tl-deep) 80%,#071427),color-mix(in srgb,var(--tl-deep) 50%,#071427))' }}>
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <EditableImage path="info.logoUrl" src={info.logoUrl} className="size-12 rounded-[11px] bg-white p-1 object-contain" alt="Logo" />
              <span><Editable as="b" path="info.clinicName" className="block site-head font-bold text-white text-[1.1rem]">{info.clinicName}</Editable>
                <Editable as="span" path="info.tagline" className="text-[.66rem] tracking-[.12em] uppercase font-bold" style={{ color: 'var(--tl-accent)' }}>{info.tagline}</Editable></span>
            </div>
            <Editable as="p" path="footerAbout" multiline className="max-w-[40ch] text-white/55">{footerAbout}</Editable>
          </div>
          <div>
            <h4 className="text-white text-[.8rem] tracking-[.1em] uppercase mb-4 font-bold font-sans">Liên kết</h4>
            <ul className="grid gap-2.5">
              {NAV.map((n) => <li key={n.id}><a href={`#${n.id}`} className="hover:text-white">{n.label}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[.8rem] tracking-[.1em] uppercase mb-4 font-bold font-sans">Liên hệ</h4>
            <ul className="grid gap-2.5">
              <li className="flex gap-2"><Phone className="size-4 mt-1 shrink-0 text-white/40" /><a href={`tel:${info.phone.replace(/\s/g, '')}`} className="hover:text-white"><Editable path="info.phone">{info.phone}</Editable></a></li>
              <li className="flex gap-2"><MapPin className="size-4 mt-1 shrink-0 text-white/40" /><span><Editable path="info.address">{info.address}</Editable> <Editable path="info.addressNote">{info.addressNote}</Editable></span></li>
              <li className="flex gap-2"><Icon name="clock" className="size-4 mt-1 shrink-0 text-white/40" /><span>{info.hours.map((h) => `${h.label}: ${h.value}`).join(' · ')}</span></li>
            </ul>
          </div>
        </div>
        <div className="pt-5 flex justify-between gap-3 flex-wrap text-[.85rem] text-white/50">
          <span>© {new Date().getFullYear()} Phòng khám {info.clinicName}.</span>
          <Editable as="span" path="info.slogan">{info.slogan}</Editable>
        </div>
      </div>
    </footer>
  )
}

/** Nút nổi: Gọi hotline (trái–dưới, icon lắc + sóng vang) & Lên đầu trang (phải–dưới, trượt ra khi cuộn). */
export function FloatingWidgets() {
  const info = useContent((s) => s.published.info)
  const tel = info.phone.replace(/\s/g, '')
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 320)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <>
      {/* Gọi hotline — góc trái dưới (máy tính) */}
      <a
        href={`tel:${tel}`}
        aria-label={`Gọi hotline ${info.phone}`}
        className="hidden lg:grid fixed bottom-6 left-6 z-40 place-items-center size-14 rounded-full text-white shadow-[0_10px_28px_rgba(0,0,0,.24)]"
        style={{ background: 'var(--tl-accent)' }}
      >
        {/* sóng vang */}
        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'var(--tl-accent)', opacity: 0.55 }} />
        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'var(--tl-accent)', opacity: 0.35, animationDelay: '.7s' }} />
        <Phone className="relative size-6 tl-wiggle" />
      </a>

      {/* Lên đầu trang — góc phải dưới, trượt từ phải ra khi cuộn xuống */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Lên đầu trang"
        className={`fixed z-40 bottom-24 lg:bottom-6 right-5 lg:right-6 grid place-items-center size-12 rounded-full text-white shadow-[0_10px_28px_rgba(0,0,0,.22)] transition-all duration-300 hover:-translate-y-0.5 ${show ? 'translate-x-0 opacity-100' : 'translate-x-[160%] opacity-0 pointer-events-none'}`}
        style={{ background: 'var(--tl-primary)' }}
      >
        <ChevronUp className="size-6" />
      </button>
    </>
  )
}
