import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { setByPath } from '@/lib/path'

/* ============ TYPES ============ */
export type SectionType =
  | 'stats' | 'why' | 'services' | 'about' | 'specialties' | 'journey' | 'contact'

export interface SectionMeta {
  type: SectionType
  label: string
  visible: boolean
}

export interface Theme {
  primary: string
  navy: string
  accent: string
  headingFont: 'display' | 'sans'
  radius: number
  /** Tên Google Font cho tiêu đề & nội dung (mặc định Inter). */
  fontHeading?: string
  fontBody?: string
}

export interface HourRow { id: string; label: string; value: string }

export interface SiteInfo {
  clinicName: string
  tagline: string
  slogan: string
  logoUrl: string
  phone: string
  address: string
  addressNote: string
  street: string
  ward: string
  province: string
  hours: HourRow[]
}

export interface Hero {
  badgePrefix: string
  badgeStrong: string
  badgeSuffix: string
  title: string
  titleHighlight: string
  subtitle: string
  bullets: string[]
  bookingTitle: string
  bookingSubtitle: string
  doctorPhotoUrl: string
}

export interface IdItem { id: string }
export interface Stat extends IdItem { icon: string; value: string; label: string }
export interface Feature extends IdItem { icon: string; title: string; desc: string }
export interface Specialty extends IdItem { icon: string; title: string }
export interface TimelineItem extends IdItem { year: string; title: string; place: string; now?: boolean }
export interface Research extends IdItem { year: string; title: string; tag: string }
export interface TimelineTab extends IdItem { key: string; label: string; twoCol?: boolean; items: TimelineItem[] }
export interface Credential extends IdItem { icon: string; title: string; sub: string }

export interface About {
  eyebrow: string
  title: string
  titleHighlight: string
  paragraphs: string[]
  photoUrl: string
  photoName: string
  photoRole: string
  tags: string[]
  credentials: Credential[]
  quote: string
  quoteCite: string
}

export interface SiteContent {
  theme: Theme
  template: string
  seo: { title: string; description: string }
  info: SiteInfo
  hero: Hero
  stats: Stat[]
  whyEyebrow: string
  whyTitle: string
  whyTitleHighlight: string
  whys: Feature[]
  servicesEyebrow: string
  servicesTitle: string
  servicesTitleHighlight: string
  servicesLead: string
  services: Feature[]
  about: About
  specialtiesEyebrow: string
  specialtiesTitle: string
  specialtiesTitleHighlight: string
  specialties: Specialty[]
  journeyEyebrow: string
  journeyTitle: string
  journeyTitleHighlight: string
  timeline: TimelineTab[]
  research: Research[]
  contactEyebrow: string
  contactTitle: string
  contactTitleHighlight: string
  contactLead: string
  /** Dải kêu gọi cuối trang (trước footer). */
  cta: { title: string; titleHighlight: string; lead: string }
  footerAbout: string
  booking: { notifyEmail: string; web3formsKey: string }
  sections: SectionMeta[]
}

/* ============ DEFAULT CONTENT ============ */
const uid = () => Math.random().toString(36).slice(2, 9)

