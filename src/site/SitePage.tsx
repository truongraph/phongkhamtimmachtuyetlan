import { useContent } from '@/store/content'
import { ThemeStyle } from './ThemeStyle'
import { useTemplate } from './templates'
import { SiteHeader, SiteFooter, FloatingWidgets } from './SiteChrome'
import { Hero, BookingBand, BookingModal, openBooking } from './sections/Hero'
import { Stats, Why, Services, About, Specialties, Journey, Contact, Faq, Testimonials, Pricing, Gallery } from './sections/Sections'
import { CustomRow } from './sections/CustomRow'
import { SeoHead } from './Ecg'
import { EditBridge, Editable } from './edit'
import { Reveal } from './Reveal'
import { Phone } from 'lucide-react'
import type { SectionType } from '@/store/content'

const MAP: Record<Exclude<SectionType, 'row'>, () => JSX.Element> = {
  stats: Stats, why: Why, services: Services, about: About, specialties: Specialties, journey: Journey,
  faq: Faq, testimonials: Testimonials, pricing: Pricing, gallery: Gallery, contact: Contact,
}

function FinalCta() {
  const { info, cta } = useContent((s) => s.published)
  const tel = info.phone.replace(/\s/g, '')
  return (
    <section className="relative overflow-hidden py-16 text-center border-t" style={{ background: 'linear-gradient(180deg,var(--tl-soft),var(--tl-tint))', borderColor: 'var(--tl-line)' }}>
      <div className="container relative">
        <h2 className="site-head font-bold text-[clamp(1.7rem,4vw,2.6rem)]" style={{ color: 'var(--tl-ink)' }}><Editable path="cta.title">{cta.title}</Editable> <Editable path="cta.titleHighlight" style={{ color: 'var(--tl-accent)' }}>{cta.titleHighlight}</Editable></h2>
        <Editable as="p" path="cta.lead" multiline className="mt-4 max-w-[52ch] mx-auto" style={{ color: 'var(--tl-slate)' }}>{cta.lead}</Editable>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <a href={`tel:${tel}`} className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 font-semibold text-white" style={{ background: 'var(--tl-accent)' }}><Phone className="size-[18px]" /> Gọi {info.phone}</a>
          <a href="#dat-lich" onClick={(e) => { e.preventDefault(); openBooking() }} className="inline-flex items-center rounded-lg px-6 py-3.5 font-semibold text-white" style={{ background: 'var(--tl-primary)' }}>Đặt lịch khám</a>
        </div>
      </div>
    </section>
  )
}

export default function SitePage() {
  const { info, sections } = useContent((s) => s.published)
  const tpl = useTemplate()
  const tel = info.phone.replace(/\s/g, '')
  return (
    <div className="tl-site bg-white" style={{ color: 'var(--tl-ink)' } as any} id="top">
      <ThemeStyle />
      <SeoHead />
      <SiteHeader tel={tel} />
      <main>
        <Hero />
        {tpl.hero !== 'form' && <BookingBand />}
        {sections.filter((s) => s.visible).map((s) => {
          if (s.type === 'row') return s.row ? <CustomRow key={s.id ?? s.type} block={s.row} base={`sections.${s.id ?? s.type}`} /> : null
          const Cmp = MAP[s.type]
          return <Cmp key={s.id ?? s.type} />
        })}
        <FinalCta />
      </main>
      <SiteFooter />
      <FloatingWidgets />
      <BookingModal />
      <EditBridge />
      <Reveal />
    </div>
  )
}
