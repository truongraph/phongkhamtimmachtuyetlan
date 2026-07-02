// Supabase Edge Function: send-booking-email
// Gửi email thông báo đặt lịch qua Gmail SMTP (dùng App Password).
//
// Deploy:
//   supabase functions deploy send-booking-email --no-verify-jwt
// Secrets cần đặt (Supabase → Edge Functions → Secrets, hoặc CLI):
//   supabase secrets set SMTP_HOST=smtp.gmail.com SMTP_PORT=465 \
//     SMTP_USER=ban@gmail.com SMTP_PASS=app_password_16_ky_tu \
//     MAIL_TO=nhan@gmail.com MAIL_FROM="Phòng khám Tuyết Lan <ban@gmail.com>"
//
// Lưu ý: Gmail yêu cầu bật 2FA rồi tạo "App password" (mật khẩu ứng dụng 16 ký tự).

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface Booking { name: string; phone: string; service?: string; date?: string; time?: string; note?: string }

function html(b: Booking) {
  const row = (label: string, val?: string) => val
    ? `<tr><td style="padding:8px 0;color:#64748b;width:130px">${label}</td><td style="padding:8px 0;color:#0f172a;font-weight:600">${val}</td></tr>`
    : ''
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Segoe UI,Arial,sans-serif">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.08)">
    <div style="background:linear-gradient(120deg,#12579e,#0b3b70);padding:24px 28px;color:#fff">
      <div style="font-size:13px;letter-spacing:1px;opacity:.85;text-transform:uppercase">Yêu cầu đặt lịch mới</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px">Phòng khám Tim mạch Tuyết Lan</div>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0 0 12px;color:#334155">Có một bệnh nhân vừa gửi yêu cầu đặt lịch khám:</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px">
        ${row('Họ và tên', b.name)}
        ${row('Điện thoại', b.phone)}
        ${row('Dịch vụ', b.service)}
        ${row('Ngày mong muốn', b.date || '(chưa chọn)')}
        ${row('Buổi khám', b.time)}
        ${row('Ghi chú', b.note)}
      </table>
      <a href="tel:${(b.phone || '').replace(/\s/g, '')}" style="display:inline-block;margin-top:20px;background:#d81e28;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px">Gọi lại cho bệnh nhân</a>
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px">Email tự động từ website. Vui lòng liên hệ bệnh nhân để xác nhận lịch hẹn.</p>
    </div>
  </div></body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const b = (await req.json()) as Booking
    if (!b?.name || !b?.phone) return new Response(JSON.stringify({ error: 'Thiếu tên/điện thoại' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') ?? 'smtp.gmail.com',
        port: Number(Deno.env.get('SMTP_PORT') ?? '465'),
        tls: true,
        auth: { username: Deno.env.get('SMTP_USER')!, password: Deno.env.get('SMTP_PASS')! },
      },
    })
    await client.send({
      from: Deno.env.get('MAIL_FROM') ?? Deno.env.get('SMTP_USER')!,
      to: Deno.env.get('MAIL_TO') ?? Deno.env.get('SMTP_USER')!,
      subject: `🩺 Đặt lịch mới — ${b.name} (${b.phone})`,
      html: html(b),
    })
    await client.close()
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
