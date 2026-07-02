# Đưa website chạy ONLINE thật với Supabase

Mặc định app chạy chế độ **localStorage** (chỉ lưu trên máy bạn — người khác không thấy).
Làm 5 bước dưới đây để **mọi khách đều thấy chung nội dung** và **đặt lịch về thẳng admin từ mọi thiết bị**.

---

## Bước 1 — Tạo project Supabase (miễn phí)
1. Vào https://supabase.com → đăng nhập → **New project**.
2. Đặt tên, chọn region gần VN (Singapore), đặt **Database Password** (lưu lại), bấm **Create**.
3. Chờ ~1 phút cho project khởi tạo xong.

## Bước 2 — Tạo bảng + phân quyền
1. Mở project → menu trái **SQL Editor** → **New query**.
2. Mở file `supabase/schema.sql` trong dự án, **copy toàn bộ**, dán vào, bấm **Run**.
   → Tạo 2 bảng `site_content`, `bookings`, bật bảo mật (RLS) và realtime.

## Bước 3 — Tạo tài khoản admin
1. Menu trái **Authentication** → **Users** → **Add user** → nhập **email + mật khẩu** cho bạn → **Create**.
2. (Khuyến nghị cho tiện) **Authentication → Providers → Email** → tắt **Confirm email** để đăng nhập được ngay không cần xác nhận mail.
   → Đây chính là tài khoản bạn dùng để đăng nhập trang `/admin`.

## Bước 4 — Lấy khoá API và dán vào .env
1. Menu trái **Project Settings → API**. Copy:
   - **Project URL** (dạng `https://xxxx.supabase.co`)
   - **anon public** key (chuỗi dài `eyJ...`)
2. Trong dự án, tạo file `.env` (copy từ `.env.example`) và điền:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
   ```
3. Chạy lại: `npm install && npm run dev` (nếu đang chạy thì tắt và bật lại để nạp .env).

## Bước 5 — Kiểm tra
- Vào `/admin/login`, đăng nhập bằng **email + mật khẩu** ở Bước 3.
- Vào **Giao diện mẫu** chọn 1 mẫu → **Áp dụng**. Mở website ở **máy/điện thoại khác** (hoặc tab ẩn danh) → sẽ thấy đúng mẫu đó. ✅
- Ở thiết bị khác, gửi 1 **đặt lịch** → quay lại admin mục **Đặt lịch** → thấy ngay (realtime). ✅

---

## Đưa lên mạng cho khách truy cập (deploy)
Cách nhanh nhất là **Vercel** (miễn phí):
1. Đẩy code lên GitHub.
2. Vào https://vercel.com → **Add New → Project** → chọn repo.
3. Framework tự nhận **Vite**. Vào **Environment Variables** thêm 2 biến
   `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (giá trị như Bước 4).
4. **Deploy**. Xong là có link `https://ten-cua-ban.vercel.app` gửi cho khách.
   (Có thể gắn tên miền riêng trong Vercel → Settings → Domains.)

## An toàn dữ liệu
- Khoá **anon key** để lộ là bình thường (nó chỉ có quyền theo RLS đã cấu hình).
- RLS đảm bảo: **khách chỉ đọc nội dung + gửi đặt lịch**; **chỉ tài khoản đăng nhập** mới sửa nội dung và xem/sửa danh sách đặt lịch.
- Muốn thêm người quản trị: tạo thêm user trong **Authentication → Users**.

## Gỡ lỗi thường gặp
- **Đăng nhập báo sai:** kiểm tra đã tắt "Confirm email" hoặc đã xác nhận email; đúng email/mật khẩu ở Bước 3.
- **Không thấy thay đổi ở máy khác:** kiểm tra `.env` đã điền đúng và đã **khởi động lại** dev server / redeploy.
- **Đặt lịch không về admin:** đảm bảo đã chạy `schema.sql` (đúng phần policy `bk_insert`, và realtime).
- Khi **bỏ trống** 2 biến .env → app tự quay về chế độ localStorage (đăng nhập demo `admin` / `admin123`).

---

# NÂNG CẤP: nhiều phòng khám dùng chung 1 Supabase (multi-tenant)

Từ bản này, `schema.sql` đã hỗ trợ **nhiều công ty/phòng khám** trong cùng 1 project Supabase.

## Cấu trúc
- `companies` — mỗi phòng khám 1 dòng (có `slug` riêng, vd `tuyetlan`, `nhakhoa-abc`).
- `memberships` — tài khoản admin thuộc công ty nào.
- `site_content`, `bookings` — gắn theo `company_id`; RLS đảm bảo admin chỉ thấy dữ liệu công ty mình.

## Tạo phòng khám đầu tiên
1. Chạy `supabase/schema.sql` (SQL Editor → Run).
2. Authentication → Users → tạo user (email + mật khẩu) cho admin phòng khám.
3. Trong SQL Editor chạy (thay `<USER_ID>` bằng id của user vừa tạo):
   ```sql
   insert into public.companies (slug, name) values ('tuyetlan', 'Phòng khám Tim mạch Tuyết Lan');
   insert into public.memberships (user_id, company_id, role)
   select '<USER_ID>', id, 'owner' from public.companies where slug = 'tuyetlan';
   ```
4. Đặt `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_SITE_SLUG=tuyetlan
   ```

## Mở thêm phòng khám khác (cùng project Supabase)
- Tạo user mới → `insert companies (slug,name)` với **slug khác** → `insert memberships` cho user đó.
- Bản deploy website của phòng khám mới chỉ cần đặt `VITE_SITE_SLUG=<slug-moi>`.
- Dữ liệu, nội dung, đặt lịch của các phòng khám **tách biệt hoàn toàn** nhờ RLS.

---

# Gửi email đặt lịch qua Gmail SMTP (Edge Function)

Khi khách bấm "Gửi đăng ký khám", ngoài lưu vào Đặt lịch, hệ thống gọi Edge Function
`send-booking-email` để gửi email (template đẹp) về hộp thư của bạn.

## Cài đặt
1. Cài Supabase CLI, đăng nhập, link project.
2. Deploy hàm:
   ```
   supabase functions deploy send-booking-email --no-verify-jwt
   ```
3. Tạo **App Password** của Gmail: Google Account → Security → 2‑Step Verification (bật) →
   App passwords → tạo mật khẩu 16 ký tự.
4. Đặt secrets:
   ```
   supabase secrets set SMTP_HOST=smtp.gmail.com SMTP_PORT=465 \
     SMTP_USER=ban@gmail.com SMTP_PASS=<app_password_16_ky_tu> \
     MAIL_TO=nhan@gmail.com "MAIL_FROM=Phòng khám Tuyết Lan <ban@gmail.com>"
   ```
5. Xong. Thử đặt lịch trên web → kiểm tra hộp thư `MAIL_TO`.

> Không cấu hình Edge Function cũng không sao — đặt lịch vẫn vào mục "Đặt lịch" trong admin,
> và bạn có thể dùng kênh email Web3Forms (Cài đặt chung) như một lựa chọn không cần server.