export const DEFAULT_CONTENT: SiteContent = {
  theme: { primary: '#0070F4', navy: '#00B63E', accent: '#d81e28', headingFont: 'display', radius: 14, fontHeading: 'Lora', fontBody: 'Inter' },
  template: 'classic',
  seo: {
    title: 'Phòng khám Tim mạch Tuyết Lan · ThS. BSCKII. Trần Thị Tuyết Lan',
    description: 'Phòng khám Tim mạch Tuyết Lan — hơn 20 năm kinh nghiệm Nội tim mạch. Khám tim, siêu âm tim, siêu âm mạch máu, điện tâm đồ. Đặt lịch: 0979 86 77 51.',
  },
  info: {
    clinicName: 'Tim mạch Tuyết Lan',
    tagline: 'Phòng khám chuyên khoa',
    slogan: 'Tâm sáng · Tầm cao · Tim khỏe',
    logoUrl: '/logo.png',
    phone: '0979 86 77 51',
    address: '16/63 Tuệ Tĩnh, Phường Phú Thọ',
    addressNote: '(P.13, Q.11 cũ), TP. Hồ Chí Minh',
    street: '16/63 Tuệ Tĩnh',
    ward: 'Phường Phú Thọ',
    province: 'HCM',
    hours: [
      { id: uid(), label: 'Thứ 2 – Thứ 7', value: '17:00 – 20:00' },
      { id: uid(), label: 'Chủ nhật', value: '08:00 – 11:00' },
      { id: uid(), label: 'Ngày lễ', value: 'Vui lòng gọi trước' },
    ],
  },
  hero: {
    badgePrefix: 'Chuyên khoa',
    badgeStrong: 'Nội Tim Mạch',
    badgeSuffix: '· TP. Hồ Chí Minh',
    title: 'Chăm sóc sức khỏe tim mạch của bạn bằng cả sự',
    titleHighlight: 'tận tâm',
    subtitle: 'Phòng khám Tim mạch Tuyết Lan — chẩn đoán chính xác, điều trị hiệu quả, chi phí hợp lý cho mọi người bệnh.',
    bullets: [
      'ThS. BSCKII. Trần Thị Tuyết Lan — hơn 20 năm tại Viện Tim TP.HCM',
      'Siêu âm tim, siêu âm mạch máu, điện tâm đồ & Holter',
      'Bác sĩ trực tiếp thăm khám & theo dõi điều trị',
    ],
    bookingTitle: 'Đăng ký khám',
    bookingSubtitle: 'Bác sĩ sẽ liên hệ xác nhận lịch hẹn',
    doctorPhotoUrl: '/doctor.webp',
  },
  stats: [
    { id: uid(), icon: 'clock', value: '20+', label: 'Năm kinh nghiệm' },
    { id: uid(), icon: 'building', value: 'Viện Tim', label: 'TP. Hồ Chí Minh' },
    { id: uid(), icon: 'award', value: 'BSCKII', label: 'Nội Tim Mạch' },
    { id: uid(), icon: 'heart', value: '2015', label: 'Hoạt động liên tục' },
  ],
  whyEyebrow: 'Cam kết của chúng tôi',
  whyTitle: 'Vì sao chọn',
  whyTitleHighlight: 'Tim mạch Tuyết Lan',
  whys: [
    { id: uid(), icon: 'check', title: 'Bác sĩ giàu kinh nghiệm', desc: 'Hơn 20 năm công tác tại Viện Tim TP.HCM, Chuyên khoa II Nội tim mạch.' },
    { id: uid(), icon: 'search', title: 'Chẩn đoán chính xác', desc: 'Siêu âm tim, mạch máu, điện tâm đồ & Holter được thực hiện bài bản.' },
    { id: uid(), icon: 'coins', title: 'Chi phí hợp lý', desc: 'Hướng đến hiệu quả điều trị tốt nhất với chi phí phù hợp cho đại đa số người bệnh.' },
    { id: uid(), icon: 'heart', title: 'Tận tâm với bệnh nhân', desc: 'Bác sĩ trực tiếp thăm khám, tư vấn và đồng hành theo dõi điều trị lâu dài.' },
  ],
  servicesEyebrow: 'Dịch vụ phòng khám',
  servicesTitle: 'Dịch vụ tim mạch',
  servicesTitleHighlight: 'chuyên sâu',
  servicesLead: 'Từ thăm khám, tư vấn đến chẩn đoán hình ảnh — thực hiện trực tiếp bởi bác sĩ chuyên khoa.',
  services: [
    { id: uid(), icon: 'heart', title: 'Khám & tư vấn tim mạch', desc: 'Đánh giá toàn diện và tư vấn hướng điều trị phù hợp.' },
    { id: uid(), icon: 'activity', title: 'Điều trị bệnh mạn tính', desc: 'Tăng huyết áp, đái tháo đường, mạch vành, suy tim, loạn nhịp…' },
    { id: uid(), icon: 'shield', title: 'Tư vấn can thiệp & phẫu thuật', desc: 'Can thiệp mạch vành, van tim, đặt máy tạo nhịp, cắt đốt điện sinh lý.' },
    { id: uid(), icon: 'scanheart', title: 'Siêu âm tim', desc: 'Cho người lớn và trẻ em, đánh giá cấu trúc & chức năng tim.' },
    { id: uid(), icon: 'vessel', title: 'Siêu âm mạch máu', desc: 'Khảo sát hệ động — tĩnh mạch, phát hiện sớm bất thường.' },
    { id: uid(), icon: 'baby', title: 'Siêu âm tim thai', desc: 'Tầm soát dị tật tim bẩm sinh trong bào thai an toàn.' },
    { id: uid(), icon: 'ecg', title: 'Điện tâm đồ & Holter 24–48h', desc: 'Phát hiện rối loạn nhịp và thiếu máu cơ tim.' },
    { id: uid(), icon: 'pulse', title: 'Đo sóng mạch — ABI', desc: 'Đánh giá độ cứng thành mạch, bệnh động mạch ngoại biên.' },
    { id: uid(), icon: 'syringe', title: 'Siêu âm tổng quát', desc: 'Khảo sát tổng quát vùng bụng và các cơ quan.' },
  ],
  about: {
    eyebrow: 'Về bác sĩ',
    title: 'Người thầy thuốc',
    titleHighlight: 'tận tâm',
    paragraphs: [
      'ThS. BSCKII. Trần Thị Tuyết Lan có hơn 20 năm kinh nghiệm học tập, giảng dạy và công tác trong lĩnh vực Nội tim mạch. Với mong muốn tìm được phác đồ điều trị hiệu quả nhất cho mỗi bệnh nhân, bác sĩ không ngừng nghiên cứu và trau dồi chuyên môn qua các khóa học trong nước và quốc tế.',
      'Sau khi tốt nghiệp Bác sĩ Y đa khoa tại Đại học Y Dược TP.HCM, bác sĩ tiếp tục Cao học Nội khoa và lấy bằng Chuyên khoa II Nội tim mạch tại Đại học Y khoa Phạm Ngọc Thạch. Năm 2006, bác sĩ hoàn thành chứng chỉ siêu âm tim tại Úc do Học Mãi Foundation tổ chức. Bác sĩ có 20 năm gắn bó với Viện Tim TP.HCM trước khi công tác tại Trung tâm Tim mạch, Bệnh viện Đa khoa Tâm Anh TP.HCM.',
    ],
    photoUrl: '/doctor.webp',
    photoName: 'ThS. BSCKII. Trần Thị Tuyết Lan',
    photoRole: 'Chuyên khoa II · Nội Tim Mạch',
    tags: ['Viện Tim TP.HCM', 'ĐH Y Dược TP.HCM', 'Phạm Ngọc Thạch', 'CCHI · Hoa Kỳ'],
    credentials: [
      { id: uid(), icon: 'cap', title: 'Chuyên khoa II Nội Tim mạch', sub: 'ĐH Y khoa Phạm Ngọc Thạch' },
      { id: uid(), icon: 'award', title: 'Chứng chỉ siêu âm tim tại Úc', sub: 'Học Mãi Foundation · 2006' },
      { id: uid(), icon: 'love', title: 'Thông dịch viên Y khoa CCHI', sub: 'Hoa Kỳ · thành thạo tiếng Anh y khoa' },
      { id: uid(), icon: 'clock', title: '20 năm tại Viện Tim TP.HCM', sub: 'Bác sĩ điều trị Nội tim mạch' },
    ],
    quote: 'Chẩn đoán chính xác, điều trị hiệu quả, với chi phí phù hợp cho đại đa số người bệnh.',
    quoteCite: 'Phương châm phòng khám: Tâm sáng · Tầm cao · Tim khỏe',
  },
  specialtiesEyebrow: 'Lĩnh vực chuyên môn',
  specialtiesTitle: 'Thế mạnh',
  specialtiesTitleHighlight: 'chuyên sâu',
  specialties: [
    { id: uid(), icon: 'heart', title: 'Nội tim mạch' },
    { id: uid(), icon: 'activity', title: 'Điện tâm đồ' },
    { id: uid(), icon: 'scanheart', title: 'Siêu âm tim' },
    { id: uid(), icon: 'vessel', title: 'Siêu âm mạch máu' },
    { id: uid(), icon: 'baby', title: 'Siêu âm tim thai' },
  ],
  journeyEyebrow: 'Hành trình chuyên môn',
  journeyTitle: 'Quá trình đào tạo &',
  journeyTitleHighlight: 'công tác',
  timeline: [
    {
      id: uid(), key: 'edu', label: 'Bằng cấp', items: [
        { id: uid(), year: '1994 – 2000', title: 'Bác sĩ Y Đa khoa', place: 'Đại học Y Dược TP.HCM' },
        { id: uid(), year: '2012 – 2014', title: 'Cao học Nội khoa', place: 'Đại học Y khoa Phạm Ngọc Thạch TP.HCM' },
        { id: uid(), year: '2018 – 2020', title: 'Bác sĩ Chuyên khoa II Nội Tim mạch', place: 'Đại học Y khoa Phạm Ngọc Thạch TP.HCM', now: true },
      ],
    },
    {
      id: uid(), key: 'cert', label: 'Chứng chỉ chuyên môn', twoCol: true, items: [
        { id: uid(), year: '2002', title: 'Siêu âm tim & bệnh lý tim mạch', place: 'TT Đào tạo & Bồi dưỡng CBYT TP.HCM' },
        { id: uid(), year: '2006', title: 'Siêu âm tim', place: 'Học Mãi Foundation, Úc' },
        { id: uid(), year: '2005 – 2007', title: 'CME về bệnh lý mạch máu', place: 'Đại học Y Dược TP.HCM' },
        { id: uid(), year: '2009', title: 'Siêu âm tim thai & tim bẩm sinh', place: 'ĐH Y khoa Phạm Ngọc Thạch' },
        { id: uid(), year: '2018', title: 'Siêu âm thực hành mạch máu', place: 'ĐH Y khoa Phạm Ngọc Thạch' },
        { id: uid(), year: '2019', title: 'Điện tâm đồ nâng cao & gắng sức', place: 'PNT · Viện Tim TP.HCM' },
        { id: uid(), year: '2019', title: 'Tiếng Anh trong khám, chữa bệnh', place: 'Đại học Y Dược TP.HCM' },
        { id: uid(), year: '2021', title: 'Thông dịch viên Y khoa', place: 'Tổ chức CCHI (Hoa Kỳ)' },
      ],
    },
    {
      id: uid(), key: 'work', label: 'Kinh nghiệm công tác', items: [
        { id: uid(), year: '2000 – 2002', title: 'Giảng viên Bộ môn Dược lý', place: 'Đại học Y Dược TP.HCM' },
        { id: uid(), year: '2003 – 2022', title: 'Bác sĩ điều trị', place: 'Viện Tim TP.HCM · gần 20 năm gắn bó' },
        { id: uid(), year: '10/2022 – Nay', title: 'Bác sĩ Nội tim mạch', place: 'Trung tâm Tim mạch, BV Đa khoa Tâm Anh TP.HCM', now: true },
      ],
    },
  ],
  research: [
    { id: uid(), year: '2014', title: 'Đặc điểm siêu âm 2D và Doppler trên bệnh nhân chuyển vị đại động mạch được phẫu thuật', tag: 'Siêu âm tim' },
    { id: uid(), year: '2020', title: 'Các yếu tố nguy cơ ảnh hưởng kết quả ngắn hạn phẫu thuật hở van 2 lá ở bệnh nhân cao tuổi', tag: 'Van tim' },
  ],
  contactEyebrow: 'Liên hệ & đặt lịch',
  contactTitle: 'Đến khám tại',
  contactTitleHighlight: 'Tuyết Lan',
  contactLead: 'Vui lòng gọi trước để được sắp xếp lịch hẹn thuận tiện nhất.',
  cta: {
    title: 'Chăm sóc trái tim bạn',
    titleHighlight: 'ngay hôm nay',
    lead: 'Đừng để những dấu hiệu nhỏ trở thành vấn đề lớn. Đặt lịch khám với bác sĩ chuyên khoa Nội tim mạch.',
  },
  footerAbout: 'Phụ trách bởi ThS. BSCKII. Trần Thị Tuyết Lan — hoạt động liên tục từ 2015 với sứ mệnh chẩn đoán chính xác và điều trị hiệu quả cho mọi người bệnh.',
  booking: { notifyEmail: '', web3formsKey: '' },
  sections: [
    { type: 'stats', label: 'Dải số liệu', visible: true },
    { type: 'why', label: 'Vì sao chọn (Cam kết)', visible: true },
    { type: 'services', label: 'Dịch vụ', visible: true },
    { type: 'about', label: 'Giới thiệu bác sĩ', visible: true },
    { type: 'specialties', label: 'Lĩnh vực chuyên môn', visible: true },
    { type: 'journey', label: 'Đào tạo & công tác', visible: true },
    { type: 'contact', label: 'Liên hệ & bản đồ', visible: true },
  ],
}

