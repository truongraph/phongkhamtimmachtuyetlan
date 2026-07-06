import { useContent } from '@/store/content'
import type { SectionType } from '@/store/content'

export type HeaderVariant = 'utility' | 'simple' | 'centered' | 'bar'
export type HeroVariant = 'form' | 'split' | 'centered' | 'imageLeft' | 'statband'
export type CardVariant = 'shadow' | 'outline' | 'flat' | 'filled'
export type ButtonShape = 'rounded' | 'pill' | 'square'
export type ImageShape = 'arch' | 'rounded' | 'circle' | 'square'

// Bố cục riêng cho từng khu vực — giúp mỗi mẫu có CẤU TRÚC khác nhau, không chỉ khác màu.
export type StatsVar = 'band' | 'cards' | 'inline'
export type WhyVar = 'cards' | 'iconTop' | 'bordered'
export type ServicesVar = 'cards' | 'list' | 'alt' | 'grid4'
export type SpecVar = 'pills' | 'squares' | 'list'
export type AboutVar = 'imageLeft' | 'imageRight' | 'quote'

// "Da" (skin) — cá tính hình ảnh riêng của mỗi mẫu, không chỉ khác bố cục & màu.
export type IconTreat = 'rainbow' | 'brand' | 'solid' | 'outline' | 'tintbox'
export type EyebrowVar = 'pill' | 'bar' | 'line' | 'solid'
export type Rhythm = 'zebra' | 'tinted' | 'plain' | 'soft'

export interface SiteTemplate {
  id: string
  name: string
  desc: string
  theme: { primary: string; navy: string; accent: string; headingFont: 'display' | 'sans'; radius: number }
  header: HeaderVariant
  hero: HeroVariant
  card: CardVariant
  button: ButtonShape
  image: ImageShape
  stats: StatsVar
  why: WhyVar
  services: ServicesVar
  specialties: SpecVar
  about: AboutVar
  /** Cách tô biểu tượng: nhiều màu / đơn sắc thương hiệu / nền đặc / viền / ô nền nhạt. */
  icons: IconTreat
  /** Kiểu nhãn nhỏ trên tiêu đề mỗi khu vực. */
  eyebrow: EyebrowVar
  /** Nhịp nền các khu vực (xen kẽ / nền màu nhạt / gần như trắng). */
  rhythm: Rhythm
}

