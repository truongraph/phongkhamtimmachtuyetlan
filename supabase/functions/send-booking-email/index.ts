// @ts-nocheck  — File này chạy trên Deno (Supabase Edge), KHÔNG phải Node.
// TypeScript của dự án (kiểu Node) không biết global `Deno` và các import từ URL,
// nên sẽ báo lỗi giả trong trình soạn thảo. Deno lúc chạy/deploy vẫn hiểu đầy đủ.
//
// Supabase Edge Function: send-booking-email
// Gửi email thông báo đặt lịch qua Gmail SMTP (App Password).
//
// Cấu hình SMTP lấy theo THỨ TỰ ưu tiên:
//   1) Bảng public.booking_email của công ty (đặt trong trang Quản trị → Sao lưu & Email).
//   2) Secrets môi trường (dự phòng): SMTP_HOST/PORT/USER/PASS, MAIL_FROM/MAIL_TO.
//
// Deploy:  supabase functions deploy send-booking-email --no-verify-jwt
// (Không cần đặt secrets nếu đã cấu hình trong trang quản trị.)

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

interface Booking { name: string; phone: string; service?: string; date?: string; time?: string; note?: string; company_id?: string; clinic?: string; primary?: string; accent?: string }

// Trộn màu về phía 1 màu nền tối → tạo tông ĐẬM cho gradient header (giống --tl-deep trên web).
function mixHex(hex: string, target: [number, number, number], p: number): string {
  const h = (hex || '').replace('#', '')
  if (h.length < 6) return hex
  const n = parseInt(h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const m = (c: number, t: number) => Math.round(c * (1 - p) + t * p)
  const hx = (v: number) => v.toString(16).padStart(2, '0')
  return `#${hx(m(r, target[0]))}${hx(m(g, target[1]))}${hx(m(b, target[2]))}`
}

// Bỏ dấu tiếng Việt + emoji → chỉ còn ASCII, để TIÊU ĐỀ email không bị denomailer
// mã hoá thành "encoded-word" sai chuẩn (khiến Gmail hiện raw). Body vẫn giữ có dấu.
function ascii(s: string): string {
  return (s || '')
    .normalize('NFD')                 // tách chữ + dấu (ế → e + ́)
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^\x20-\x7E]/g, '')     // bỏ mọi ký tự ngoài ASCII (dấu, emoji)
    .replace(/\s+/g, ' ')
    .trim()
}
function textBody(b: Booking, clinic: string): string {
  return [
    `${clinic} — Yêu cầu đặt lịch mới`,
    '',
    `Họ và tên: ${b.name}`,
    `Điện thoại: ${b.phone}`,
    b.service ? `Dịch vụ: ${b.service}` : '',
    `Ngày mong muốn: ${b.date || '(chưa chọn)'}`,
    b.time ? `Buổi khám: ${b.time}` : '',
    b.note ? `Ghi chú: ${b.note}` : '',
  ].filter(Boolean).join('\n')
}