/* ============ STORE ============ */
// content = BẢN NHÁP (trang quản trị chỉnh sửa) · published = bản đang hiển thị trên website.
interface ContentState {
  content: SiteContent
  published: SiteContent
  dirty: boolean
  /** Mốc thời gian (ISO) của lần LƯU gần nhất — dùng để so "bản mới thắng" khi đồng bộ với server. */
  pubTs: string
  /** Chỉnh nội dung form → tạo BẢN NHÁP (dirty). Phải bấm "Lưu" mới áp dụng, "Hoàn tác" để bỏ. */
  set: (updater: (c: SiteContent) => void) => void
  /** Sửa 1 trường theo đường dẫn (vd "hero.title") → BẢN NHÁP (dirty). Dùng cho "Sửa trực quan". */
  setPath: (path: string, value: unknown) => void
  /** Chỉ để XEM TRƯỚC trong iframe: thay bản đang hiển thị bằng nội dung nháp — TRONG BỘ NHỚ, không lưu. */
  setPreview: (c: SiteContent) => void
  /** Đổi BỐ CỤC (thứ tự & ẩn/hiện các phần) → áp dụng NGAY lên website, không tạo trạng thái chưa lưu. */
  setLayout: (updater: (c: SiteContent) => void) => void
  save: () => void
  discard: () => void
  replace: (c: SiteContent) => void
  /** Đồng bộ dữ liệu từ server: cập nhật bản nền (published) + mốc thời gian; chỉ đổi bản nháp khi KHÔNG có sửa đổi chưa lưu. */
  applyRemote: (c: SiteContent, ts?: string) => void
  reset: () => void
  newId: () => string
}

