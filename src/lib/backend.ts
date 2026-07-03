import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SiteContent } from '@/store/content'
import { sessionStore } from '@/lib/session'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
// Slug của phòng khám cho bản deploy này (mỗi công ty 1 slug, cùng 1 project Supabase).
const SITE_SLUG = import.meta.env.VITE_SITE_SLUG as string | undefined

export const isBackend = Boolean(url && anon)
export const supabase: SupabaseClient | null = isBackend
  ? createClient(url!, anon!, {
      // Lưu phiên theo lựa chọn "Ghi nhớ đăng nhập": localStorage (nhớ) hoặc sessionStorage (không nhớ).
      auth: { storage: sessionStore, persistSession: true, autoRefreshToken: true },
    })
  : null

/* ---------- MULTI-TENANT: xác định công ty (tenant) đang hoạt động ---------- */
let activeCompanyId: string | null = null
export function getActiveCompanyId() { return activeCompanyId }
export function setActiveCompanyId(id: string | null) { activeCompanyId = id }

/** Tìm công ty theo slug (public đọc được để render website theo tên miền/slug). */
export async function resolveCompanyBySlug(slug: string): Promise<{ id: string; name: string } | null> {
  if (!supabase) return null
  const { data } = await supabase.from('companies').select('id,name').eq('slug', slug).maybeSingle()
  return (data as any) ?? null
}

/** Công ty đang hoạt động: ưu tiên công ty của tài khoản admin đăng nhập, sau đó tới slug của deploy. */
export async function resolveActiveCompany(): Promise<string | null> {
  if (!supabase) return null
  if (activeCompanyId) return activeCompanyId
  const { data: sess } = await supabase.auth.getSession()
  if (sess.session) {
    const { data } = await supabase.from('memberships').select('company_id').limit(1).maybeSingle()
    if (data?.company_id) { activeCompanyId = data.company_id as string; return activeCompanyId }
  }
  if (SITE_SLUG) {
    const c = await resolveCompanyBySlug(SITE_SLUG)
    if (c) { activeCompanyId = c.id; return activeCompanyId }
  }
  return null
}

/**
 * Tự cấu hình khi admin đăng nhập: tạo công ty theo VITE_SITE_SLUG (nếu chưa có)
 * và thêm chính user đang đăng nhập vào công ty. Nhờ RLS cho phép authenticated
 * tạo company + tự thêm membership của mình → KHÔNG cần chạy SQL tay.
 */
export async function ensureTenant(defaultName?: string): Promise<string | null> {
  if (!supabase || !SITE_SLUG) return null
  const { data: sess } = await supabase.auth.getSession()
  if (!sess.session) return null

  let c = await resolveCompanyBySlug(SITE_SLUG)
  if (!c) {
    const { error } = await supabase.from('companies').insert({ slug: SITE_SLUG, name: defaultName || SITE_SLUG })
    if (error && error.code !== '23505') console.warn('[backend] ensureTenant company', error.message)
    c = await resolveCompanyBySlug(SITE_SLUG)
  }
  if (!c) return null
  activeCompanyId = c.id

  const { data: mem } = await supabase.from('memberships').select('company_id').eq('company_id', c.id).maybeSingle()
  if (!mem) {
    const { error } = await supabase.from('memberships').insert({ user_id: sess.session.user.id, company_id: c.id, role: 'owner' })
    if (error && error.code !== '23505') console.warn('[backend] ensureTenant membership', error.message)
  }
  return c.id
}

/** Số công ty mà tài khoản đang đăng nhập là thành viên. null = chưa đăng nhập / chưa cấu hình. */
export async function countMyMemberships(): Promise<number | null> {
  if (!supabase) return null
  const { data: sess } = await supabase.auth.getSession()
  if (!sess.session) return null
  const { data, error } = await supabase.from('memberships').select('company_id')
  if (error) return null
  return (data ?? []).length
}

/* ---------- CONTENT (theo company_id) ---------- */
export interface RemoteContent { data: Partial<SiteContent>; updatedAt: string }
export async function fetchContent(): Promise<RemoteContent | null> {
  if (!supabase) return null
  const cid = await resolveActiveCompany(); if (!cid) return null
  const { data, error } = await supabase.from('site_content').select('data,updated_at').eq('company_id', cid).maybeSingle()
  if (error) { console.warn('[backend] fetchContent', error.message); return null }
  if (!data?.data) return null
  return { data: data.data as Partial<SiteContent>, updatedAt: (data.updated_at as string) ?? '' }
}
export async function pushContent(content: SiteContent, ts?: string): Promise<void> {
  if (!supabase) return
  const cid = await resolveActiveCompany(); if (!cid) return
  const updated_at = ts || new Date().toISOString()
  const { error } = await supabase.from('site_content').upsert({ company_id: cid, data: content, updated_at }, { onConflict: 'company_id' })
  if (error) console.warn('[backend] pushContent', error.message)
}

