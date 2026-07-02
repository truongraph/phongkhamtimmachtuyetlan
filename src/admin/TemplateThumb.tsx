import { useLayoutEffect, useRef, useState } from 'react'
import type { SiteTemplate } from '@/site/templates'
import { btnRadius } from '@/site/templates'
import { useContent } from '@/store/content'
import { ICONS } from '@/lib/icons'
import { Phone, Check, HeartPulse } from 'lucide-react'

// Làm nhạt màu bằng cách trộn về phía trắng theo tỉ lệ p (0..1) — giữ đúng tông (không lệch cyan).
function tintWhite(hex: string, p: number) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const mix = (c: number) => Math.round(c + (255 - c) * p)
  return `#${((1 << 24) + (mix(r) << 16) + (mix(g) << 8) + mix(b)).toString(16).slice(1)}`
}
// Tông ĐẬM VỪA từ màu chính (mirror --tl-deep): trộn primary với xanh đậm — ra xanh đậm vừa phải.
function deepOf(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const dk = [18, 51, 95] // #12335f
  const mix = (c: number, d: number) => Math.round(c * 0.72 + d * 0.28)
  return `#${((1 << 24) + (mix(r, dk[0]) << 16) + (mix(g, dk[1]) << 8) + mix(b, dk[2])).toString(16).slice(1)}`
}
const imgRadius = (s: string) => s === 'circle' ? '999px' : s === 'arch' ? '120px 120px 16px 16px' : s === 'square' ? '6px' : '18px'

const W = 1040
const NAV_LABELS: Partial<Record<string, string>> = { about: 'Giới thiệu', services: 'Dịch vụ', specialties: 'Chuyên môn', journey: 'Đào tạo', contact: 'Liên hệ' }

