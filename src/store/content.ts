import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { setByPath } from '@/lib/path'

/* ============ TYPES ============ */
export type SectionType =
  | 'stats' | 'why' | 'services' | 'about' | 'specialties' | 'journey'
  | 'faq' | 'testimonials' | 'pricing' | 'gallery' | 'contact'
  | 'row' // khối tự do (chia cột, thả ảnh/chữ/nút) — kiểu UX Builder

/* ---- KHỐI TỰ DO (row builder) ---- */
export type TypoSize = 'sm' | 'md' | 'lg' | 'xl'
export type RowElement =
  | { id: string; kind: 'heading'; text: string; size?: TypoSize; color?: string }
  | { id: string; kind: 'text'; text: string; size?: TypoSize; color?: string }
  | { id: string; kind: 'image'; url: string; alt?: string }
  | { id: string; kind: 'button'; text: string; href: string }
  | { id: string; kind: 'icon'; name: string }
  | { id: string; kind: 'video'; url: string }
  | { id: string; kind: 'spacer'; size?: 'sm' | 'md' | 'lg' }
  | { id: string; kind: 'divider' }
  | { id: string; kind: 'map'; address: string }
  | { id: string; kind: 'list'; items: string[]; icon?: string }
  | { id: string; kind: 'quote'; text: string; cite?: string }
  | { id: string; kind: 'gallery'; images: { id: string; url: string }[] }
  | { id: string; kind: 'html'; html: string }
  | { id: string; kind: 'latestposts'; count?: number }
  | { id: string; kind: 'socials'; items: { id: string; platform: string; url: string }[] }
  | { id: string; kind: 'table'; rows: string[][] }
  | { id: string; kind: 'columns'; cols: RowColumn[] } // khối LỒNG: chia cột, mỗi cột chứa phần tử con
export type RowElementKind = RowElement['kind']
export interface RowColumn { id: string; elements: RowElement[] }
export interface RowBlock {
  cols: RowColumn[]
  /** Nền khối: trắng / tông nhạt / nền màu thương hiệu. */
  bg?: 'none' | 'tint' | 'soft'
  /** Khoảng đệm trên–dưới. */
  py?: 'sm' | 'md' | 'lg'
  /** Căn dọc các cột. */
  align?: 'start' | 'center'
  /** Ảnh nền (URL/dataURL). */
  bgImage?: string
  /** Độ tối lớp phủ trên ảnh nền (0–80%). */
  overlay?: number
  /** Chữ sáng (dùng khi nền tối/ảnh). */
  light?: boolean
  /** Tỉ lệ cột khi có 2 cột. */
  layout?: 'equal' | 'wideLeft' | 'wideRight'
  /** Tràn toàn chiều ngang (bỏ giới hạn container). */
  wide?: boolean
}

export interface SectionMeta {
  type: SectionType
  label: string
  visible: boolean
  /** Ghi đè kiểu bố cục cho riêng khu vực này. Bỏ trống = theo mẫu đang dùng. */
  variant?: string
  /** ID duy nhất — BẮT BUỘC cho khối tự do (type==='row') vì có thể có nhiều khối. */
  id?: string
  /** Dữ liệu khối tự do khi type==='row'. */
  row?: RowBlock
}

/* ---- FORM ĐẶT LỊCH tuỳ biến (kiểu Contact Form 7) ---- */
export type FormFieldType = 'text' | 'phone' | 'email' | 'textarea' | 'select' | 'date' | 'time' | 'checkbox'
export interface FormField {
  id: string
  type: FormFieldType
  label: string
  /** Khóa lưu: 'name'|'phone'|'service'|'date'|'time'|'note' map vào cột đặt lịch; khác = field tuỳ chỉnh (gộp vào Ghi chú). */
  key: string
  placeholder?: string
  required?: boolean
  /** Lựa chọn cho type 'select'/'time'. */
  options?: string[]
  /** Bề rộng trong lưới: cả hàng hay nửa hàng. */
  width?: 'full' | 'half'
}
export interface BookingForm { fields: FormField[]; submitText?: string }

/* ---- BÀI VIẾT / TIN TỨC (blog) ---- */
export interface Post {
  id: string
  title: string
  slug: string
  /** Tóm tắt ngắn (hiện ở danh sách + chia sẻ). */
  excerpt: string
  /** Ảnh bìa (URL/dataURL). */
  cover: string
  /** Ngày đăng 'YYYY-MM-DD'. */
  date: string
  published: boolean
  /** Thân bài = các KHỐI TỰ DO (tái dùng row builder). */
  sections: SectionMeta[]
}

