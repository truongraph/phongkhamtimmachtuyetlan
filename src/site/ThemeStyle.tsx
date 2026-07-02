import { useContent } from '@/store/content'
import { useTemplate, previewTemplateId, getTemplate } from './templates'
import { fontStack, googleFontsHref } from '@/lib/fonts'

// Làm NHẠT màu bằng cách trộn về phía trắng theo tỉ lệ p (0..1) — GIỮ ĐÚNG tông màu
// (không bị lệch sang xanh cyan như cách cộng thẳng vào từng kênh RGB).
function tintWhite(hex: string, p: number) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const mix = (c: number) => Math.round(c + (255 - c) * p)
  return `#${((1 << 24) + (mix(r) << 16) + (mix(g) << 8) + mix(b)).toString(16).slice(1)}`
}

export function ThemeStyle() {
  const saved = useContent((s) => s.published.theme)
  const tpl = useTemplate()
  // Khi đang XEM THỬ một mẫu (?tpl=…): dùng màu/phông/bo góc của mẫu đó (giống hệt khi bấm Áp dụng),
  // nhưng KHÔNG ghi vào dữ liệu đã lưu. Ngược lại dùng đúng theme đang lưu.
  const previewId = previewTemplateId()
  const t = previewId
    ? (() => {
        const pt = getTemplate(previewId).theme
        return {
          ...saved,
          primary: pt.primary, navy: pt.navy, accent: pt.accent, headingFont: pt.headingFont, radius: pt.radius,
          fontHeading: pt.headingFont === 'display' ? 'Lora' : 'Inter', fontBody: 'Inter',
        }
      })()
    : saved
  const headFont = t.fontHeading || (t.headingFont === 'display' ? 'Lora' : 'Inter')
  const bodyFont = t.fontBody || 'Inter'
  // Nút bám theo bo góc trong Cài đặt chung; pill/vuông giữ nét riêng của mẫu.
  const btn = tpl.button === 'pill' ? '999px' : tpl.button === 'square' ? '3px' : `${t.radius}px`
  const css = `.tl-site{
    --tl-primary:${t.primary};
    --tl-navy:${t.navy};
    --tl-accent:${t.accent};
    --tl-soft:${tintWhite(t.primary, 0.86)};
    --tl-tint:${tintWhite(t.primary, 0.93)};
    --tl-deep:color-mix(in srgb, var(--tl-primary) 72%, #12335f);
    --tl-radius:${t.radius}px;
    --tl-btn:${btn};
    --tl-head:${fontStack(headFont)};
    font-family:${fontStack(bodyFont)};
  }`
  const href = googleFontsHref([headFont, bodyFont])
  return (
    <>
      {href && <link rel="stylesheet" href={href} />}
      <style>{css}</style>
    </>
  )
}
