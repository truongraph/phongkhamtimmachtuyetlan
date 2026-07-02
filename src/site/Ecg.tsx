import { useEffect } from 'react'
import { useContent } from '@/store/content'

export function SeoHead() {
  const { info } = useContent((s) => s.published)
  useEffect(() => {
    document.title = `${info.clinicName} · ${info.tagline}`
    let m = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = `${info.clinicName} — ${info.slogan}. Đặt lịch: ${info.phone}. ${info.address} ${info.addressNote}.`
  }, [info.clinicName, info.tagline, info.slogan, info.phone, info.address, info.addressNote])
  return null
}
