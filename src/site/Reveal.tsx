import { useEffect } from 'react'
import { isEditMode } from '@/lib/editMode'

// Hiệu ứng "xuất hiện khi cuộn": mỗi phần mờ + trượt lên khi lọt vào khung nhìn.
const CSS = `
.tl-reveal{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1);will-change:opacity,transform}
.tl-reveal-in{opacity:1;transform:none}
@media (prefers-reduced-motion: reduce){.tl-reveal,.tl-reveal-in{opacity:1!important;transform:none!important;transition:none!important}}
`

/**
 * Gắn hiệu ứng xuất hiện cho các <section> trong <main>.
 * - Tắt hoàn toàn khi đang SỬA (?edit=1) để không che/giật khi chỉnh.
 * - Phần đang ở trên màn hình lúc tải (hero…) hiện luôn, không animate.
 */
export function Reveal() {
  useEffect(() => {
    if (isEditMode()) return
    const style = document.createElement('style')
    style.dataset.tlReveal = ''
    style.textContent = CSS
    document.head.appendChild(style)

    let io: IntersectionObserver | null = null
    const raf = requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.tl-site main > section'))
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('tl-reveal-in'); io?.unobserve(e.target) } }),
        { rootMargin: '0px 0px -12% 0px', threshold: 0.06 },
      )
      const vh = window.innerHeight || 800
      els.forEach((el, i) => {
        el.classList.add('tl-reveal')
        const top = el.getBoundingClientRect().top
        if (i === 0 || top < vh * 0.9) el.classList.add('tl-reveal-in') // trên màn hình sẵn → hiện ngay
        else io!.observe(el)
      })
    })

    return () => {
      cancelAnimationFrame(raf)
      io?.disconnect()
      style.remove()
      document.querySelectorAll('.tl-reveal').forEach((el) => el.classList.remove('tl-reveal', 'tl-reveal-in'))
    }
  }, [])
  return null
}