/* ---------- BOOKINGS (theo company_id) ---------- */
export interface RemoteBooking {
  id: string; name: string; phone: string; service: string; date: string; time: string
  note?: string; status: 'new' | 'accepted' | 'done'; created_at: string
}
export async function insertBooking(b: { name: string; phone: string; service: string; date: string; time: string; note?: string }) {
  if (!supabase) return { ok: false }
  const cid = await resolveActiveCompany(); if (!cid) return { ok: false }
  const { error } = await supabase.from('bookings').insert({ ...b, company_id: cid })
  return { ok: !error }
}
export async function sendBookingEmailEdge(b: { name: string; phone: string; service: string; date: string; time: string; note?: string; clinic?: string; primary?: string; accent?: string }) {
  if (!supabase) return { ok: false }
  const cid = await resolveActiveCompany()
  try {
    const { error } = await supabase.functions.invoke('send-booking-email', { body: { ...b, company_id: cid } })
    return { ok: !error }
  } catch (e) { console.warn('[backend] sendBookingEmailEdge', e); return { ok: false } }
}

/* ---------- CẤU HÌNH EMAIL ĐẶT LỊCH (SMTP Gmail) ---------- */
export interface BookingEmailCfg {
  enabled: boolean
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_pass: string
  mail_from: string
  mail_to: string
}
export const DEFAULT_EMAIL_CFG: BookingEmailCfg = {
  enabled: false, smtp_host: 'smtp.gmail.com', smtp_port: 465, smtp_user: '', smtp_pass: '', mail_from: '', mail_to: '',
}

/** Đọc cấu hình SMTP của công ty đang đăng nhập (null nếu chưa cấu hình/không có backend). */
export async function fetchBookingEmail(): Promise<BookingEmailCfg | null> {
  if (!supabase) return null
  const cid = await resolveActiveCompany(); if (!cid) return null
  const { data, error } = await supabase.from('booking_email').select('*').eq('company_id', cid).maybeSingle()
  if (error) { console.warn('[backend] fetchBookingEmail', error.message); return null }
  return data ? { ...DEFAULT_EMAIL_CFG, ...(data as any) } : null
}

/** Lưu cấu hình SMTP cho công ty đang đăng nhập. */
export async function saveBookingEmail(cfg: BookingEmailCfg): Promise<{ ok: boolean; msg?: string }> {
  if (!supabase) return { ok: false, msg: 'Chưa cấu hình máy chủ (Supabase).' }
  const cid = await resolveActiveCompany(); if (!cid) return { ok: false, msg: 'Chưa xác định được công ty.' }
  const { error } = await supabase.from('booking_email').upsert(
    { company_id: cid, ...cfg, smtp_port: Number(cfg.smtp_port) || 465, updated_at: new Date().toISOString() },
    { onConflict: 'company_id' },
  )
  if (!error) return { ok: true }
  const missing = /schema cache|does not exist|booking_email/i.test(error.message)
  return { ok: false, msg: missing ? 'Chưa tạo bảng booking_email trên Supabase. Hãy chạy đoạn SQL (SQL Editor) rồi thử lại.' : error.message }
}

/** Gửi 1 email KIỂM TRA theo cấu hình đã lưu. */
export async function sendTestBookingEmail(clinic: string, primary?: string, accent?: string): Promise<{ ok: boolean; msg?: string }> {
  if (!supabase) return { ok: false, msg: 'Chưa cấu hình máy chủ (Supabase).' }
  const cid = await resolveActiveCompany(); if (!cid) return { ok: false, msg: 'Chưa xác định được công ty.' }
  try {
    const { data, error } = await supabase.functions.invoke('send-booking-email', {
      body: { name: 'Khách kiểm tra', phone: '0900 000 000', service: 'Kiểm tra cấu hình email', note: 'Đây là email thử — nếu bạn nhận được nghĩa là SMTP đã hoạt động.', company_id: cid, clinic, primary, accent },
    })
    if (error) return { ok: false, msg: 'Gửi thất bại — kiểm tra lại email/App Password.' }
    if (data && (data as any).error) return { ok: false, msg: (data as any).error }
    return { ok: true }
  } catch (e) { return { ok: false, msg: String(e) } }
}
export async function fetchBookings(): Promise<RemoteBooking[] | null> {
  if (!supabase) return null
  const cid = await resolveActiveCompany(); if (!cid) return null
  const { data, error } = await supabase.from('bookings').select('*').eq('company_id', cid).order('created_at', { ascending: false })
  if (error) { console.warn('[backend] fetchBookings', error.message); return null }
  return (data as RemoteBooking[]) ?? []
}
export async function updateBookingStatus(id: string, status: string) {
  if (!supabase) return
  await supabase.from('bookings').update({ status }).eq('id', id)
}
export async function deleteBooking(id: string) {
  if (!supabase) return
  await supabase.from('bookings').delete().eq('id', id)
}

/* ---------- REALTIME ---------- */
export function subscribeContent(cid: string, cb: (data: Partial<SiteContent>, updatedAt: string) => void): () => void {
  if (!supabase) return () => {}
  const ch = supabase.channel('rt-content-' + cid)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content', filter: `company_id=eq.${cid}` },
      (payload) => { const row = payload.new as any; if (row?.data) cb(row.data as Partial<SiteContent>, (row.updated_at as string) ?? '') })
    .subscribe()
  return () => { supabase!.removeChannel(ch) }
}
export function subscribeBookings(cid: string, cb: () => void): () => void {
  if (!supabase) return () => {}
  const ch = supabase.channel('rt-bookings-' + cid)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `company_id=eq.${cid}` }, () => cb())
    .subscribe()
  return () => { supabase!.removeChannel(ch) }
}