export const TEMPLATES: SiteTemplate[] = [
  { id: 'classic', name: 'Cổ điển', desc: 'Thanh thông tin, hero kèm form, dải số liệu navy, dịch vụ dạng thẻ.', theme: { primary: '#0070F4', navy: '#00B63E', accent: '#d81e28', headingFont: 'display', radius: 14 }, header: 'utility', hero: 'form', card: 'shadow', button: 'rounded', image: 'arch', stats: 'band', why: 'cards', services: 'cards', specialties: 'pills', about: 'imageLeft', icons: 'brand', eyebrow: 'pill', rhythm: 'zebra' },
  { id: 'modern', name: 'Hiện đại', desc: 'Header gọn, hero chia đôi, số liệu thẻ nổi, dịch vụ lưới 4, chuyên môn ô vuông.', theme: { primary: '#1e6fd0', navy: '#123a63', accent: '#ff4757', headingFont: 'sans', radius: 18 }, header: 'simple', hero: 'split', card: 'outline', button: 'pill', image: 'rounded', stats: 'cards', why: 'iconTop', services: 'grid4', specialties: 'squares', about: 'imageRight', icons: 'brand', eyebrow: 'line', rhythm: 'plain' },
  { id: 'minimal', name: 'Tối giản', desc: 'Hero căn giữa, số liệu inline, dịch vụ dạng danh sách, trích dẫn nổi bật.', theme: { primary: '#334155', navy: '#0f172a', accent: '#dc2626', headingFont: 'sans', radius: 6 }, header: 'simple', hero: 'centered', card: 'flat', button: 'square', image: 'square', stats: 'inline', why: 'bordered', services: 'list', specialties: 'list', about: 'quote', icons: 'outline', eyebrow: 'line', rhythm: 'plain' },
  { id: 'editorial', name: 'Tạp chí', desc: 'Menu căn giữa kiểu bài báo, dịch vụ xen kẽ hàng lớn, serif sang trọng.', theme: { primary: '#1b3a6b', navy: '#0c1f3d', accent: '#b91c1c', headingFont: 'display', radius: 12 }, header: 'centered', hero: 'imageLeft', card: 'flat', button: 'rounded', image: 'rounded', stats: 'inline', why: 'bordered', services: 'alt', specialties: 'list', about: 'imageRight', icons: 'outline', eyebrow: 'bar', rhythm: 'plain' },
  { id: 'green-med', name: 'Y khoa xanh lá', desc: 'Hero dải số liệu, số liệu thẻ, dịch vụ lưới 4, tông xanh lá tươi.', theme: { primary: '#1a936f', navy: '#114b3a', accent: '#e63946', headingFont: 'sans', radius: 16 }, header: 'utility', hero: 'statband', card: 'filled', button: 'rounded', image: 'arch', stats: 'cards', why: 'cards', services: 'grid4', specialties: 'squares', about: 'imageLeft', icons: 'solid', eyebrow: 'solid', rhythm: 'soft' },
  { id: 'ocean', name: 'Đại dương', desc: 'Header màu, hero chia đôi, dịch vụ danh sách, cam kết icon giữa, xanh biển.', theme: { primary: '#0284c7', navy: '#075985', accent: '#f43f5e', headingFont: 'sans', radius: 18 }, header: 'bar', hero: 'split', card: 'shadow', button: 'pill', image: 'circle', stats: 'band', why: 'iconTop', services: 'list', specialties: 'pills', about: 'imageRight', icons: 'rainbow', eyebrow: 'pill', rhythm: 'tinted' },
  { id: 'navy-gold', name: 'Cao cấp Navy-Gold', desc: 'Menu căn giữa, hero kèm form, dịch vụ hàng lớn xen kẽ, vàng đồng sang.', theme: { primary: '#1b3a6b', navy: '#0c1f3d', accent: '#c9a227', headingFont: 'display', radius: 8 }, header: 'centered', hero: 'form', card: 'outline', button: 'square', image: 'square', stats: 'inline', why: 'bordered', services: 'alt', specialties: 'squares', about: 'quote', icons: 'tintbox', eyebrow: 'bar', rhythm: 'plain' },
  { id: 'teal-calm', name: 'Teal thư giãn', desc: 'Hero căn giữa nhẹ nhàng, số liệu thẻ, dịch vụ thẻ, xanh ngọc dịu.', theme: { primary: '#0e7c86', navy: '#0a4d54', accent: '#ef4444', headingFont: 'sans', radius: 16 }, header: 'simple', hero: 'centered', card: 'filled', button: 'rounded', image: 'circle', stats: 'cards', why: 'iconTop', services: 'cards', specialties: 'pills', about: 'imageLeft', icons: 'brand', eyebrow: 'pill', rhythm: 'soft' },
  { id: 'purple', name: 'Tím chuyên sâu', desc: 'Thanh thông tin, hero chia đôi, dịch vụ lưới 4, chuyên môn ô vuông, tím hiện đại.', theme: { primary: '#6d28d9', navy: '#3b0764', accent: '#f59e0b', headingFont: 'sans', radius: 16 }, header: 'utility', hero: 'split', card: 'shadow', button: 'pill', image: 'rounded', stats: 'band', why: 'cards', services: 'grid4', specialties: 'squares', about: 'imageRight', icons: 'rainbow', eyebrow: 'solid', rhythm: 'zebra' },
  { id: 'rose', name: 'Hồng sản/nhi', desc: 'Menu căn giữa, hero ảnh trái, dịch vụ danh sách, cam kết icon giữa, hồng ấm.', theme: { primary: '#be185d', navy: '#6b1338', accent: '#0ea5e9', headingFont: 'display', radius: 18 }, header: 'centered', hero: 'imageLeft', card: 'filled', button: 'rounded', image: 'circle', stats: 'cards', why: 'iconTop', services: 'list', specialties: 'pills', about: 'imageLeft', icons: 'tintbox', eyebrow: 'pill', rhythm: 'soft' },
  { id: 'orange', name: 'Cam năng động', desc: 'Header màu, hero dải số liệu, dịch vụ hàng lớn xen kẽ, cam ấm.', theme: { primary: '#ea580c', navy: '#7c2d12', accent: '#0f766e', headingFont: 'sans', radius: 16 }, header: 'bar', hero: 'statband', card: 'outline', button: 'pill', image: 'rounded', stats: 'inline', why: 'bordered', services: 'alt', specialties: 'squares', about: 'imageRight', icons: 'solid', eyebrow: 'bar', rhythm: 'tinted' },
  { id: 'graphite', name: 'Than chì', desc: 'Header gọn, hero kèm form, số liệu inline, dịch vụ danh sách, xám than tối giản.', theme: { primary: '#0f766e', navy: '#1e293b', accent: '#f97316', headingFont: 'sans', radius: 8 }, header: 'simple', hero: 'form', card: 'flat', button: 'square', image: 'square', stats: 'inline', why: 'bordered', services: 'list', specialties: 'list', about: 'quote', icons: 'outline', eyebrow: 'line', rhythm: 'plain' },
  { id: 'indigo', name: 'Indigo công nghệ', desc: 'Header màu, hero căn giữa, số liệu thẻ, dịch vụ lưới 4, chàm hiện đại.', theme: { primary: '#4338ca', navy: '#23227a', accent: '#ec4899', headingFont: 'sans', radius: 16 }, header: 'bar', hero: 'centered', card: 'shadow', button: 'rounded', image: 'rounded', stats: 'cards', why: 'cards', services: 'grid4', specialties: 'squares', about: 'imageLeft', icons: 'brand', eyebrow: 'solid', rhythm: 'tinted' },
  { id: 'cyan', name: 'Cyan trong trẻo', desc: 'Thanh thông tin, hero chia đôi, dải số liệu navy, cam kết icon giữa, lục lam dịu.', theme: { primary: '#0891b2', navy: '#0e4a5a', accent: '#ef4444', headingFont: 'sans', radius: 18 }, header: 'utility', hero: 'split', card: 'filled', button: 'pill', image: 'arch', stats: 'band', why: 'iconTop', services: 'cards', specialties: 'pills', about: 'imageRight', icons: 'rainbow', eyebrow: 'pill', rhythm: 'soft' },
  { id: 'forest', name: 'Rừng emerald', desc: 'Menu căn giữa, hero dải số liệu, dịch vụ hàng lớn xen kẽ, xanh rừng sâu.', theme: { primary: '#047857', navy: '#052e2b', accent: '#f59e0b', headingFont: 'display', radius: 14 }, header: 'centered', hero: 'statband', card: 'outline', button: 'rounded', image: 'arch', stats: 'cards', why: 'bordered', services: 'alt', specialties: 'squares', about: 'imageLeft', icons: 'solid', eyebrow: 'bar', rhythm: 'plain' },
  { id: 'sky', name: 'Trời xanh nhẹ', desc: 'Header gọn, hero căn giữa thoáng, số liệu inline, dịch vụ lưới 4, xanh da trời.', theme: { primary: '#0ea5e9', navy: '#0c4a6e', accent: '#f43f5e', headingFont: 'sans', radius: 18 }, header: 'simple', hero: 'centered', card: 'outline', button: 'pill', image: 'circle', stats: 'inline', why: 'iconTop', services: 'grid4', specialties: 'pills', about: 'quote', icons: 'brand', eyebrow: 'pill', rhythm: 'plain' },
  { id: 'crimson', name: 'Đỏ y tế', desc: 'Thanh thông tin, hero kèm form, dải số liệu navy, dịch vụ thẻ, đỏ tin cậy.', theme: { primary: '#dc2626', navy: '#7f1d1d', accent: '#2563eb', headingFont: 'display', radius: 12 }, header: 'utility', hero: 'form', card: 'shadow', button: 'rounded', image: 'arch', stats: 'band', why: 'cards', services: 'cards', specialties: 'squares', about: 'imageLeft', icons: 'solid', eyebrow: 'solid', rhythm: 'zebra' },
  { id: 'mint', name: 'Bạc hà', desc: 'Header màu, hero chia đôi, số liệu thẻ, dịch vụ danh sách, xanh bạc hà tươi.', theme: { primary: '#059669', navy: '#064e3b', accent: '#f97316', headingFont: 'sans', radius: 16 }, header: 'bar', hero: 'split', card: 'filled', button: 'pill', image: 'rounded', stats: 'cards', why: 'iconTop', services: 'list', specialties: 'pills', about: 'imageRight', icons: 'brand', eyebrow: 'line', rhythm: 'soft' },
  { id: 'slate-pro', name: 'Slate chuyên nghiệp', desc: 'Header gọn, hero ảnh trái, số liệu inline, dịch vụ hàng lớn, xám xanh nghiêm túc.', theme: { primary: '#475569', navy: '#1e293b', accent: '#0ea5e9', headingFont: 'sans', radius: 8 }, header: 'simple', hero: 'imageLeft', card: 'flat', button: 'square', image: 'square', stats: 'inline', why: 'bordered', services: 'alt', specialties: 'list', about: 'quote', icons: 'outline', eyebrow: 'line', rhythm: 'plain' },
  { id: 'amber', name: 'Hổ phách ấm', desc: 'Menu căn giữa, hero dải số liệu, số liệu thẻ, dịch vụ lưới 4, vàng hổ phách.', theme: { primary: '#d97706', navy: '#78350f', accent: '#0d9488', headingFont: 'display', radius: 14 }, header: 'centered', hero: 'statband', card: 'outline', button: 'rounded', image: 'arch', stats: 'cards', why: 'bordered', services: 'grid4', specialties: 'squares', about: 'imageLeft', icons: 'tintbox', eyebrow: 'bar', rhythm: 'soft' },
]

