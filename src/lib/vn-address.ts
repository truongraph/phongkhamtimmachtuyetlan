// Đơn vị hành chính Việt Nam theo sắp xếp 2025 (hiệu lực 01/07/2025): 34 tỉnh/thành.
// Danh sách TỈNH/THÀNH ở đây; danh sách đầy đủ ~3.320 phường/xã/đặc khu nằm ở vn-wards.ts
// (WARDS, khóa theo cùng mã tỉnh bên dưới). Ô phường/xã vẫn cho phép NHẬP TAY tên mới.
export { WARDS } from './vn-wards'

export interface Province { code: string; name: string; type: 'tp' | 'tinh' }

export const PROVINCES: Province[] = [
  // 6 thành phố trực thuộc trung ương
  { code: 'HN', name: 'Hà Nội', type: 'tp' },
  { code: 'HP', name: 'Hải Phòng', type: 'tp' },
  { code: 'HUE', name: 'Huế', type: 'tp' },
  { code: 'DN', name: 'Đà Nẵng', type: 'tp' },
  { code: 'HCM', name: 'TP. Hồ Chí Minh', type: 'tp' },
  { code: 'CT', name: 'Cần Thơ', type: 'tp' },
  // 28 tỉnh
  { code: 'TQ', name: 'Tuyên Quang', type: 'tinh' },
  { code: 'LC', name: 'Lào Cai', type: 'tinh' },
  { code: 'TN', name: 'Thái Nguyên', type: 'tinh' },
  { code: 'PT', name: 'Phú Thọ', type: 'tinh' },
  { code: 'BN', name: 'Bắc Ninh', type: 'tinh' },
  { code: 'HY', name: 'Hưng Yên', type: 'tinh' },
  { code: 'NB', name: 'Ninh Bình', type: 'tinh' },
  { code: 'QN', name: 'Quảng Ninh', type: 'tinh' },
  { code: 'CB', name: 'Cao Bằng', type: 'tinh' },
  { code: 'LS', name: 'Lạng Sơn', type: 'tinh' },
  { code: 'LCH', name: 'Lai Châu', type: 'tinh' },
  { code: 'DB', name: 'Điện Biên', type: 'tinh' },
  { code: 'SL', name: 'Sơn La', type: 'tinh' },
  { code: 'TH', name: 'Thanh Hóa', type: 'tinh' },
  { code: 'NA', name: 'Nghệ An', type: 'tinh' },
  { code: 'HT', name: 'Hà Tĩnh', type: 'tinh' },
  { code: 'QT', name: 'Quảng Trị', type: 'tinh' },
  { code: 'QNG', name: 'Quảng Ngãi', type: 'tinh' },
  { code: 'GL', name: 'Gia Lai', type: 'tinh' },
  { code: 'KH', name: 'Khánh Hòa', type: 'tinh' },
  { code: 'DLK', name: 'Đắk Lắk', type: 'tinh' },
  { code: 'LD', name: 'Lâm Đồng', type: 'tinh' },
  { code: 'DNA', name: 'Đồng Nai', type: 'tinh' },
  { code: 'TNI', name: 'Tây Ninh', type: 'tinh' },
  { code: 'VL', name: 'Vĩnh Long', type: 'tinh' },
  { code: 'DT', name: 'Đồng Tháp', type: 'tinh' },
  { code: 'CM', name: 'Cà Mau', type: 'tinh' },
  { code: 'AG', name: 'An Giang', type: 'tinh' },
]

export const provinceName = (code: string) => PROVINCES.find((p) => p.code === code)?.name ?? ''