function html(b: Booking, clinic: string, primary: string, accent: string) {
  const deep = mixHex(primary, [11, 34, 62], 0.42) // tông đậm cho gradient (giống --tl-deep)
  const tel = (b.phone || '').replace(/\s/g, '')
  const esc = (s: string) => (s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
  const row = (icon: string, label: string, val?: string, last = false) => val
    ? `<tr>
        <td style="padding:14px 18px;border-bottom:${last ? '0' : '1px solid #eef1f6'};width:150px;color:#64748b;font-size:13px;vertical-align:top">
          <span style="display:inline-block;width:20px">${icon}</span> ${label}
        </td>
        <td style="padding:14px 18px;border-bottom:${last ? '0' : '1px solid #eef1f6'};color:#0f172a;font-weight:600;font-size:15px;vertical-align:top">${esc(val)}</td>
      </tr>`
    : ''
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Roboto,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7">
    <tr><td align="center" style="padding:28px 14px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 34px rgba(15,23,42,.10)">
        <!-- HEADER -->
        <tr><td style="background-color:${primary};background-image:linear-gradient(125deg,${primary},${deep});padding:30px 34px">
          <div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,.82);font-weight:700">🩺 Yêu cầu đặt lịch mới</div>
          <div style="font-size:23px;font-weight:800;color:#ffffff;margin-top:6px;line-height:1.25">${esc(clinic)}</div>
        </td></tr>
        <!-- BODY -->
        <tr><td style="padding:28px 34px 8px">
          <p style="margin:0 0 4px;color:#0f172a;font-size:16px;font-weight:700">Bạn có một lịch hẹn mới 🎉</p>
          <p style="margin:0 0 20px;color:#64748b;font-size:14px">Một bệnh nhân vừa gửi yêu cầu đặt lịch qua website. Thông tin chi tiết:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eef1f6;border-radius:14px;overflow:hidden">
            ${row('👤', 'Họ và tên', b.name)}
            ${row('📞', 'Điện thoại', b.phone)}
            ${row('🩻', 'Dịch vụ', b.service)}
            ${row('📅', 'Ngày mong muốn', b.date || '(chưa chọn)')}
            ${row('🕒', 'Buổi khám', b.time)}
            ${row('📝', 'Ghi chú', b.note, true)}
          </table>
        </td></tr>
        <!-- CTA -->
        <tr><td style="padding:22px 34px 30px" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:12px;background:${accent}">
            <a href="tel:${tel}" style="display:inline-block;padding:15px 30px;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;border-radius:12px">📞 Gọi lại cho bệnh nhân</a>
          </td></tr></table>
          <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;line-height:1.6">Email tự động từ website · Vui lòng liên hệ bệnh nhân để xác nhận lịch hẹn.</p>
        </td></tr>
      </table>
      <div style="margin-top:16px;color:#94a3b8;font-size:12px">${esc(clinic)} — Hệ thống đặt lịch website</div>
    </td></tr>
  </table>
</body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const b = (await req.json()) as Booking
    if (!b?.name || !b?.phone) return json({ error: 'Thiếu tên/điện thoại' }, 400)

    // Cấu hình mặc định từ secrets (dự phòng)
    let host = Deno.env.get('SMTP_HOST') ?? 'smtp.gmail.com'
    let port = Number(Deno.env.get('SMTP_PORT') ?? '465')
    let user = Deno.env.get('SMTP_USER') ?? ''
    let pass = Deno.env.get('SMTP_PASS') ?? ''
    let from = Deno.env.get('MAIL_FROM') ?? ''
    let to = Deno.env.get('MAIL_TO') ?? ''

    // Ưu tiên cấu hình theo công ty trong DB (đọc bằng service_role, bỏ qua RLS)
    if (b.company_id) {
      const url = Deno.env.get('SUPABASE_URL')
      const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (url && svc) {
        const admin = createClient(url, svc)
        const { data } = await admin.from('booking_email').select('*').eq('company_id', b.company_id).maybeSingle()
        if (data) {
          if (data.enabled === false) return json({ ok: false, skipped: 'disabled' })
          if (data.smtp_user && data.smtp_pass) {
            host = data.smtp_host || host
            port = data.smtp_port || port
            user = data.smtp_user
            pass = data.smtp_pass
            // "from" thân thiện: nếu là tên hiển thị (không có @) thì ghép với địa chỉ Gmail
            from = data.mail_from
              ? (String(data.mail_from).includes('@') ? data.mail_from : `${data.mail_from} <${data.smtp_user}>`)
              : data.smtp_user
            to = data.mail_to || data.smtp_user
          }
        }
      }
    }

    if (!user || !pass) return json({ error: 'Chưa cấu hình SMTP (thiếu email/App Password).' }, 400)

    const client = new SMTPClient({
      connection: { hostname: host, port, tls: port === 465, auth: { username: user, password: pass } },
    })
    await client.send({
      from: from || user,
      to: to || user,
      subject: ascii(`[Dat lich moi] ${b.name} - ${b.phone}`),
      content: textBody(b, b.clinic || 'Phòng khám'),
      html: html(b, b.clinic || 'Phòng khám', b.primary || '#0070F4', b.accent || '#d81e28'),
    })
    await client.close()
    return json({ ok: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
