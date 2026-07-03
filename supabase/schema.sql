-- ============================================================
--  NỀN TẢNG NHIỀU PHÒNG KHÁM (MULTI-TENANT) — 1 project Supabase
--  dùng chung cho NHIỀU công ty/phòng khám. Chạy trong SQL Editor → Run.
-- ============================================================

-- 1) CÔNG TY (mỗi phòng khám = 1 công ty, phân biệt bằng slug)
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,        -- vd: 'tuyetlan', 'nhakhoa-abc'
  name        text not null,
  created_at  timestamptz not null default now()
);

-- 2) THÀNH VIÊN (tài khoản admin thuộc công ty nào)
create table if not exists public.memberships (
  user_id     uuid not null references auth.users(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  role        text not null default 'owner',
  created_at  timestamptz not null default now(),
  primary key (user_id, company_id)
);

-- 3) NỘI DUNG WEBSITE (mỗi công ty 1 dòng)
create table if not exists public.site_content (
  company_id  uuid primary key references public.companies(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- 4) ĐẶT LỊCH (gắn theo công ty)
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  phone       text not null,
  service     text,
  date        text,
  time        text,
  note        text,
  status      text not null default 'new',
  created_at  timestamptz not null default now()
);
create index if not exists bookings_company_idx on public.bookings (company_id, created_at desc);

-- ============================================================
--  HÀM TIỆN ÍCH: kiểm tra user có thuộc công ty không
-- ============================================================
create or replace function public.is_member(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships m where m.company_id = cid and m.user_id = auth.uid());
$$;

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.companies    enable row level security;
alter table public.memberships  enable row level security;
alter table public.site_content enable row level security;
alter table public.bookings     enable row level security;

-- companies: ai cũng ĐỌC (để website public phân giải theo slug); tạo/sửa bởi thành viên
drop policy if exists co_read on public.companies;
drop policy if exists co_insert on public.companies;
drop policy if exists co_update on public.companies;
create policy co_read   on public.companies for select using (true);
create policy co_insert on public.companies for insert to authenticated with check (true);
create policy co_update on public.companies for update to authenticated using (public.is_member(id)) with check (public.is_member(id));

-- memberships: user chỉ thấy & tạo dòng của chính mình
drop policy if exists mem_read on public.memberships;
drop policy if exists mem_insert on public.memberships;
create policy mem_read   on public.memberships for select to authenticated using (user_id = auth.uid());
create policy mem_insert on public.memberships for insert to authenticated with check (user_id = auth.uid());

-- site_content: ai cũng ĐỌC; chỉ THÀNH VIÊN công ty đó mới ghi
drop policy if exists sc_read on public.site_content;
drop policy if exists sc_write on public.site_content;
drop policy if exists sc_update on public.site_content;
create policy sc_read   on public.site_content for select using (true);
create policy sc_write  on public.site_content for insert to authenticated with check (public.is_member(company_id));
create policy sc_update on public.site_content for update to authenticated using (public.is_member(company_id)) with check (public.is_member(company_id));

-- bookings: khách VÃNG LAI được GỬI; chỉ THÀNH VIÊN công ty đó mới xem/sửa/xoá
drop policy if exists bk_insert on public.bookings;
drop policy if exists bk_select on public.bookings;
drop policy if exists bk_update on public.bookings;
drop policy if exists bk_delete on public.bookings;
create policy bk_insert on public.bookings for insert to anon, authenticated with check (true);
create policy bk_select on public.bookings for select to authenticated using (public.is_member(company_id));
create policy bk_update on public.bookings for update to authenticated using (public.is_member(company_id)) with check (public.is_member(company_id));
create policy bk_delete on public.bookings for delete to authenticated using (public.is_member(company_id));

-- realtime (bọc trong DO để chạy lại nhiều lần không lỗi "already member")
do $$
begin
  begin alter publication supabase_realtime add table public.site_content; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.bookings;     exception when duplicate_object then null; end;
end $$;

-- ============================================================
--  5) CẤU HÌNH EMAIL ĐẶT LỊCH (SMTP Gmail) — RIÊNG TƯ
--  Chứa App Password nên KHÔNG cho public đọc: chỉ thành viên công ty
--  (đăng nhập admin) đọc/ghi; Edge Function dùng service_role để đọc khi gửi.
-- ============================================================
create table if not exists public.booking_email (
  company_id  uuid primary key references public.companies(id) on delete cascade,
  enabled     boolean not null default false,
  smtp_host   text    not null default 'smtp.gmail.com',
  smtp_port   int     not null default 465,
  smtp_user   text,                 -- địa chỉ Gmail dùng để gửi
  smtp_pass   text,                 -- App Password 16 ký tự (Gmail)
  mail_from   text,                 -- tên hiển thị người gửi (vd: Phòng khám Tuyết Lan)
  mail_to     text,                 -- email nhận thông báo đặt lịch
  updated_at  timestamptz not null default now()
);
alter table public.booking_email enable row level security;
drop policy if exists be_select on public.booking_email;
drop policy if exists be_insert on public.booking_email;
drop policy if exists be_update on public.booking_email;
-- CHỈ thành viên công ty được đọc/ghi (KHÔNG mở cho anon/public vì chứa mật khẩu).
create policy be_select on public.booking_email for select to authenticated using (public.is_member(company_id));
create policy be_insert on public.booking_email for insert to authenticated with check (public.is_member(company_id));
create policy be_update on public.booking_email for update to authenticated using (public.is_member(company_id)) with check (public.is_member(company_id));

-- ============================================================
--  HÀM TẠO NHANH 1 PHÒNG KHÁM (công ty + gắn admin) — CHẠY 1 LỆNH
--  Tạo hàm này 1 lần. Sau đó mỗi phòng khám chỉ cần gọi 1 dòng.
-- ============================================================
create or replace function public.setup_clinic(p_slug text, p_name text, p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare cid uuid; uid uuid;
begin
  -- 1) tạo (hoặc cập nhật tên) công ty theo slug
  insert into public.companies (slug, name) values (p_slug, p_name)
  on conflict (slug) do update set name = excluded.name
  returning id into cid;

  -- 2) tìm user admin theo email (phải đã tạo ở Authentication → Users)
  select id into uid from auth.users where email = lower(p_email);
  if uid is null then
    return 'ĐÃ tạo/cập nhật công ty "'||p_slug||'". CHƯA có user '||p_email||' → tạo ở Authentication → Users rồi chạy lại.';
  end if;

  -- 3) gắn user vào công ty
  insert into public.memberships (user_id, company_id, role)
  values (uid, cid, 'owner') on conflict do nothing;

  return 'OK: công ty "'||p_slug||'" + admin '||p_email||' đã sẵn sàng.';
end $$;

-- ============================================================
--  CÁCH DÙNG
-- ============================================================
-- Phòng khám hiện tại (khớp VITE_SITE_SLUG=tuyetlan):
--   select public.setup_clinic('tuyetlan', 'Phòng khám Tim mạch Tuyết Lan', 'email-admin@example.com');
--
-- MỞ THÊM PHÒNG KHÁM MỚI (source/deploy khác): tạo user mới ở Authentication → Users,
-- đặt VITE_SITE_SLUG = slug mới trong .env của bản deploy đó, rồi chạy đúng 1 dòng:
--   select public.setup_clinic('nhakhoa-abc', 'Nha khoa ABC', 'admin2@example.com');
--
--  Mỗi phòng khám có dữ liệu (đặt lịch, nội dung) riêng theo company_id.
-- ============================================================