export function TemplateThumb({ t }: { t: SiteTemplate }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.35)
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return
    const ro = new ResizeObserver(() => setScale((el.clientWidth || 360) / W))
    ro.observe(el); return () => ro.disconnect()
  }, [])
  const H = 610
  return (
    <div ref={ref} style={{ width: '100%', height: H * scale, overflow: 'hidden', position: 'relative', background: '#fff' }}>
      <div style={{ width: W, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        <MiniSite t={t} />
      </div>
    </div>
  )
}

function MiniSite({ t }: { t: SiteTemplate }) {
  const content = useContent((s) => s.content)
  const { info, hero } = content
  const NAV = (() => {
    const items = content.sections.filter((s) => s.visible && NAV_LABELS[s.type]).map((s) => NAV_LABELS[s.type] as string)
    return items.length ? items : ['Giới thiệu', 'Dịch vụ', 'Chuyên môn', 'Đào tạo', 'Liên hệ']
  })()

  const { primary, navy, accent, headingFont } = t.theme
  const soft = tintWhite(primary, 0.86), tint = tintWhite(primary, 0.93), deep = deepOf(primary), line = '#e6ebf1', slate = '#5b6b7f', ink = '#0f172a'
  const head = headingFont === 'display' ? "'Lora', Georgia, serif" : "'Inter', system-ui, sans-serif"
  const br = btnRadius(t.button)
  const S: any = { fontFamily: "'Inter',system-ui,sans-serif", color: ink }

  // "Da" của mẫu (mirror với getSkin ở site) để thumbnail phản ánh đúng cá tính từng mẫu.
  const RAINBOW: [string, string][] = [['#E8F0FE', '#2563EB'], ['#E7F8EF', '#0BB14E'], ['#FFF3E2', '#EA580C'], ['#FDEAF1', '#DB2777'], ['#F0EAFF', '#7C3AED'], ['#E3F7FA', '#0891B2']]
  const iconRad = t.image === 'circle' ? 999 : t.image === 'square' ? 8 : t.theme.radius <= 8 ? 10 : 14
  const iconCss = (i: number): { box: any; fg: string } => {
    switch (t.icons) {
      case 'rainbow': return { box: { background: RAINBOW[i % 6][0] }, fg: RAINBOW[i % 6][1] }
      case 'solid': return { box: { background: `linear-gradient(135deg,${primary},${navy})` }, fg: '#fff' }
      case 'outline': return { box: { background: 'transparent', border: `1.5px solid ${tintWhite(primary, 0.62)}` }, fg: primary }
      case 'tintbox': return { box: { background: tint, border: `1px solid ${line}` }, fg: primary }
      default: return { box: { background: soft }, fg: primary } // brand
    }
  }
  const sectionAlt = t.rhythm === 'plain' ? '#F6F8FB' : tint
  const Eyebrow = () => {
    const label = (content.servicesEyebrow || 'Dịch vụ phòng khám').toUpperCase()
    if (t.eyebrow === 'bar') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 700, fontSize: 12, letterSpacing: 1.6, color: primary }}><span style={{ width: 4, height: 15, borderRadius: 3, background: accent }} />{label}</span>
    if (t.eyebrow === 'line') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 700, fontSize: 12, letterSpacing: 2, color: primary }}><span style={{ width: 26, height: 1.5, background: accent }} />{label}</span>
    if (t.eyebrow === 'solid') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 11.5, letterSpacing: 1.2, color: '#fff', background: primary, padding: '5px 13px', borderRadius: 999 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: 'rgba(255,255,255,.85)' }} />{label}</span>
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 11.5, letterSpacing: 1.2, color: primary, background: soft, padding: '5px 13px', borderRadius: 999 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />{label}</span>
  }

  const Logo = ({ light }: { light?: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: light ? '#fff' : `linear-gradient(140deg,${primary},${deep})`, display: 'grid', placeItems: 'center' }}>
        <HeartPulse size={22} color={light ? primary : '#fff'} />
      </div>
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontFamily: head, fontWeight: 700, fontSize: 19, color: light ? '#fff' : ink }}>{info.clinicName}</div>
        <div style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: 700, color: light ? 'rgba(255,255,255,.75)' : accent, textTransform: 'uppercase' }}>{info.tagline}</div>
      </div>
    </div>
  )
  const Nav = ({ light }: { light?: boolean }) => (
    <div style={{ display: 'flex', gap: 22 }}>{NAV.map((n) => <span key={n} style={{ fontSize: 14, fontWeight: 600, color: light ? 'rgba(255,255,255,.9)' : ink }}>{n}</span>)}</div>
  )
  const Cta = ({ light }: { light?: boolean }) => (
    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', background: light ? accent : accent, padding: '11px 18px', borderRadius: br === '999px' ? 999 : br === '3px' ? 4 : 10 }}>Đặt lịch khám</span>
  )

  const Header = () => {
    if (t.header === 'utility') return (
      <div>
        <div style={{ background: deep, color: '#fff', fontSize: 11.5, padding: '7px 40px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{info.hours.slice(0, 2).map((h) => `${h.label}: ${h.value}`).join(' · ')}</span><span>Hotline: {info.phone}</span>
        </div>
        <div style={{ background: '#fff', borderBottom: `1px solid ${line}`, padding: '12px 40px', display: 'flex', alignItems: 'center' }}>
          <Logo /><div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><Nav /></div><Cta />
        </div>
      </div>
    )
    if (t.header === 'bar') return (
      <div style={{ background: primary, padding: '14px 40px', display: 'flex', alignItems: 'center' }}>
        <Logo light /><div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><Nav light /></div>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: primary, background: '#fff', padding: '11px 18px', borderRadius: br === '999px' ? 999 : 10 }}>Đặt lịch khám</span>
      </div>
    )
    if (t.header === 'centered') return (
      <div style={{ background: '#fff', borderBottom: `1px solid ${line}`, padding: '12px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Logo /></div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 10 }}><Nav /></div>
      </div>
    )
    return (
      <div style={{ background: '#fff', borderBottom: `1px solid ${line}`, padding: '14px 40px', display: 'flex', alignItems: 'center' }}>
        <Logo /><div style={{ flex: 1 }} /><Nav /><span style={{ marginLeft: 24 }}><Cta /></span>
      </div>
    )
  }

  const Title = ({ center }: { center?: boolean }) => (
    <div style={{ textAlign: center ? 'center' : 'left', maxWidth: center ? 620 : 'none', margin: center ? '0 auto' : 0 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${line}`, borderRadius: 999, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, color: slate }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }} /> {hero.badgePrefix} <b style={{ color: navy }}>{hero.badgeStrong}</b>
      </span>
      <div style={{ fontFamily: head, fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: ink, marginTop: 14 }}>
        {hero.title} <span style={{ color: accent }}>{hero.titleHighlight}</span>
      </div>
      <div style={{ fontSize: 15.5, color: slate, marginTop: 12, maxWidth: 440, marginLeft: center ? 'auto' : 0, marginRight: center ? 'auto' : 0 }}>
        {hero.subtitle}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 16, alignItems: center ? 'center' : 'flex-start' }}>
        {hero.bullets.slice(0, 2).map((b) => (
          <div key={b} style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: soft, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Check size={13} color={primary} strokeWidth={3} /></span>
            <span style={{ fontSize: 14, color: ink }}>{b}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: center ? 'center' : 'flex-start' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accent, color: '#fff', fontWeight: 700, fontSize: 14, padding: '13px 20px', borderRadius: br === '999px' ? 999 : br === '3px' ? 4 : 10 }}><Phone size={16} /> Gọi: {info.phone}</span>
        <span style={{ background: '#fff', border: `1px solid ${line}`, color: primary, fontWeight: 700, fontSize: 14, padding: '13px 20px', borderRadius: br === '999px' ? 999 : br === '3px' ? 4 : 10 }}>Đặt lịch khám</span>
      </div>
    </div>
  )

  const DocImg = ({ w = 360 }: { w?: number }) => (
    <div style={{ position: 'relative', width: w, justifySelf: 'center' }}>
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 0, width: '104%', height: '82%', borderRadius: imgRadius(t.image), background: `linear-gradient(160deg,${primary},${deep})` }} />
      <img src={hero.doctorPhotoUrl} alt="" style={{ position: 'relative', width: '100%', borderRadius: imgRadius(t.image), display: 'block', aspectRatio: t.image === 'circle' ? '1/1' : '83/100', objectFit: 'cover', objectPosition: 'top center', filter: 'drop-shadow(0 20px 34px rgba(8,40,72,.26))' }} />
    </div>
  )

  const Form = () => (
    <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${line}`, overflow: 'hidden', boxShadow: '0 24px 50px rgba(11,59,112,.16)', width: 380, justifySelf: 'center' }}>
      <div style={{ background: `linear-gradient(120deg,${primary},${deep})`, color: '#fff', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <img src={hero.doctorPhotoUrl} alt="" style={{ width: 46, height: 46, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(255,255,255,.5)' }} />
        <div><div style={{ fontFamily: head, fontWeight: 700, fontSize: 17 }}>{hero.bookingTitle}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>{hero.bookingSubtitle}</div></div>
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {['Họ và tên', 'Số điện thoại', 'Dịch vụ'].map((f) => (
          <div key={f}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>{f}</div><div style={{ height: 40, border: `1.5px solid ${line}`, borderRadius: 9, background: '#fff' }} /></div>
        ))}
        <div style={{ background: accent, color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 14.5, padding: '13px', borderRadius: br === '999px' ? 999 : br === '3px' ? 4 : 10 }}>Gửi đăng ký</div>
      </div>
    </div>
  )

  const Hero = () => {
    const wrap = (c: React.ReactNode) => <div style={{ background: `linear-gradient(180deg,${tint},#fff)`, padding: '38px 40px 30px' }}>{c}</div>
    const two = (a: React.ReactNode, b: React.ReactNode, ratio = '1.05fr .95fr') =>
      <div style={{ display: 'grid', gridTemplateColumns: ratio, gap: 34, alignItems: 'center' }}>{a}{b}</div>
    if (t.hero === 'form') return wrap(two(<Title />, <Form />))
    if (t.hero === 'split') return wrap(two(<Title />, <DocImg />))
    if (t.hero === 'imageLeft') return wrap(two(<DocImg />, <Title />, '.95fr 1.05fr'))
    if (t.hero === 'centered') return wrap(<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}><Title center /><DocImg w={300} /></div>)
    return wrap(two(<div><Title /><div style={{ display: 'flex', gap: 12, marginTop: 22 }}>{content.stats.slice(0, 3).map((s) => <div key={s.id} style={{ flex: 1, background: '#fff', border: `1px solid ${line}`, borderRadius: 12, padding: '12px 14px' }}><div style={{ fontFamily: head, fontWeight: 700, fontSize: 20, color: primary }}>{s.value}</div><div style={{ fontSize: 12, color: slate }}>{s.label}</div></div>)}</div></div>, <DocImg />))
  }

  const cardStyle = (): any => {
    const b: any = { flex: 1, padding: 20, borderRadius: t.card === 'flat' ? 0 : 14 }
    if (t.card === 'outline') return { ...b, background: '#fff', border: `1.5px solid ${line}` }
    if (t.card === 'flat') return { ...b, background: 'transparent', borderBottom: `2px solid ${soft}` }
    if (t.card === 'filled') return { ...b, background: tint }
    return { ...b, background: '#fff', boxShadow: '0 6px 18px rgba(8,40,72,.1)' }
  }
  const Ico = (name: string, i: number, size = 24) => { const I = ICONS[name] ?? HeartPulse; return <I size={size} color={iconCss(i).fg} /> }
  const iconBox = (i: number, s: number, mb = 0, mxAuto = false): any => ({ width: s, height: s, borderRadius: iconRad, display: 'grid', placeItems: 'center', flexShrink: 0, margin: mxAuto ? `0 auto ${mb}px` : mb ? `0 0 ${mb}px` : 0, ...iconCss(i).box })
  const Services = () => {
    const heading = <div style={{ marginBottom: 18 }}><Eyebrow /><div style={{ fontFamily: head, fontWeight: 700, fontSize: 24, color: ink, marginTop: 10 }}>{content.servicesTitle} <span style={{ color: accent }}>{content.servicesTitleHighlight}</span></div></div>
    let body: React.ReactNode
    if (t.services === 'grid4') {
      body = (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {content.services.slice(0, 4).map((svc, i) => (
            <div key={svc.id} style={{ ...cardStyle(), padding: 14, textAlign: 'center' }}>
              <span style={iconBox(i, 40, 8, true)}>{Ico(svc.icon, i, 20)}</span>
              <div style={{ fontFamily: head, fontWeight: 700, fontSize: 14, color: ink }}>{svc.title}</div>
            </div>
          ))}
        </div>
      )
    } else if (t.services === 'list') {
      body = (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 28 }}>
          {content.services.slice(0, 4).map((svc, i) => (
            <div key={svc.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '13px 0', borderBottom: `1px solid ${line}` }}>
              <span style={iconBox(i, 40)}>{Ico(svc.icon, i, 20)}</span>
              <div><div style={{ fontFamily: head, fontWeight: 700, fontSize: 15, color: ink }}>{svc.title}</div><div style={{ fontSize: 12.5, color: slate, marginTop: 2 }}>{svc.desc}</div></div>
            </div>
          ))}
        </div>
      )
    } else if (t.services === 'alt') {
      body = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {content.services.slice(0, 2).map((svc, i) => (
            <div key={svc.id} style={{ ...cardStyle(), display: 'flex', gap: 18, alignItems: 'center', flexDirection: i % 2 ? 'row-reverse' : 'row', padding: 18 }}>
              <span style={iconBox(i, 58)}>{Ico(svc.icon, i, 28)}</span>
              <div style={{ flex: 1, textAlign: i % 2 ? 'right' : 'left' }}><div style={{ fontFamily: head, fontWeight: 700, fontSize: 17, color: ink }}>{svc.title}</div><div style={{ fontSize: 13, color: slate, marginTop: 3 }}>{svc.desc}</div></div>
              <div style={{ fontFamily: head, fontWeight: 700, fontSize: 24, color: iconCss(i).fg, opacity: .3 }}>0{i + 1}</div>
            </div>
          ))}
        </div>
      )
    } else {
      body = (
        <div style={{ display: 'flex', gap: 16 }}>
          {content.services.slice(0, 3).map((svc, i) => (
            <div key={svc.id} style={cardStyle()}>
              <span style={iconBox(i, 44)}>{Ico(svc.icon, i)}</span>
              <div style={{ fontFamily: head, fontWeight: 700, fontSize: 16, color: ink, marginTop: 12 }}>{svc.title}</div>
              <div style={{ fontSize: 13, color: slate, marginTop: 6 }}>{svc.desc}</div>
            </div>
          ))}
        </div>
      )
    }
    return <div style={{ padding: '30px 40px 40px', background: sectionAlt }}>{heading}{body}</div>
  }

  return <div style={S}><Header /><Hero /><Services /></div>
}
