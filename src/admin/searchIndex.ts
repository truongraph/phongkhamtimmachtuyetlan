// Chỉ mục tìm kiếm: các MỤC/TRƯỜNG bên trong từng trang quản trị.
// Nhờ vậy gõ "tiêu đề", "ảnh", "màu", "giờ làm việc"… sẽ gợi ý đúng trang chứa mục đó.
export interface SearchItem { label: string; page: string; to: string; keywords?: string }

export const SEARCH_INDEX: SearchItem[] = [
  // Trang chủ
  { label: 'Huy hiệu & tiêu đề', page: 'Trang chủ', to: '/admin/hero', keywords: 'badge tieu de title mo ta subtitle' },
  { label: 'Điểm nổi bật (dấu tích)', page: 'Trang chủ', to: '/admin/hero', keywords: 'bullet diem noi bat' },
  { label: 'Form đặt lịch & ảnh bác sĩ', page: 'Trang chủ', to: '/admin/hero', keywords: 'form dang ky anh bac si doctor' },
  // Dải số liệu
  { label: 'Dải số liệu (con số nổi bật)', page: 'Dải số liệu', to: '/admin/stats', keywords: 'dai so lieu con so noi bat stats nam kinh nghiem chung chi' },
  // Giới thiệu bác sĩ
  { label: 'Tiêu đề & ảnh bác sĩ', page: 'Giới thiệu bác sĩ', to: '/admin/about', keywords: 'tieu de title anh photo ten vai tro' },
  { label: 'Đoạn giới thiệu (văn bản)', page: 'Giới thiệu bác sĩ', to: '/admin/about', keywords: 'paragraph van ban noi dung' },
  { label: 'Bằng cấp & chứng chỉ', page: 'Giới thiệu bác sĩ', to: '/admin/about', keywords: 'credential bang cap chung chi' },
  { label: 'Thẻ (tags) & trích dẫn', page: 'Giới thiệu bác sĩ', to: '/admin/about', keywords: 'tag the quote trich dan' },
  // Dịch vụ / Cam kết / Chuyên môn
  { label: 'Tiêu đề & danh sách dịch vụ', page: 'Dịch vụ', to: '/admin/services', keywords: 'tieu de dich vu service' },
  { label: 'Tiêu đề & lý do cam kết', page: 'Cam kết', to: '/admin/why', keywords: 'cam ket ly do why vi sao chon' },
  { label: 'Tiêu đề & lĩnh vực chuyên môn', page: 'Chuyên môn', to: '/admin/specialties', keywords: 'chuyen mon linh vuc specialty' },
  // Đào tạo & Nghiên cứu
  { label: 'Bằng cấp · Chứng chỉ · Kinh nghiệm', page: 'Đào tạo & Nghiên cứu', to: '/admin/journey', keywords: 'dao tao bang cap chung chi kinh nghiem timeline' },
  { label: 'Nghiên cứu khoa học', page: 'Đào tạo & Nghiên cứu', to: '/admin/journey', keywords: 'nghien cuu research' },
  // Khối tùy chọn
  { label: 'Cảm nhận bệnh nhân (đánh giá)', page: 'Cảm nhận bệnh nhân', to: '/admin/testimonials', keywords: 'cam nhan danh gia review testimonial benh nhan khach hang' },
  { label: 'Câu hỏi thường gặp (FAQ)', page: 'Câu hỏi thường gặp', to: '/admin/faq', keywords: 'cau hoi thuong gap faq hoi dap' },
  { label: 'Bảng giá dịch vụ', page: 'Bảng giá dịch vụ', to: '/admin/pricing', keywords: 'bang gia dich vu chi phi pricing gia tien' },
  { label: 'Thư viện ảnh', page: 'Thư viện ảnh', to: '/admin/gallery', keywords: 'thu vien anh gallery hinh anh phong kham' },
  // Liên hệ
  { label: 'Tiêu đề & mô tả liên hệ', page: 'Liên hệ', to: '/admin/contact', keywords: 'lien he contact tieu de mo ta' },
  // Cài đặt chung
  { label: 'Thông tin phòng khám', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'ten phong kham tagline slogan phuong cham' },
  { label: 'Số điện thoại (hotline)', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'sdt dien thoai hotline phone so' },
  { label: 'Địa chỉ phòng khám', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'dia chi address ban do map phuong quan' },
  { label: 'SEO (tiêu đề & mô tả trang)', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'seo tieu de mo ta google title description' },
  { label: 'Giờ làm việc', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'gio lam viec hours mo cua' },
  { label: 'Logo phòng khám', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'logo hinh anh thuong hieu' },
  { label: 'Màu sắc (chính · phụ · đỏ)', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'mau sac color chinh phu do primary accent bo mau' },
  { label: 'Phông chữ (font)', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'phong chu font tieu de noi dung chu' },
  { label: 'Dải kêu gọi cuối trang (CTA)', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'cta keu goi call to action cham soc trai tim tieu de mo ta cuoi trang' },
  { label: 'Chân trang (footer)', page: 'Cài đặt chung', to: '/admin/settings', keywords: 'footer chan trang mo ta' },
  // Giao diện mẫu / Bố cục
  { label: 'Kho giao diện mẫu', page: 'Giao diện mẫu', to: '/admin/themes', keywords: 'mau template giao dien theme phoi mau' },
  { label: 'Tùy chỉnh giao diện (bố cục & sửa trực quan)', page: 'Tùy chỉnh giao diện', to: '/admin/customize', keywords: 'tuy chinh giao dien bo cuc sap xep an hien layout keo tha xem truoc sua truc quan editor customize' },
  // Đặt lịch
  { label: 'Danh sách đặt lịch', page: 'Đặt lịch', to: '/admin/bookings', keywords: 'dat lich booking benh nhan lich hen' },
  // Sao lưu & Email
  { label: 'Nhận đặt lịch qua Gmail (SMTP)', page: 'Sao lưu & Email', to: '/admin/backup', keywords: 'email smtp gmail thong bao nhan mail app password' },
  { label: 'Sao lưu & khôi phục dữ liệu', page: 'Sao lưu & Email', to: '/admin/backup', keywords: 'sao luu backup khoi phuc xuat nhap json' },
  // Tài khoản
  { label: 'Đổi mật khẩu / tài khoản', page: 'Tài khoản', to: '/admin/account', keywords: 'tai khoan mat khau password dang nhap doi' },
]
