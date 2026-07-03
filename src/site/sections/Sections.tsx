import { useState } from 'react'
import { useContent } from '@/store/content'
import { Icon } from '@/lib/icons'
import { Clock, Phone, MapPin } from 'lucide-react'
import { useTemplate, useSkin } from '../templates'
import { Editable, EditableImage } from '../edit'

/* Bảng màu icon xoay vòng — vẫn export để nơi khác (hero, thumbnail) dùng khi cần. */
export const CHIP: readonly [string, string][] = [
  ['#E8F0FE', '#2563EB'],
  ['#E7F8EF', '#0BB14E'],
  ['#FFF3E2', '#EA580C'],
  ['#FDEAF1', '#DB2777'],
  ['#F0EAFF', '#7C3AED'],
  ['#E3F7FA', '#0891B2'],
]
export const chip = (i: number) => ({ background: CHIP[i % CHIP.length][0], color: CHIP[i % CHIP.length][1] })

/** Nhãn nhỏ trên tiêu đề — đổi kiểu theo "da" của mẫu (viên/thanh/gạch/nền đặc). */
function Eyebrow({ children, path }: { children: React.ReactNode; center?: boolean; path?: string }) {
  const sk = useSkin()
  const label = path ? <Editable path={path}>{children}</Editable> : children
  if (sk.eyebrow === 'bar') {
    return (
      <span className="inline-flex items-center gap-2.5 font-bold text-[.72rem] tracking-[.14em] uppercase" style={{ color: 'var(--tl-primary)' }}>
        <span className="h-4 w-1 rounded-full" style={{ background: 'var(--tl-accent)' }} />{label}
      </span>
    )
  }
  if (sk.eyebrow === 'line') {
    return (
      <span className="inline-flex items-center gap-2.5 font-bold text-[.72rem] tracking-[.16em] uppercase">
        <span className="h-px w-7" style={{ background: 'var(--tl-accent)' }} /><span style={{ color: 'var(--tl-primary)' }}>{label}</span>
      </span>
    )
  }
  if (sk.eyebrow === 'solid') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-bold text-[.72rem] tracking-[.12em] uppercase text-white shadow-sm" style={{ background: 'var(--tl-primary)' }}>
        <span className="size-1.5 rounded-full bg-white/85" />{label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-bold text-[.72rem] tracking-[.12em] uppercase" style={{ background: 'var(--tl-soft)', color: 'var(--tl-primary)' }}>
      <span className="size-1.5 rounded-full" style={{ background: 'var(--tl-accent)' }} />{label}
    </span>
  )
}
function Title({ text, hi, path, hiPath }: { text: string; hi?: string; path?: string; hiPath?: string }) {
  return <h2 className="mt-3 site-head font-bold text-[clamp(1.7rem,3.5vw,2.5rem)]" style={{ color: 'var(--tl-ink)' }}>
    {path ? <Editable path={path}>{text}</Editable> : text}
    {hi && <> {hiPath
      ? <Editable path={hiPath} style={{ color: 'var(--tl-accent)' }}>{hi}</Editable>
      : <span style={{ color: 'var(--tl-accent)' }}>{hi}</span>}</>}
  </h2>
}