// Dọn danh sách sections đã lưu: chỉ giữ type hợp lệ (bỏ type cũ/không còn dùng),
// và đảm bảo đủ các phần mặc định.
function cleanSections(p: any): SectionMeta[] {
  const def = DEFAULT_CONTENT.sections
  const saved: SectionMeta[] = Array.isArray(p?.sections)
    ? p.sections.filter((s: SectionMeta) => def.some((d) => d.type === s.type))
    : []
  const have = new Set(saved.map((s) => s.type))
  return [...saved, ...def.filter((d) => !have.has(d.type))]
}

function mergeC(p: any): SiteContent {
  return {
    ...DEFAULT_CONTENT, ...(p ?? {}),
    theme: { ...DEFAULT_CONTENT.theme, ...((p && p.theme) ?? {}) },
    seo: { ...DEFAULT_CONTENT.seo, ...((p && p.seo) ?? {}) },
    info: { ...DEFAULT_CONTENT.info, ...((p && p.info) ?? {}) },
    booking: { ...DEFAULT_CONTENT.booking, ...((p && p.booking) ?? {}) },
    cta: { ...DEFAULT_CONTENT.cta, ...((p && p.cta) ?? {}) },
    sections: cleanSections(p),
  }
}

const epoch = (ts?: string) => (ts ? new Date(ts).getTime() : 0)