export function getTemplate(id: string): SiteTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}

/** Id mẫu cần XEM THỬ lấy từ URL (?tpl=…) — chỉ để render preview, KHÔNG đổi dữ liệu đã lưu. */
export function previewTemplateId(): string | null {
  if (typeof window === 'undefined') return null
  const id = new URLSearchParams(window.location.search).get('tpl')
  return id && TEMPLATES.some((t) => t.id === id) ? id : null
}

export function useTemplate(): SiteTemplate {
  const id = useContent((s) => s.published.template)
  return getTemplate(previewTemplateId() ?? id)
}

/**
 * Biến thể bố cục HIỆU LỰC cho một khu vực: ưu tiên phần ghi đè lưu trong `sections`
 * (bác sĩ tự đổi kiểu cho riêng khu vực đó), nếu không có thì theo mẫu (`fallback`).
 * Khi đang XEM THỬ mẫu (?tpl=…) thì bỏ qua ghi đè để thấy đúng bố cục gốc của mẫu.
 */
export function useVariant<T extends string>(type: SectionType, fallback: T): T {
  const ov = useContent((s) => s.published.sections.find((x) => x.type === type)?.variant)
  if (previewTemplateId()) return fallback
  return (ov as T) || fallback
}

export function btnRadius(shape: ButtonShape) {
  return shape === 'pill' ? '999px' : shape === 'square' ? '3px' : '10px'
}