/* ---- MENU điều hướng tuỳ biến ---- */
export interface MenuItem {
  id: string
  label: string
  /** home = về đầu trang chủ; section = mỏ neo tới 1 phần; page = tới trang phụ; url = liên kết tự nhập. */
  kind: 'home' | 'section' | 'page' | 'url'
  /** section: id mỏ neo (vd 'gioi-thieu'); page: id trang phụ; url: đường dẫn/URL. */
  ref?: string
}

/** Trang phụ tự tạo (ngoài Trang chủ). Nội dung = danh sách KHỐI TỰ DO (SectionMeta type='row'). */
export interface PageDef {
  id: string
  title: string
  /** Đường dẫn: /<slug> */
  slug: string
  sections: SectionMeta[]
  /** SEO riêng cho trang (tiêu đề Google + mô tả chia sẻ). Bỏ trống = tự suy từ tên trang. */
  seo?: { title?: string; description?: string }
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
export interface FaqItem extends IdItem { q: string; a: string }
export interface Testimonial extends IdItem { quote: string; name: string; role: string; photoUrl: string }
export interface PriceItem extends IdItem { name: string; price: string; note: string }
export interface GalleryImage extends IdItem { url: string; caption: string }

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
  /* Khối tùy chọn (bật/tắt trong Bố cục) */
  faqEyebrow: string
  faqTitle: string
  faqTitleHighlight: string
  faqs: FaqItem[]
  testimonialsEyebrow: string
  testimonialsTitle: string
  testimonialsTitleHighlight: string
  testimonials: Testimonial[]
  pricingEyebrow: string
  pricingTitle: string
  pricingTitleHighlight: string
  pricingLead: string
  pricing: PriceItem[]
  galleryEyebrow: string
  galleryTitle: string
  galleryTitleHighlight: string
  gallery: GalleryImage[]
  contactEyebrow: string
  contactTitle: string
  contactTitleHighlight: string
  contactLead: string
  /** Dải kêu gọi cuối trang (trước footer). */
  cta: { title: string; titleHighlight: string; lead: string }
  footerAbout: string
  booking: { notifyEmail: string; web3formsKey: string }
  /** Form đặt lịch tuỳ biến (kéo-thả field). */
  bookingForm: BookingForm
  sections: SectionMeta[]
  /** Các trang phụ tự tạo (Cấp 4 — đa trang). Mặc định rỗng. */
  pages: PageDef[]
  /** Menu tuỳ biến. Rỗng = dùng menu TỰ ĐỘNG (trang chủ + các phần + trang phụ). */
  menu: MenuItem[]
  /** Bài viết / tin tức. */
  posts: Post[]
  /** Cấu hình trang tin tức (tiêu đề & đường dẫn danh sách). */
  blog: { title: string; slug: string; intro: string }
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
  faqEyebrow: 'Giải đáp thắc mắc',
  faqTitle: 'Câu hỏi',
  faqTitleHighlight: 'thường gặp',
  faqs: [
    { id: uid(), q: 'Phòng khám làm việc vào những khung giờ nào?', a: 'Thứ 2 – Thứ 7: 17:00–20:00; Chủ nhật: 08:00–11:00. Vui lòng gọi trước để được sắp xếp lịch hẹn thuận tiện.' },
    { id: uid(), q: 'Tôi cần chuẩn bị gì trước khi đi khám tim?', a: 'Mang theo kết quả xét nghiệm/toa thuốc cũ (nếu có), danh sách thuốc đang dùng và mặc áo thoải mái để thuận tiện đo điện tâm đồ, siêu âm tim.' },
    { id: uid(), q: 'Phòng khám có siêu âm tim và điện tâm đồ không?', a: 'Có. Chúng tôi thực hiện siêu âm tim, siêu âm mạch máu, điện tâm đồ và Holter 24–48h ngay tại phòng khám.' },
  ],
  testimonialsEyebrow: 'Cảm nhận bệnh nhân',
  testimonialsTitle: 'Bệnh nhân nói gì về',
  testimonialsTitleHighlight: 'chúng tôi',
  testimonials: [
    { id: uid(), quote: 'Bác sĩ tận tâm, giải thích rõ ràng và theo dõi điều trị chu đáo. Tôi rất yên tâm khi khám tại đây.', name: 'Cô Nguyễn Thị H.', role: 'Bệnh nhân tăng huyết áp', photoUrl: '' },
    { id: uid(), quote: 'Phòng khám sạch sẽ, đặt lịch nhanh, kết quả siêu âm tim được giải thích cặn kẽ. Cảm ơn bác sĩ nhiều.', name: 'Chú Trần Văn M.', role: 'Bệnh nhân mạch vành', photoUrl: '' },
    { id: uid(), quote: 'Chi phí hợp lý, bác sĩ giàu kinh nghiệm. Gia đình tôi đều tin tưởng khám tim ở đây.', name: 'Anh Lê Quốc T.', role: 'Người nhà bệnh nhân', photoUrl: '' },
  ],
  pricingEyebrow: 'Chi phí tham khảo',
  pricingTitle: 'Bảng giá',
  pricingTitleHighlight: 'dịch vụ',
  pricingLead: 'Chi phí tham khảo, có thể thay đổi tùy tình trạng. Vui lòng gọi hotline để được tư vấn cụ thể.',
  pricing: [
    { id: uid(), name: 'Khám & tư vấn tim mạch', price: '200.000đ', note: 'Bác sĩ chuyên khoa trực tiếp' },
    { id: uid(), name: 'Siêu âm tim', price: '350.000đ', note: 'Người lớn & trẻ em' },
    { id: uid(), name: 'Điện tâm đồ (ECG)', price: '100.000đ', note: 'Có đọc kết quả ngay' },
    { id: uid(), name: 'Siêu âm mạch máu', price: '400.000đ', note: 'Động – tĩnh mạch' },
  ],
  galleryEyebrow: 'Hình ảnh phòng khám',
  galleryTitle: 'Không gian &',
  galleryTitleHighlight: 'trang thiết bị',
  gallery: [
    { id: uid(), url: '/doctor.webp', caption: 'Phòng khám tim mạch' },
    { id: uid(), url: '/doctor.webp', caption: 'Khu siêu âm tim' },
    { id: uid(), url: '/doctor.webp', caption: 'Quầy tiếp đón' },
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
  bookingForm: {
    submitText: 'Gửi đăng ký khám',
    fields: [
      { id: uid(), type: 'text', key: 'name', label: 'Họ và tên', placeholder: 'Nguyễn Văn A', required: true, width: 'half' },
      { id: uid(), type: 'phone', key: 'phone', label: 'Số điện thoại', placeholder: '090 941 073', required: true, width: 'half' },
      { id: uid(), type: 'select', key: 'service', label: 'Dịch vụ', placeholder: 'Chọn dịch vụ cần khám', width: 'full', options: [] },
      { id: uid(), type: 'date', key: 'date', label: 'Ngày mong muốn', placeholder: 'Chọn ngày khám', width: 'half' },
      { id: uid(), type: 'time', key: 'time', label: 'Buổi khám', placeholder: 'Chọn buổi khám', width: 'half', options: ['Chiều (17:00–20:00)', 'Sáng CN (08:00–11:00)', 'Bác sĩ tư vấn giờ phù hợp'] },
      { id: uid(), type: 'textarea', key: 'note', label: 'Ghi chú (triệu chứng, mong muốn…)', placeholder: 'VD: hay hồi hộp, khó thở khi gắng sức…', width: 'full' },
    ],
  },
  sections: [
    { type: 'stats', label: 'Dải số liệu', visible: true },
    { type: 'why', label: 'Vì sao chọn (Cam kết)', visible: true },
    { type: 'services', label: 'Dịch vụ', visible: true },
    { type: 'about', label: 'Giới thiệu bác sĩ', visible: true },
    { type: 'specialties', label: 'Lĩnh vực chuyên môn', visible: true },
    { type: 'journey', label: 'Đào tạo & công tác', visible: true },
    { type: 'testimonials', label: 'Cảm nhận bệnh nhân', visible: false },
    { type: 'faq', label: 'Câu hỏi thường gặp', visible: false },
    { type: 'pricing', label: 'Bảng giá dịch vụ', visible: false },
    { type: 'gallery', label: 'Thư viện ảnh', visible: false },
    { type: 'contact', label: 'Liên hệ & bản đồ', visible: true },
  ],
  pages: [],
  menu: [],
  posts: [],
  blog: { title: 'Tin tức', slug: 'tin-tuc', intro: 'Kiến thức sức khỏe tim mạch & tin tức phòng khám.' },
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

// Dọn danh sách sections đã lưu: giữ type hợp lệ + KHỐI TỰ DO (row, giữ nguyên id/row),
// bỏ type cũ/không còn dùng, và đảm bảo đủ các phần mặc định.
function cleanSections(p: any): SectionMeta[] {
  const def = DEFAULT_CONTENT.sections
  const saved: SectionMeta[] = Array.isArray(p?.sections)
    ? p.sections.filter((s: SectionMeta) => s?.type === 'row' || def.some((d) => d.type === s.type))
    : []
  const have = new Set(saved.filter((s) => s.type !== 'row').map((s) => s.type))
  // Chèn các phần MẶC ĐỊNH còn thiếu vào cuối (khối tự do không có mặc định nên luôn được giữ qua `saved`).
  return [...saved, ...def.filter((d) => !have.has(d.type))]
}

/** Chuẩn hóa tiêu đề → slug (không dấu, gạch nối). */
export function slugify(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'trang'
}

/** Tạo một TRANG PHỤ rỗng với thân bài phẳng kiểu Gutenberg. */
export function newPage(id: () => string, title: string, slug: string): PageDef {
  return { id: id(), title, slug, sections: [newPostBody(id)] }
}

/** Thân bài kiểu Gutenberg: MỘT khối 1 cột chứa danh sách phần tử (mỗi phần tử = 1 "block"). */
export function newPostBody(id: () => string): SectionMeta {
  return {
    type: 'row', label: 'Nội dung', visible: true, id: id(),
    row: { bg: 'none', py: 'sm', align: 'start', cols: [{ id: id(), elements: [{ id: id(), kind: 'text', text: '' }] }] },
  }
}

/** Tạo một BÀI VIẾT mới (ngày = hôm nay), thân bài Gutenberg 1 cột. */
export function newPost(id: () => string, title: string, slug: string): Post {
  return { id: id(), title, slug, excerpt: '', cover: '', date: new Date().toISOString().slice(0, 10), published: true, sections: [newPostBody(id)] }
}

/** Tạo một FIELD mới cho form đặt lịch (key ngẫu nhiên = field tuỳ chỉnh, gộp vào Ghi chú). */
export function newField(id: () => string, type: FormFieldType): FormField {
  const f: FormField = { id: id(), type, key: id(), label: 'Nhãn mới', width: 'full' }
  if (type === 'select') { f.label = 'Lựa chọn'; f.options = ['Lựa chọn 1', 'Lựa chọn 2']; f.placeholder = 'Chọn…' }
  else if (type === 'time') { f.label = 'Buổi'; f.options = ['Sáng', 'Chiều']; f.placeholder = 'Chọn…' }
  else if (type === 'checkbox') f.label = 'Tôi đồng ý được liên hệ tư vấn'
  else if (type === 'date') f.label = 'Chọn ngày'
  else if (type === 'phone') f.label = 'Số điện thoại'
  else if (type === 'email') f.label = 'Email'
  else if (type === 'textarea') f.label = 'Nội dung'
  return f
}

/** Tạo một KHỐI TỰ DO mặc định: 2 cột — ảnh bên trái, tiêu đề + đoạn chữ bên phải. */
export function newRow(id: () => string): SectionMeta {
  return {
    type: 'row', label: 'Khối tự do', visible: true, id: id(),
    row: {
      bg: 'none', py: 'md', align: 'center',
      cols: [
        { id: id(), elements: [{ id: id(), kind: 'image', url: '/doctor.webp', alt: '' }] },
        { id: id(), elements: [
          { id: id(), kind: 'heading', text: 'Tiêu đề khối mới' },
          { id: id(), kind: 'text', text: 'Nhập nội dung mô tả tại đây. Bạn có thể thêm ảnh, nút bấm hoặc chia thêm cột.' },
        ] },
      ],
    },
  }
}

function mergeC(p: any): SiteContent {
  return {
    ...DEFAULT_CONTENT, ...(p ?? {}),
    theme: { ...DEFAULT_CONTENT.theme, ...((p && p.theme) ?? {}) },
    seo: { ...DEFAULT_CONTENT.seo, ...((p && p.seo) ?? {}) },
    info: { ...DEFAULT_CONTENT.info, ...((p && p.info) ?? {}) },
    booking: { ...DEFAULT_CONTENT.booking, ...((p && p.booking) ?? {}) },
    cta: { ...DEFAULT_CONTENT.cta, ...((p && p.cta) ?? {}) },
    bookingForm: (p?.bookingForm && Array.isArray(p.bookingForm.fields) && p.bookingForm.fields.length)
      ? { submitText: p.bookingForm.submitText ?? DEFAULT_CONTENT.bookingForm.submitText, fields: p.bookingForm.fields }
      : DEFAULT_CONTENT.bookingForm,
    sections: cleanSections(p),
    pages: Array.isArray(p?.pages) ? p.pages : [],
    menu: Array.isArray(p?.menu) ? p.menu : [],
    posts: Array.isArray(p?.posts) ? p.posts : [],
    blog: { ...DEFAULT_CONTENT.blog, ...((p && p.blog) ?? {}) },
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
          published.pages = structuredClone(content.pages) // đa trang: đồng bộ luôn để áp dụng LIVE
          published.posts = structuredClone(content.posts)
          published.blog = structuredClone(content.blog)
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
