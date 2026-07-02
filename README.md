# Website Phòng khám Tim mạch Tuyết Lan

Website giới thiệu phòng khám + **trang quản trị (Admin CMS)** cho phép chỉnh sửa toàn bộ nội dung, bố cục và giao diện — kiểu WordPress. Xây bằng **React + TypeScript + Vite + Tailwind CSS + shadcn/ui**.

## 1. Cài đặt & chạy

```bash
npm install
npm run dev        # chạy môi trường phát triển (mặc định http://localhost:5173)
```

Build production:
```bash
npm run build      # xuất ra thư mục dist/
npm run preview    # xem thử bản build
```

## 2. Truy cập

| Trang | Đường dẫn |
|------|-----------|
| Website | `/` |
| Đăng nhập quản trị | `/admin/login` |
| Bảng quản trị | `/admin` |

**Tài khoản demo (chỉ chế độ localStorage):** `admin` / `admin123` → đổi trong mục **Tài khoản**. Khi đã cấu hình Supabase (mục 5), đăng nhập bằng **email + mật khẩu** tạo ở Authentication (xem Bước 4).

## 3. Kiến trúc (vì sao admin & web luôn đồng nhất)

- **Một nguồn dữ liệu duy nhất:** toàn bộ nội dung nằm trong `src/store/content.ts` (Zustand), lưu vào **localStorage**.
- **Website** (`src/site/`) render động từ store: thứ tự section, ẩn/hiện, màu sắc, phông chữ, và mọi văn bản.
- **Admin** (`src/admin/`) ghi vào **chính store đó** → mọi thay đổi hiện ngay trên website. Có đồng bộ giữa các tab qua sự kiện `storage`.
- **Giao diện chỉnh bằng biến CSS** (`--tl-primary`, `--tl-accent`, …) do `ThemeStyle` bơm vào, nên đổi màu/phông trong admin áp dụng tức thì.

```
src/
  store/       content.ts (dữ liệu + kiểu), auth.ts (đăng nhập)
  site/        SitePage, SiteChrome (header/footer/menu), ThemeStyle, sections/
  admin/       AdminLayout (sidebar), Login, pages/ (các trình soạn thảo)
  components/ui shadcn/ui
```

## 4. Chức năng Admin (giống WordPress)

- **Bố cục trang:** bật/tắt & sắp xếp thứ tự các phần (Hero luôn đầu, cố định).
- **Trang chủ (Hero):** tiêu đề, mô tả, các dòng nổi bật, tiêu đề form, ảnh bác sĩ.
- **Giới thiệu / Dịch vụ / Cam kết / Chuyên môn / Đào tạo & Nghiên cứu / Liên hệ:** thêm/sửa/xoá/di chuyển từng mục, chọn biểu tượng.
- **Cài đặt chung:** tên phòng khám, liên hệ (SĐT tự định dạng), địa chỉ (chọn tỉnh/phường có tìm kiếm), giờ làm việc, **logo (upload)**, **màu sắc**, **phông chữ (Google Fonts: tiêu đề + nội dung)**, bo góc, khôi phục mặc định.
- **Kho giao diện mẫu:** 20 mẫu, mỗi mẫu bố cục & phối màu riêng; xem trước bằng nội dung thật, bấm **Áp dụng** đổi toàn bộ website.
- **Tài khoản:** đổi tên đăng nhập & mật khẩu.

## 5. QUAN TRỌNG: localStorage và việc public cho người dùng thật

**Trả lời thẳng câu hỏi “khi public website, mình sửa thì người dùng có thấy không?”**

> **KHÔNG.** Với bản mặc định, nội dung lưu trong **localStorage của từng trình duyệt**. Khi bạn sửa trong admin, thay đổi chỉ nằm trên **máy/trình duyệt của bạn**. Khách truy cập bằng máy khác vẫn thấy nội dung gốc. Tương tự, đặt lịch của khách ở máy khác **không** tự về mục “Đặt lịch” của bạn.

localStorage chỉ hợp để: bạn tự chỉnh và xem trước, hoặc demo trên 1 máy. Muốn **mọi người thấy chung** một nội dung và **nhận được đặt lịch từ khách**, bắt buộc phải có **nơi lưu chung online (backend/database)**.