export function cardClass(v: CardVariant): string {
  switch (v) {
    case 'outline': return 'bg-white border-[1.5px] hover:border-[var(--tl-primary)] transition-colors'
    case 'flat': return 'bg-transparent border-0 border-b rounded-none pb-6 hover:bg-[var(--tl-tint)]/40 transition-colors'
    case 'filled': return 'border-0 hover:-translate-y-1 transition-transform'
    default: return 'bg-white border shadow-sm hover:-translate-y-1 hover:shadow-lg transition'
  }
}
export function cardStyle(v: CardVariant): React.CSSProperties {
  if (v === 'filled') return { background: 'var(--tl-tint)', borderColor: 'var(--tl-line)' }
  return { borderColor: 'var(--tl-line)' }
}

/* ============ SKIN — cá tính hình ảnh của mỗi mẫu ============ */
// Bảng màu nhiều màu (rainbow) cho biểu tượng — dùng khi mẫu chọn icons: 'rainbow'.
const RAINBOW: readonly [string, string][] = [
  ['#E8F0FE', '#2563EB'], ['#E7F8EF', '#0BB14E'], ['#FFF3E2', '#EA580C'],
  ['#FDEAF1', '#DB2777'], ['#F0EAFF', '#7C3AED'], ['#E3F7FA', '#0891B2'],
]