/* ============ STATS ============ */
export function Stats() {
  const stats = useContent((s) => s.published.stats)
  const tpl = useTemplate()
  const sk = useSkin()

  if (tpl.stats === 'cards') {
    return (
      <section className="py-10" style={{ background: sk.bgTint }}>
        <div className="container grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={s.id} className={`${sk.cardCls} p-5 flex items-center gap-4`} style={sk.cardStyle}>
              <span className={`grid place-items-center size-12 ${sk.iconShape} shrink-0`} style={sk.icon(i)}><Icon name={s.icon} className="size-6" /></span>
              <div><Editable as="b" path={`stats.${s.id}.value`} className="block site-head font-bold text-[1.5rem] leading-none" style={{ color: 'var(--tl-primary)' }}>{s.value}</Editable><Editable as="span" path={`stats.${s.id}.label`} className="text-[.84rem]" style={{ color: 'var(--tl-slate)' }}>{s.label}</Editable></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (tpl.stats === 'inline') {
    return (
      <section className="py-10 border-y" style={{ borderColor: 'var(--tl-line)' }}>
        <div className="container grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={s.id} className="text-center">
              <span className={`grid place-items-center size-12 ${sk.iconShape} mx-auto mb-3`} style={sk.icon(i)}><Icon name={s.icon} className="size-6" /></span>
              <Editable as="b" path={`stats.${s.id}.value`} className="block site-head font-bold text-[1.9rem] leading-none" style={{ color: 'var(--tl-primary)' }}>{s.value}</Editable>
              <Editable as="span" path={`stats.${s.id}.label`} className="text-[.86rem] mt-1 block" style={{ color: 'var(--tl-slate)' }}>{s.label}</Editable>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // band (nền navy)
  return (
    <section className="text-white" style={{ background: 'linear-gradient(120deg,var(--tl-primary),var(--tl-deep))' }}>
      <div className="container grid grid-cols-2 lg:grid-cols-4 gap-6 py-10">
        {stats.map((s, i) => (
          <div key={s.id} className="relative flex items-center gap-4">
            <span className="grid place-items-center size-[54px] rounded-2xl bg-white/15 shrink-0"><Icon name={s.icon} className="size-7" /></span>
            <div><Editable as="b" path={`stats.${s.id}.value`} className="block site-head font-bold text-[1rem] lg:text-[1.8rem] leading-none">{s.value}</Editable><Editable as="span" path={`stats.${s.id}.label`} className="text-[.6rem] lg:text-[.86rem] text-white/75">{s.label}</Editable></div>
            {i < stats.length - 1 && <span className="hidden lg:block absolute -right-3 top-1 bottom-1 w-px bg-white/15" />}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============ WHY ============ */
export function Why() {
  const { whys, whyEyebrow, whyTitle, whyTitleHighlight } = useContent((s) => s.published)
  const tpl = useTemplate()
  const sk = useSkin()

  if (tpl.why === 'bordered') {
    return (
      <section className="py-14 lg:py-24">
        <div className="container grid lg:grid-cols-[.72fr_1.28fr] gap-10 items-start">
          <div className="lg:sticky lg:top-24"><Eyebrow path="whyEyebrow">{whyEyebrow}</Eyebrow><Title text={whyTitle} hi={whyTitleHighlight} path="whyTitle" hiPath="whyTitleHighlight" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            {whys.map((w, i) => (
              <div key={w.id} className={`${sk.cardCls} p-5`} style={sk.cardStyle}>
                <span className={`grid place-items-center size-12 ${sk.iconShape} mb-3`} style={sk.icon(i)}><Icon name={w.icon} className="size-6" /></span>
                <Editable as="h3" path={`whys.${w.id}.title`} className="site-head font-bold text-[1.08rem] mb-1" style={{ color: 'var(--tl-ink)' }}>{w.title}</Editable>
                <Editable as="p" path={`whys.${w.id}.desc`} multiline className="text-[.9rem]" style={{ color: 'var(--tl-slate)' }}>{w.desc}</Editable>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const center = tpl.why === 'iconTop'
  return (
    <section className="py-14 lg:py-24">
      <div className="container">
        <div className="max-w-[640px] mx-auto text-center mb-11 flex flex-col items-center"><Eyebrow center path="whyEyebrow">{whyEyebrow}</Eyebrow><Title text={whyTitle} hi={whyTitleHighlight} path="whyTitle" hiPath="whyTitleHighlight" /></div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {whys.map((w, i) => (
            <div key={w.id} className={`${sk.cardCls} p-6 ${center ? 'text-center' : ''}`} style={sk.cardStyle}>
              <span className={`grid place-items-center size-14 ${sk.iconShape} mb-4 ${center ? 'mx-auto' : ''}`} style={sk.icon(i)}><Icon name={w.icon} className="size-7" /></span>
              <Editable as="h3" path={`whys.${w.id}.title`} className="site-head font-bold text-[1.1rem] mb-1.5" style={{ color: 'var(--tl-ink)' }}>{w.title}</Editable>
              <Editable as="p" path={`whys.${w.id}.desc`} multiline className="text-[.92rem]" style={{ color: 'var(--tl-slate)' }}>{w.desc}</Editable>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============ SERVICES ============ */
export function Services() {
  const { services, servicesEyebrow, servicesTitle, servicesTitleHighlight, servicesLead } = useContent((s) => s.published)
  const tpl = useTemplate()
  const sk = useSkin()
  const head = (
    <div className="max-w-[640px] mb-11">
      <Eyebrow path="servicesEyebrow">{servicesEyebrow}</Eyebrow>
      <Title text={servicesTitle} hi={servicesTitleHighlight} path="servicesTitle" hiPath="servicesTitleHighlight" />
      <Editable as="p" path="servicesLead" multiline className="mt-3 text-[1.05rem] max-w-[60ch]" style={{ color: 'var(--tl-slate)' }}>{servicesLead}</Editable>
    </div>
  )

  let body: React.ReactNode
  if (tpl.services === 'list') {
    body = (
      <div className="grid md:grid-cols-2 gap-4">
        {services.map((sv, i) => (
          <div key={sv.id} className={`${sk.cardCls} flex gap-4 items-start p-5`} style={sk.cardStyle}>
            <span className={`grid place-items-center size-12 ${sk.iconShape} shrink-0`} style={sk.icon(i)}><Icon name={sv.icon} className="size-6" /></span>
            <div><Editable as="h3" path={`services.${sv.id}.title`} className="site-head font-bold text-[1.05rem]" style={{ color: 'var(--tl-ink)' }}>{sv.title}</Editable><Editable as="p" path={`services.${sv.id}.desc`} multiline className="text-[.9rem] mt-0.5" style={{ color: 'var(--tl-slate)' }}>{sv.desc}</Editable></div>
          </div>
        ))}
      </div>
    )
  } else if (tpl.services === 'alt') {
    body = (
      <div className="space-y-4 max-w-4xl">
        {services.map((sv, i) => (
          <div key={sv.id} className={`${sk.cardCls} flex flex-col sm:flex-row gap-5 items-center p-6 ${i % 2 ? 'sm:flex-row-reverse sm:text-right' : ''}`} style={sk.cardStyle}>
            <span className={`grid place-items-center size-[68px] ${sk.iconShape} shrink-0`} style={sk.icon(i)}><Icon name={sv.icon} className="size-8" /></span>
            <div className="flex-1"><Editable as="h3" path={`services.${sv.id}.title`} className="site-head font-bold text-[1.2rem]" style={{ color: 'var(--tl-ink)' }}>{sv.title}</Editable><Editable as="p" path={`services.${sv.id}.desc`} multiline className="text-[.95rem] mt-1" style={{ color: 'var(--tl-slate)' }}>{sv.desc}</Editable></div>
            <span className="site-head font-bold text-[1.7rem] opacity-25 tabular-nums" style={{ color: sk.fg(i) }}>{String(i + 1).padStart(2, '0')}</span>
          </div>
        ))}
      </div>
    )
  } else if (tpl.services === 'grid4') {
    body = (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((sv, i) => (
          <div key={sv.id} className={`${sk.cardCls} p-5 text-center`} style={sk.cardStyle}>
            <span className={`grid place-items-center size-14 ${sk.iconShape} mx-auto mb-3`} style={sk.icon(i)}><Icon name={sv.icon} className="size-7" /></span>
            <Editable as="h3" path={`services.${sv.id}.title`} className="site-head font-bold text-[1rem] mb-1" style={{ color: 'var(--tl-ink)' }}>{sv.title}</Editable>
            <Editable as="p" path={`services.${sv.id}.desc`} multiline className="text-[.82rem]" style={{ color: 'var(--tl-slate)' }}>{sv.desc}</Editable>
          </div>
        ))}
      </div>
    )
  } else {
    body = (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((sv, i) => (
          <div key={sv.id} className={`${sk.cardCls} p-6 flex gap-4 items-start`} style={sk.cardStyle}>
            <span className={`grid place-items-center size-[54px] ${sk.iconShape} shrink-0`} style={sk.icon(i)}><Icon name={sv.icon} className="size-[26px]" /></span>
            <div><Editable as="h3" path={`services.${sv.id}.title`} className="site-head font-bold text-[1.05rem] mb-1" style={{ color: 'var(--tl-ink)' }}>{sv.title}</Editable><Editable as="p" path={`services.${sv.id}.desc`} multiline className="text-[.9rem]" style={{ color: 'var(--tl-slate)' }}>{sv.desc}</Editable></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section id="dich-vu" className="py-14 lg:py-24" style={{ background: sk.bgAlt }}>
      <div className="container">{head}{body}</div>
    </section>
  )
}

/* ============ ABOUT ============ */
export function About() {
  const a = useContent((s) => s.published.about)
  const tpl = useTemplate()
  const sk = useSkin()

  const Photo = (
    <div className="lg:sticky lg:top-24 max-w-[400px] w-full justify-self-center">
      <div className="relative rounded-[24px] overflow-hidden border shadow-[0_24px_50px_rgba(16,40,80,.16)]" style={{ borderColor: 'var(--tl-line)' }}>
        <EditableImage path="about.photoUrl" src={a.photoUrl} alt={a.photoName} className="w-full object-cover" style={{ aspectRatio: '4/5', objectPosition: 'top center' }} />
        <div className="absolute inset-x-0 bottom-0 px-5 pt-10 pb-4 text-white" style={{ background: 'linear-gradient(0deg,var(--tl-deep),transparent)' }}>
          <Editable as="b" path="about.photoName" className="block site-head font-bold text-[1.16rem]">{a.photoName}</Editable><Editable as="span" path="about.photoRole" className="text-[.86rem] text-white/85">{a.photoRole}</Editable>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {a.tags.map((t, i) => <Editable as="span" key={i} path={`about.tags.${i}`} className="text-[.82rem] font-semibold rounded-full px-3 py-1.5" style={sk.icon(i)}>{t}</Editable>)}
      </div>
    </div>
  )

  const Credentials = (
    <div className="grid sm:grid-cols-2 gap-3">
      {a.credentials.map((c, i) => (
        <div key={c.id} className={`${sk.cardCls} flex gap-3 items-start p-4`} style={sk.cardStyle}>
          <span className={`grid place-items-center size-10 ${sk.iconShape} shrink-0`} style={sk.icon(i)}><Icon name={c.icon} className="size-5" /></span>
          <span><Editable as="b" path={`about.credentials.${c.id}.title`} className="block text-[.92rem] font-bold" style={{ color: 'var(--tl-ink)' }}>{c.title}</Editable><Editable as="span" path={`about.credentials.${c.id}.sub`} className="text-[.82rem]" style={{ color: 'var(--tl-slate)' }}>{c.sub}</Editable></span>
        </div>
      ))}
    </div>
  )

  if (tpl.about === 'quote') {
    return (
      <section id="gioi-thieu" className="py-14 lg:py-24" style={{ background: sk.bgTint }}>
        <div className="container max-w-4xl text-center">
          <EditableImage path="about.photoUrl" src={a.photoUrl} alt={a.photoName} className="size-28 rounded-full object-cover mx-auto border-4 border-white shadow-lg" style={{ objectPosition: 'top center' }} />
          <div className="mt-5 flex justify-center"><Eyebrow center path="about.eyebrow">{a.eyebrow}</Eyebrow></div>
          <blockquote className="site-head font-semibold italic text-[clamp(1.3rem,2.6vw,1.9rem)] leading-snug mt-4" style={{ color: 'var(--tl-ink)' }}>“<Editable path="about.quote" multiline>{a.quote}</Editable>”</blockquote>
          <div className="mt-4"><Editable as="b" path="about.photoName" className="site-head font-bold text-[1.1rem]" style={{ color: 'var(--tl-ink)' }}>{a.photoName}</Editable><Editable as="span" path="about.photoRole" className="block text-[.9rem]" style={{ color: 'var(--tl-slate)' }}>{a.photoRole}</Editable></div>
          <div className="mt-8 text-left">{Credentials}</div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {a.tags.map((t, i) => <Editable as="span" key={i} path={`about.tags.${i}`} className="text-[.82rem] font-semibold rounded-full px-3 py-1.5" style={sk.icon(i)}>{t}</Editable>)}
          </div>
        </div>
      </section>
    )
  }

  const Body = (
    <div>
      <Eyebrow path="about.eyebrow">{a.eyebrow}</Eyebrow>
      <Title text={a.title} hi={a.titleHighlight} path="about.title" hiPath="about.titleHighlight" />
      <div className="mt-5 space-y-4">
        {a.paragraphs.map((p, i) => <Editable as="p" key={i} path={`about.paragraphs.${i}`} multiline className="text-[1.04rem]" style={{ color: '#334A63' }}>{p}</Editable>)}
      </div>
      <div className="mt-6">{Credentials}</div>
      <blockquote className="mt-6 rounded-2xl px-6 py-5" style={{ background: 'var(--tl-soft)', borderLeft: '4px solid var(--tl-accent)' }}>
        <p className="site-head font-semibold italic text-[1.14rem] leading-relaxed" style={{ color: 'var(--tl-ink)' }}>“<Editable path="about.quote" multiline>{a.quote}</Editable>”</p>
        <cite className="block mt-2 not-italic text-[.86rem] font-semibold" style={{ color: 'var(--tl-slate)' }}>— <Editable path="about.quoteCite">{a.quoteCite}</Editable></cite>
      </blockquote>
    </div>
  )

  const reverse = tpl.about === 'imageRight'
  return (
    <section id="gioi-thieu" className="py-14 lg:py-24">
      <div className={`container grid gap-9 items-start ${reverse ? 'lg:grid-cols-[1.18fr_.82fr]' : 'lg:grid-cols-[.82fr_1.18fr]'}`}>
        {reverse ? <>{Body}{Photo}</> : <>{Photo}{Body}</>}
      </div>
    </section>
  )
}

/* ============ SPECIALTIES ============ */
export function Specialties() {
  const { specialties, specialtiesEyebrow, specialtiesTitle, specialtiesTitleHighlight } = useContent((s) => s.published)
  const tpl = useTemplate()
  const sk = useSkin()
  const head = <div className="max-w-[640px] mx-auto text-center mb-11 flex flex-col items-center"><Eyebrow center path="specialtiesEyebrow">{specialtiesEyebrow}</Eyebrow><Title text={specialtiesTitle} hi={specialtiesTitleHighlight} path="specialtiesTitle" hiPath="specialtiesTitleHighlight" /></div>

  let body: React.ReactNode
  if (tpl.specialties === 'list') {
    body = (
      <div className="flex flex-wrap justify-center gap-3">
        {specialties.map((sp, i) => (
          <div key={sp.id} className="inline-flex items-center gap-2.5 pl-2.5 pr-5 py-2 rounded-full border bg-white transition-colors hover:border-[var(--tl-primary)] hover:shadow-sm" style={{ borderColor: 'var(--tl-line)' }}>
            <span className="grid place-items-center size-9 rounded-full" style={sk.icon(i)}><Icon name={sp.icon} className="size-5" /></span>
            <Editable as="b" path={`specialties.${sp.id}.title`} className="site-head font-semibold text-[.98rem]" style={{ color: 'var(--tl-ink)' }}>{sp.title}</Editable>
          </div>
        ))}
      </div>
    )
  } else if (tpl.specialties === 'squares') {
    body = (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {specialties.map((sp, i) => (
          <div key={sp.id} className={`${sk.cardCls} relative overflow-hidden p-5`} style={sk.cardStyle}>
            <span className="absolute right-0 top-0 size-16 rounded-bl-[2rem]" style={{ background: sk.soft(i) }} />
            <span className={`relative grid place-items-center size-12 ${sk.iconShape} mb-8`} style={sk.icon(i)}><Icon name={sp.icon} className="size-6" /></span>
            <Editable as="b" path={`specialties.${sp.id}.title`} className="relative site-head font-bold text-[1rem] block" style={{ color: 'var(--tl-ink)' }}>{sp.title}</Editable>
          </div>
        ))}
      </div>
    )
  } else {
    body = (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {specialties.map((sp, i) => (
          <div key={sp.id} className={`${sk.cardCls} text-center py-7 px-4`} style={sk.cardStyle}>
            <span className="grid place-items-center size-[62px] mx-auto mb-3.5 rounded-full" style={sk.icon(i)}><Icon name={sp.icon} className="size-[30px]" /></span>
            <Editable as="b" path={`specialties.${sp.id}.title`} className="site-head font-bold text-[1rem]" style={{ color: 'var(--tl-ink)' }}>{sp.title}</Editable>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section id="chuyen-mon" className="py-14 lg:py-24" style={{ background: sk.bgAlt }}>
      <div className="container">{head}{body}</div>
    </section>
  )
}

/* ============ JOURNEY ============ */
export function Journey() {
  const { timeline, research, journeyEyebrow, journeyTitle, journeyTitleHighlight } = useContent((s) => s.published)
  const sk = useSkin()
  const tabs = [...timeline, { id: 'res', key: 'res', label: 'Nghiên cứu' } as any]
  const [active, setActive] = useState(tabs[0]?.key ?? '')
  const cur = timeline.find((t) => t.key === active)
  return (
    <section id="dao-tao" className="py-14 lg:py-24">
      <div className="container">
        <Eyebrow path="journeyEyebrow">{journeyEyebrow}</Eyebrow>
        <Title text={journeyTitle} hi={journeyTitleHighlight} path="journeyTitle" hiPath="journeyTitleHighlight" />
        <div className="flex gap-2 flex-wrap mt-6 mb-9">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActive(t.key)} className="font-semibold text-[.92rem] rounded-full px-5 py-2.5 border transition"
              style={active === t.key ? { background: 'var(--tl-primary)', color: '#fff', borderColor: 'var(--tl-primary)' } : { background: '#fff', color: 'var(--tl-slate)', borderColor: 'var(--tl-line)' }}>{t.label}</button>
          ))}
        </div>
        {cur && (
          <div className={cur.twoCol ? 'grid md:grid-cols-2 gap-x-11' : ''}>
            {(cur.twoCol ? splitTwo(cur.items) : [cur.items]).map((group, gi) => (
              <div key={gi} className="relative pl-8">
                <span className="absolute left-2 top-1.5 bottom-1.5 w-0.5" style={{ background: 'var(--tl-line)' }} />
                {group.map((it) => (
                  <div key={it.id} className="relative pb-6 last:pb-0">
                    <span className="absolute -left-[26px] top-1.5 size-3 rounded-full bg-white" style={{ border: `3px solid ${it.now ? 'var(--tl-accent)' : 'var(--tl-primary)'}` }} />
                    <div className="font-bold text-[.8rem] uppercase tracking-wide mb-0.5" style={{ color: 'var(--tl-primary)' }}><Editable path={`timeline.${cur.id}.items.${it.id}.year`} style={it.now ? { color: 'var(--tl-accent)', fontStyle: 'normal' } : undefined}>{it.year}</Editable></div>
                    <Editable as="b" path={`timeline.${cur.id}.items.${it.id}.title`} className="block site-head font-semibold text-[1.05rem]" style={{ color: 'var(--tl-ink)' }}>{it.title}</Editable>
                    <Editable as="span" path={`timeline.${cur.id}.items.${it.id}.place`} className="text-[.93rem]" style={{ color: 'var(--tl-slate)' }}>{it.place}</Editable>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {active === 'res' && (
          <div className="grid md:grid-cols-2 gap-5">
            {research.map((r, i) => (
              <div key={r.id} className={`${sk.cardCls} p-7 flex gap-5 items-start`} style={sk.cardStyle}>
                <Editable path={`research.${r.id}.year`} className={`grid place-items-center size-[74px] ${sk.iconShape} site-head font-bold text-[1.4rem] shrink-0`} style={sk.icon(i)}>{r.year}</Editable>
                <div><Editable as="h3" path={`research.${r.id}.title`} multiline className="site-head font-semibold text-[1.06rem] leading-snug">{r.title}</Editable>
                  <span className="mt-3 inline-flex items-center gap-2 text-[.78rem] font-bold rounded-full px-3 py-1" style={{ color: 'var(--tl-primary)', background: 'var(--tl-soft)' }}><span className="size-1.5 rounded-full" style={{ background: 'var(--tl-accent)' }} /><Editable path={`research.${r.id}.tag`}>{r.tag}</Editable></span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
function splitTwo<T>(arr: T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2)
  return [arr.slice(0, mid), arr.slice(mid)]
}

/* ============ CONTACT ============ */
export function Contact() {
  const { info, contactEyebrow, contactTitle, contactTitleHighlight, contactLead } = useContent((s) => s.published)
  const sk = useSkin()
  const q = encodeURIComponent(`${info.address} ${info.addressNote}`)
  return (
    <section id="lien-he" className="py-14 lg:py-24" style={{ background: sk.bgAlt }}>
      <div className="container">
        <div className="max-w-full mb-10">
          <Eyebrow path="contactEyebrow">{contactEyebrow}</Eyebrow>
          <Title text={contactTitle} hi={contactTitleHighlight} path="contactTitle" hiPath="contactTitleHighlight" />
          <Editable as="p" path="contactLead" multiline className="mt-3 text-[1.05rem]" style={{ color: 'var(--tl-slate)' }}>{contactLead}</Editable>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="grid gap-3 mb-4">
              <ContactLine i={0} icon={<Phone className="size-[22px]" />} small="Hotline"><a href={`tel:${info.phone.replace(/\s/g, '')}`} style={{ color: 'var(--tl-ink)' }}><Editable path="info.phone">{info.phone}</Editable></a></ContactLine>
              <ContactLine i={1} icon={<MapPin className="size-[22px]" />} small="Địa chỉ"><Editable as="span" path="info.address" style={{ color: 'var(--tl-ink)' }}>{info.address}</Editable><Editable as="p" path="info.addressNote" className="text-[.9rem] font-normal" style={{ color: 'var(--tl-slate)' }}>{info.addressNote}</Editable></ContactLine>
            </div>
            <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(130deg,var(--tl-primary),var(--tl-deep))' }}>
              <b className="site-head font-semibold text-[1.05rem] flex items-center gap-2.5"><Clock className="size-5 text-white/90" /> Giờ làm việc</b>
              <ul className="mt-3.5 grid gap-2.5">
                {info.hours.map((h) => <li key={h.id} className="flex justify-between text-[.93rem] text-white/75 pb-2.5 border-b border-white/10 last:border-0 last:pb-0"><Editable path={`info.hours.${h.id}.label`}>{h.label}</Editable> <Editable path={`info.hours.${h.id}.value`} className="text-white font-semibold">{h.value}</Editable></li>)}
              </ul>
            </div>
          </div>
          <div className="rounded-[24px] overflow-hidden border shadow-lg min-h-[440px]" style={{ borderColor: 'var(--tl-line)', background: '#e6eef7' }}>
            <iframe title="Bản đồ" loading="lazy" className="w-full h-full min-h-[540px] border-0" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${q}&output=embed`} />
          </div>
        </div>
      </div>
    </section>
  )
}
function ContactLine({ i, icon, small, children }: { i: number; icon: React.ReactNode; small: string; children: React.ReactNode }) {
  const sk = useSkin()
  return (
    <div className={`${sk.cardCls} flex gap-4 items-start p-[17px_19px]`} style={sk.cardStyle}>
      <span className={`grid place-items-center size-[46px] ${sk.iconShape} shrink-0`} style={sk.icon(i)}>{icon}</span>
      <span className="min-w-0"><small className="text-[.72rem] tracking-wide uppercase font-bold" style={{ color: 'var(--tl-slate)' }}>{small}</small><b className="block site-head font-semibold text-[1.08rem] mt-0.5">{children}</b></span>
    </div>
  )
}