### Cách 1 — Nhận đặt lịch qua email ngay (không cần lập trình backend)
Vào **Admin › Cài đặt chung › Nhận đặt lịch**, tạo Access Key miễn phí ở [web3forms.com](https://web3forms.com), dán vào. Từ đó **mỗi lượt đặt lịch của khách (bất kỳ máy nào) sẽ gửi email về hộp thư của bạn**. (Danh sách trong mục “Đặt lịch” vẫn là bản lưu cục bộ.)

### Cách 2 — Dùng chung online bằng Supabase (khuyến nghị, MIỄN PHÍ)
Để **mọi khách thấy cùng nội dung** và **mọi đặt lịch về một nơi**. App hỗ trợ **nhiều phòng khám trên cùng 1 project Supabase** (multi-tenant): mỗi phòng khám phân biệt bằng một **slug** (`VITE_SITE_SLUG`).

**Bước 1 — Tạo project & chạy schema.** Tạo project tại [supabase.com](https://supabase.com) (free). Vào **SQL Editor**, mở file [`supabase/schema.sql`](supabase/schema.sql) trong repo, **dán toàn bộ → Run**. (Tạo bảng `companies`, `memberships`, `site_content`, `bookings` + RLS + hàm tiện ích `setup_clinic`.) Chỉ chạy **1 lần** cho cả project.

**Bước 2 — Lấy khoá.** **Project Settings › API** → copy `Project URL` và `anon public key` (hoặc `publishable key` dạng `sb_publishable_...`).

**Bước 3 — Tạo file `.env`** (theo `.env.example`):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # hoặc eyJhbGci...
VITE_SITE_SLUG=tuyetlan                      # slug của phòng khám cho bản deploy này
```
`VITE_SITE_SLUG` phải khớp một dòng `companies.slug` trong DB (tạo ở Bước 5).

**Bước 4 — Tạo tài khoản admin.** **Authentication › Users › Add user** (email + mật khẩu). Đây là tài khoản đăng nhập `/admin` (khi đã cấu hình Supabase, đăng nhập dùng **Supabase Auth**, không dùng tài khoản demo nữa).

**Bước 5 — Đăng nhập lần đầu (TỰ cấu hình).** Mở `/admin/login`, đăng nhập bằng tài khoản ở Bước 4. **Ngay lần đăng nhập đầu tiên, app tự tạo công ty theo `VITE_SITE_SLUG` và gắn tài khoản của bạn vào công ty** (hàm `ensureTenant` trong `src/store/auth.ts`) — **không cần chạy SQL tay**. Xong: nội dung & đặt lịch dùng chung online, realtime trên mọi máy.

> Cơ chế: RLS cho phép user đã đăng nhập tạo `companies` và tự thêm `memberships` của chính mình, nên lần đăng nhập đầu tiên tự bootstrap. Muốn làm thủ công vẫn được: `select public.setup_clinic('tuyetlan','Phòng khám…','email');` trong SQL Editor.

### 5b. Thêm admin khác cho CÙNG phòng khám
Chỉ cần **tạo thêm user** ở **Authentication › Users**. Khi họ đăng nhập `/admin` (đúng slug), app **tự thêm họ vào công ty** — không cần SQL. (Nếu bị lỗi RLS hiếm gặp, trang Đặt lịch sẽ hiện nút hướng dẫn.)

### 5c. Mở phòng khám MỚI (deploy khác, dùng lại project & anon key này)
1 project Supabase phục vụ nhiều phòng khám. Với mỗi phòng khám mới:
1. Bản deploy đó đặt `VITE_SITE_SLUG=slug-moi` trong `.env`.
2. Tạo user admin ở **Authentication › Users** → đăng nhập lần đầu là **tự tạo công ty mới** cho slug đó.

Dữ liệu mỗi phòng khám (đặt lịch, nội dung) **tách biệt theo `company_id`**, không lẫn nhau.

## 6. Đưa website lên mạng bằng Vercel (miễn phí)

1. Đẩy code lên **GitHub** (một repository).
2. Vào [vercel.com](https://vercel.com) › **Add New Project** › chọn repo. Vercel tự nhận Vite:
   - Build Command: `npm run build` · Output: `dist`
3. **Environment Variables** (nếu dùng Supabase): thêm `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` và `VITE_SITE_SLUG`.
4. Bấm **Deploy**. Xong — có link `https://ten-cua-ban.vercel.app`.

File `vercel.json` đã có sẵn (rewrite mọi đường dẫn về `index.html` để `/admin` hoạt động khi F5). Admin truy cập tại `<link>/admin`.

## 7. Font chữ
Trong **Cài đặt chung › Giao diện** có 2 ô chọn phông (đều là Google Fonts, có sẵn tiếng Việt): **Phông tiêu đề** và **Phông nội dung** (mặc định **Inter**). Danh sách gồm Inter, Be Vietnam Pro, Roboto, Open Sans, Montserrat, Poppins, Nunito Sans, Work Sans, Lexend, Lora, Merriweather, Playfair Display, Roboto Slab. Phông được nạp tự động và áp dụng ngay cho website.

## 8. Mức độ “động” của admin
Gần như **toàn bộ** văn bản/hình/màu là chỉnh được: tên & thông tin phòng khám, logo, màu (chính/navy/nhấn), phông, bo góc, giờ làm việc, tiêu đề + nhãn nhỏ (eyebrow) của mọi khu vực, Hero + form, giới thiệu (đoạn/thẻ/bằng cấp/trích dẫn), dịch vụ, cam kết, chuyên môn, đào tạo & nghiên cứu, liên hệ, chân trang, bố cục (ẩn/hiện + thứ tự), và nhận đặt lịch. Danh sách dịch vụ trong form đặt lịch tự sinh theo mục Dịch vụ.