// Đang chạy TRONG iframe xem trước (trang "Bố cục & Xem trước")? Nếu có → store chỉ ĐỌC,
// KHÔNG ghi localStorage. Nhờ vậy iframe không ghi đè bản nháp/bản đã lưu của trang quản trị
// — đây chính là nguyên nhân "đã bấm Lưu mà vẫn báo còn thay đổi chưa lưu".
const IS_PREVIEW = typeof window !== 'undefined' && window.self !== window.top
// Chỉ lần nạp ĐẦU của phiên mới khôi phục bản nháp chưa lưu; các lần sau (đồng bộ tab/iframe)
// chỉ soi bản đã lưu, không tự suy ra "chưa lưu".
let firstMerge = true

// localStorage chỉ-đọc khi ở trong iframe xem trước.
const roStorage = createJSONStorage(() => ({
  getItem: (name: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null),
  setItem: (name: string, value: string) => { if (!IS_PREVIEW && typeof localStorage !== 'undefined') localStorage.setItem(name, value) },
  removeItem: (name: string) => { if (!IS_PREVIEW && typeof localStorage !== 'undefined') localStorage.removeItem(name) },
}))

export const useContent = create<ContentState>()(
  persist(
    (set) => ({
      content: DEFAULT_CONTENT,
      published: DEFAULT_CONTENT,
      dirty: false,
      pubTs: '',
      set: (updater) =>
        set((state) => {
          const next = structuredClone(state.content)
          updater(next)
          return { content: next, dirty: true }
        }),
      setPath: (path, value) =>
        set((state) => {
          const next = structuredClone(state.content)
          setByPath(next, path, value)
          return { content: next, dirty: true }
        }),
      setPreview: (c) => set({ published: c }),
      setLayout: (updater) =>
        set((s) => {
          const content = structuredClone(s.content)
          updater(content)
          // Bố cục áp dụng NGAY: đồng bộ thứ tự & ẩn/hiện sang bản đang hiển thị (published),
          // KHÔNG đụng nội dung form và KHÔNG tạo trạng thái "chưa lưu" (giữ nguyên dirty).
          const published = structuredClone(s.published)
          published.sections = structuredClone(content.sections)
          return { content, published, pubTs: new Date().toISOString() }
        }),
      save: () => set((s) => ({ published: structuredClone(s.content), dirty: false, pubTs: new Date().toISOString() })),
      discard: () => set((s) => ({ content: structuredClone(s.published), dirty: false })),
      replace: (c) => set({ content: c, published: structuredClone(c), dirty: false }),
      applyRemote: (c, ts) =>
        set((s) =>
          s.dirty
            ? { published: c, pubTs: ts ?? s.pubTs } // đang sửa dở → giữ nguyên bản nháp, chỉ cập nhật bản nền
            : { content: c, published: structuredClone(c), dirty: false, pubTs: ts ?? s.pubTs }
        ),
      reset: () => set({ content: structuredClone(DEFAULT_CONTENT), published: structuredClone(DEFAULT_CONTENT), dirty: false, pubTs: '' }),
      newId: () => uid(),
    }),
    {
      name: 'tl_site_content', version: 3,
      storage: roStorage,
      partialize: (s) => ({ content: s.content, published: s.published, pubTs: s.pubTs, dirty: s.dirty }) as any,
      merge: (persisted, current) => {
        const ps = persisted as any
        const cur = current as ContentState
        const isFirst = firstMerge; firstMerge = false
        // Đang gõ dở tại chính context này → tuyệt đối giữ nguyên, không cho localStorage ghi đè bản nháp.
        if (cur.dirty) return cur
        const published = mergeC(ps?.published ?? ps?.content)
        const pubTs = ps?.pubTs ?? ''
        // Lần nạp ĐẦU ở trang quản trị (không phải iframe): khôi phục cả bản nháp chưa lưu
        // để tải lại trang không mất nội dung đang soạn dở.
        if (isFirst && !IS_PREVIEW) {
          const content = mergeC(ps?.content)
          return { ...cur, content, published, pubTs, dirty: !!ps?.dirty && JSON.stringify(content) !== JSON.stringify(published) }
        }
        // Các lần sau (đồng bộ giữa tab/iframe) hoặc trong iframe xem trước: CHỈ soi đúng bản đang
        // hiển thị, không tự suy ra "chưa lưu". Chỉ nhận bản đã lưu MỚI HƠN (tránh nhận lại bản cũ/echo).
        if (!isFirst && cur.pubTs && epoch(cur.pubTs) >= epoch(pubTs)) return cur
        return { ...cur, content: structuredClone(published), published, pubTs, dirty: false }
      },
    }
  )
)

// cross-tab sync: rehydrate when another tab writes
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'tl_site_content') useContent.persist.rehydrate()
  })
}
