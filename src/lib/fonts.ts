// Danh sách phông Google Fonts (đều có subset tiếng Việt). Mặc định: Inter.
export interface FontDef { name: string; category: 'sans' | 'serif' }

export const FONTS: FontDef[] = [
  { name: 'Inter', category: 'sans' },
  { name: 'Be Vietnam Pro', category: 'sans' },
  { name: 'Roboto', category: 'sans' },
  { name: 'Open Sans', category: 'sans' },
  { name: 'Montserrat', category: 'sans' },
  { name: 'Poppins', category: 'sans' },
  { name: 'Nunito Sans', category: 'sans' },
  { name: 'Work Sans', category: 'sans' },
  { name: 'Lexend', category: 'sans' },
  { name: 'Lora', category: 'serif' },
  { name: 'Merriweather', category: 'serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Roboto Slab', category: 'serif' },
]

export const FONT_NAMES = FONTS.map((f) => f.name)

export function fontCategory(name?: string): 'sans' | 'serif' {
  return FONTS.find((f) => f.name === name)?.category ?? 'sans'
}

/** Chuỗi font-family kèm fallback theo loại (sans/serif). */
export function fontStack(name?: string): string {
  if (!name) return "'Inter', system-ui, sans-serif"
  return fontCategory(name) === 'serif' ? `'${name}', Georgia, serif` : `'${name}', system-ui, sans-serif`
}

/** URL Google Fonts cho các phông đang dùng (có subset tiếng Việt). */
export function googleFontsHref(names: string[], weights = '400;500;600;700;800'): string {
  const uniq = Array.from(new Set(names.filter(Boolean)))
  if (!uniq.length) return ''
  const fams = uniq.map((n) => `family=${n.replace(/ /g, '+')}:wght@${weights}`).join('&')
  return `https://fonts.googleapis.com/css2?${fams}&display=swap`
}
