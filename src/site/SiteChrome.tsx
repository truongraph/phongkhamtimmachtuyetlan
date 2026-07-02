import { useEffect, useState } from 'react'
import { useContent } from '@/store/content'
import { useTemplate } from './templates'
import { Icon } from '@/lib/icons'
import { Phone, User, Activity, HeartPulse, MapPin } from 'lucide-react'

const NAV = [
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

function Logo({ light }: { light?: boolean }) {
  const info = useContent((s) => s.published.info)
  return (
    <a href="#top" className="flex items-center gap-3">
      <img src={info.logoUrl} alt="Logo" className="size-11 md:size-12 rounded-[10px] bg-white p-1 border object-contain" style={{ borderColor: 'var(--tl-line)' }} />
      <span className="flex flex-col leading-tight">
        <b className="site-head font-bold text-[1.05rem] md:text-[1.1rem] whitespace-nowrap" style={{ color: light ? '#fff' : 'var(--tl-navy)' }}>{info.clinicName}</b>
        <span className="hidden sm:block text-[.66rem] tracking-[.12em] uppercase font-bold" style={{ color: light ? 'rgba(255,255,255,.85)' : 'var(--tl-accent)' }}>{info.tagline}</span>
      </span>
    </a>
  )
}

function NavLinks({ active, light, center }: { active: string; light?: boolean; center?: boolean }) {
  return (
    <nav className={`hidden lg:flex items-center gap-1 ${center ? 'justify-center' : ''}`}>
      {NAV.map((n) => (
        <a key={n.id} href={`#${n.id}`} className="relative px-3 py-2 rounded-lg text-[.94rem] font-semibold transition-colors"
          style={{ color: light ? (active === n.id ? '#fff' : 'rgba(255,255,255,.82)') : (active === n.id ? 'var(--tl-navy)' : 'var(--tl-ink)') }}>
          {n.label}
          <span className="absolute left-3 right-3 -bottom-[1px] h-[2.5px] rounded origin-left transition-transform"
            style={{ background: light ? '#fff' : 'var(--tl-accent)', transform: active === n.id ? 'scaleX(1)' : 'scaleX(0)' }} />
        </a>
      ))}
    </nav>
  )
}

function Cta({ tel, bar }: { tel: string; bar?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <a href="#dat-lich" className="hidden md:inline-flex items-center px-5 py-3 text-[.95rem] font-semibold"
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
  const active = useScrollSpy(NAV.map((n) => n.id))
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 6)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const isBar = tpl.header === 'bar'
  const headerStyle: React.CSSProperties = isBar
    ? { background: 'var(--tl-primary)' }
    : { background: '#fff', borderBottom: '1px solid var(--tl-line)' }
  const shadow = scrolled ? 'shadow-[0_4px_20px_rgba(18,40,63,.10)]' : ''

  return (
    <>
      {tpl.header === 'utility' && (
        <div className="hidden md:flex h-10 items-center text-[13px]" style={{ background: 'var(--tl-navy)', color: '#cfe1f4' }}>
          <div className="container flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <Icon name="clock" className="size-[15px]" style={{ color: 'var(--tl-soft)' }} />
              {info.hours[0] && <>Thứ 2 – Thứ 7: <b className="text-white font-semibold">{info.hours[0].value}</b></>}
              {info.hours[1] && <> · CN: <b className="text-white font-semibold">{info.hours[1].value}</b></>}
            </span>
            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-2"><MapPin className="size-[15px]" style={{ color: 'var(--tl-soft)' }} /> {info.address}</span>
              <a href={`tel:${tel}`} className="inline-flex items-center gap-2 hover:text-white">
                <Phone className="size-[15px]" style={{ color: 'var(--tl-soft)' }} /> Hotline: <b className="text-white font-semibold">{info.phone}</b>
              </a>
            </div>
          </div>
        </div>
      )}

      {tpl.header === 'centered' ? (
        <header className={`sticky top-0 z-40 transition-shadow ${shadow}`} style={headerStyle}>
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
        <header className={`sticky top-0 z-40 transition-shadow ${shadow}`} style={headerStyle}>
          <div className="container flex h-[64px] md:h-[74px] items-center justify-between gap-4">
            <Logo light={isBar} />
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
    <footer className="text-[#9DB8D4] pt-[52px] pb-20 lg:pb-10 text-[.92rem]" style={{ background: 'linear-gradient(180deg,var(--tl-navy),color-mix(in srgb,var(--tl-navy) 78%,#000))' }}>
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={info.logoUrl} className="size-12 rounded-[11px] bg-white p-1 object-contain" alt="Logo" />
              <span><b className="block site-head font-bold text-white text-[1.1rem]">{info.clinicName}</b>
                <span className="text-[.66rem] tracking-[.12em] uppercase font-bold" style={{ color: 'var(--tl-accent)' }}>{info.tagline}</span></span>
            </div>
            <p className="max-w-[40ch] text-[#89A4C2]">{footerAbout}</p>
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
              <li className="flex gap-2"><Phone className="size-4 mt-1 shrink-0 text-[#5E82A8]" /><a href={`tel:${info.phone.replace(/\s/g, '')}`} className="hover:text-white">{info.phone}</a></li>
              <li className="flex gap-2"><MapPin className="size-4 mt-1 shrink-0 text-[#5E82A8]" /><span>{info.address} {info.addressNote}</span></li>
              <li className="flex gap-2"><Icon name="clock" className="size-4 mt-1 shrink-0 text-[#5E82A8]" /><span>{info.hours.map((h) => `${h.label}: ${h.value}`).join(' · ')}</span></li>
            </ul>
          </div>
        </div>
        <div className="pt-5 flex justify-between gap-3 flex-wrap text-[.85rem] text-[#6F8DAE]">
          <span>© {new Date().getFullYear()} Phòng khám {info.clinicName}.</span>
          <span>{info.slogan}</span>
        </div>
      </div>
    </footer>
  )
}