export interface Skin {
  /** Lớp + style cho THẺ (card) — theo kiểu card của mẫu (nổi/viền/phẳng/nền). */
  cardCls: string
  cardStyle: React.CSSProperties
  /** Bo góc ô biểu tượng (tròn/vuông/bo) theo cá tính mẫu. */
  iconShape: string
  /** Style ô biểu tượng theo chỉ số (nhiều màu / đơn sắc / nền đặc / viền / ô nền). */
  icon: (i: number) => React.CSSProperties
  /** Màu nhấn theo chỉ số (dùng cho số thứ tự, chi tiết trang trí). */
  fg: (i: number) => string
  /** Màu nền nhạt theo chỉ số (góc trang trí). */
  soft: (i: number) => string
  /** Nền khu vực xen kẽ (dịch vụ / chuyên môn / liên hệ). */
  bgAlt: string
  /** Nền khu vực tông thương hiệu (dải số liệu, trích dẫn…). */
  bgTint: string
  eyebrow: EyebrowVar
}

export function getSkin(t: SiteTemplate): Skin {
  const radius = 'rounded-[calc(var(--tl-radius)+4px)]'
  const cardMap: Record<CardVariant, { cls: string; style: React.CSSProperties }> = {
    shadow: { cls: `bg-white border ${radius} shadow-[0_4px_18px_rgba(16,40,80,.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(16,40,80,.14)]`, style: { borderColor: 'var(--tl-line)' } },
    outline: { cls: `bg-white border-[1.5px] ${radius} transition-colors hover:border-[var(--tl-primary)]`, style: { borderColor: 'var(--tl-line)' } },
    filled: { cls: `border ${radius} transition-transform duration-200 hover:-translate-y-1`, style: { background: 'var(--tl-tint)', borderColor: 'var(--tl-line)' } },
    flat: { cls: 'bg-transparent border-b rounded-none transition-colors hover:bg-[color-mix(in_srgb,var(--tl-tint)_55%,transparent)]', style: { borderColor: 'var(--tl-line)' } },
  }
  const card = cardMap[t.card]
  const iconShape = t.image === 'circle' ? 'rounded-full' : t.image === 'square' ? 'rounded-lg' : t.theme.radius <= 8 ? 'rounded-xl' : 'rounded-2xl'
  const icon = (i: number): React.CSSProperties => {
    switch (t.icons) {
      case 'rainbow': return { background: RAINBOW[i % RAINBOW.length][0], color: RAINBOW[i % RAINBOW.length][1] }
      case 'solid': return { background: 'linear-gradient(135deg,var(--tl-primary),var(--tl-navy))', color: '#fff' }
      case 'outline': return { background: 'transparent', color: 'var(--tl-primary)', border: '1.5px solid color-mix(in srgb,var(--tl-primary) 32%, var(--tl-line))' }
      case 'tintbox': return { background: 'var(--tl-tint)', color: 'var(--tl-primary)', border: '1px solid var(--tl-line)' }
      default: return { background: 'var(--tl-soft)', color: 'var(--tl-primary)' } // brand
    }
  }
  const fg = (i: number) => (t.icons === 'rainbow' ? RAINBOW[i % RAINBOW.length][1] : 'var(--tl-primary)')
  const soft = (i: number) => (t.icons === 'rainbow' ? RAINBOW[i % RAINBOW.length][0] : 'var(--tl-soft)')
  const bgAlt = t.rhythm === 'plain' ? '#F6F8FB' : t.rhythm === 'tinted' ? 'color-mix(in srgb,var(--tl-primary) 7%, #fff)' : 'var(--tl-tint)'
  return { cardCls: card.cls, cardStyle: card.style, iconShape, icon, fg, soft, bgAlt, bgTint: 'var(--tl-tint)', eyebrow: t.eyebrow }
}

export function useSkin(): Skin {
  return getSkin(useTemplate())
}
