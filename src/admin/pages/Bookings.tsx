import { useEffect, useMemo, useState } from 'react'
import { useBookings, type Booking } from '@/store/bookings'
import { useContent } from '@/store/content'
import { isBackend, countMyMemberships } from '@/lib/backend'
import { formatDateVN, toISODate } from '@/components/ui/calendar'
import { normalizeVN } from '@/lib/format'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { PageHead } from '../parts'
import {
  Phone, Trash2, RefreshCw, CalendarX2, BellRing, Search, Handshake, CheckCheck,
  RotateCcw, FileSpreadsheet, FileText, ChevronLeft, ChevronRight, FilterX,
} from 'lucide-react'
import { toast } from 'sonner'

type Status = Booking['status']
const STATUS: Record<Status, { label: string; color: string; badge: string }> = {
  new: { label: 'Mới', color: '#f59e0b', badge: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Đã tiếp nhận', color: '#0070F4', badge: 'bg-primary/10 text-primary' },
  done: { label: 'Hoàn tất', color: '#0BB14E', badge: 'bg-success/12 text-success' },
}
const AVA = ['#E8F0FE', '#E7F8EF', '#FFF3E2', '#FDEAF1', '#F0EAFF', '#E3F7FA']
const AVAFG = ['#2563EB', '#0BB14E', '#EA580C', '#DB2777', '#7C3AED', '#0891B2']
const PER = 12

function fmt(ts: number) {
  return new Date(ts).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

/* ---------- Xuất báo cáo ---------- */
const COLS = ['STT', 'Họ tên', 'Số điện thoại', 'Dịch vụ', 'Ngày mong muốn', 'Buổi', 'Ghi chú', 'Trạng thái', 'Thời gian gửi']
const rowOf = (b: Booking, i: number): string[] => [
  String(i + 1), b.name, b.phone, b.service || 'Tư vấn chung',
  formatDateVN(b.date) || '', b.time, b.note || '', STATUS[b.status].label, fmt(b.createdAt),
]
const escHtml = (s: string) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as Record<string, string>)[c])
const today = () => new Date().toISOString().slice(0, 10)

async function exportExcel(rows: Booking[]) {
  const XLSX = await import('xlsx')
  const aoa = [COLS, ...rows.map((b, i) => rowOf(b, i))]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [5, 22, 16, 26, 16, 22, 34, 14, 20].map((wch) => ({ wch }))
  if (aoa.length > 1) ws['!autofilter'] = { ref: `A1:I${aoa.length}` }
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Đặt lịch')
  XLSX.writeFile(wb, `dat-lich-${today()}.xlsx`)
}

function exportPDF(rows: Booking[], clinic: { name: string; address: string }) {
  const w = window.open('', '_blank', 'width=1000,height=800')
  if (!w) { alert('Trình duyệt chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.'); return }
  const gen = new Date().toLocaleString('vi-VN')
  const rowsHtml = rows.map((b, i) => `<tr>${rowOf(b, i).map((c, ci) => `<td${ci === 7 ? ` style="color:${STATUS[b.status].color};font-weight:700"` : ''}>${escHtml(c)}</td>`).join('')}</tr>`).join('')
  w.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo đặt lịch</title>
<style>
  @page{size:A4;margin:14mm}
  *{font-family:'Segoe UI',Roboto,Arial,sans-serif;box-sizing:border-box}
  html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{margin:24px;color:#0f172a}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0070F4;padding-bottom:12px}
  h1{font-size:20px;margin:0}.muted{color:#64748b;font-size:13px}
  .title{font-weight:800;color:#0070F4;font-size:15px;letter-spacing:.04em}
  .sum{display:flex;gap:18px;margin:16px 0;font-size:13px;color:#334155}.sum b{font-size:17px;color:#0f172a}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th,td{border:1px solid #e2e8f0;padding:7px 9px;text-align:left;vertical-align:top}
  th{background:#f1f5f9;font-weight:700}
  tbody tr:nth-child(even){background:#f8fafc}
  thead{display:table-header-group}
  tr{break-inside:avoid}
  .foot{margin-top:14px;font-size:11px;color:#94a3b8;text-align:right}
  @media print{body{margin:0}}
</style></head><body>
  <div class="head">
    <div><h1>${escHtml(clinic.name)}</h1><div class="muted">${escHtml(clinic.address)}</div></div>
    <div style="text-align:right"><div class="title">BÁO CÁO ĐẶT LỊCH KHÁM</div><div class="muted">Xuất lúc ${escHtml(gen)}</div></div>
  </div>
  <table><thead><tr>${COLS.map((c) => `<th>${escHtml(c)}</th>`).join('')}</tr></thead><tbody>${rowsHtml || `<tr><td colspan="9" style="text-align:center;color:#94a3b8">Không có dữ liệu</td></tr>`}</tbody></table>
  <div class="foot">Báo cáo tạo tự động từ hệ thống quản trị website.</div>
  <script>window.onafterprint=function(){window.close()};window.onload=function(){window.focus();setTimeout(function(){window.print()},250)}</script>
</body></html>`)
  w.document.close()
}

export function Bookings() {
  const items = useBookings((s) => s.items)
  const setStatus = useBookings((s) => s.setStatus)
  const remove = useBookings((s) => s.remove)
  const loadRemote = useBookings((s) => s.loadRemote)
  const info = useContent((s) => s.content.info)
  const [needSetup, setNeedSetup] = useState(false)
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [q, setQ] = useState('')
  const [from, setFrom] = useState(() => toISODate(new Date()))
  const [to, setTo] = useState(() => toISODate(new Date()))
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!isBackend) return
    loadRemote()
    countMyMemberships().then((n) => setNeedSetup(n === 0))
  }, [])
  useEffect(() => { setPage(1) }, [filter, q, from, to])

  const nq = normalizeVN(q)
  const qDigits = q.replace(/\D/g, '')
  // Lọc theo ngày gửi + tìm kiếm (chưa lọc trạng thái) để tab đếm đúng theo phạm vi
  const base = useMemo(() => items.filter((b) => {
    const d = toISODate(new Date(b.createdAt))
    if (from && d < from) return false
    if (to && d > to) return false
    if (nq && !(normalizeVN(b.name).includes(nq) || (qDigits && b.phone.replace(/\s/g, '').includes(qDigits)))) return false
    return true
  }), [items, from, to, nq, qDigits])

  const counts = useMemo(() => ({
    all: base.length,
    new: base.filter((b) => b.status === 'new').length,
    accepted: base.filter((b) => b.status === 'accepted').length,
    done: base.filter((b) => b.status === 'done').length,
  }), [base])

  const filtered = filter === 'all' ? base : base.filter((b) => b.status === filter)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER))
  const curPage = Math.min(page, totalPages)
  const paged = filtered.slice((curPage - 1) * PER, curPage * PER)

  const tel = (p: string) => p.replace(/\s/g, '')
  const hasFilter = filter !== 'all' || !!q || !!from || !!to
  const clearFilter = () => { setFilter('all'); setQ(''); setFrom(''); setTo('') }
  const TABS: { key: 'all' | Status; label: string }[] = [
    { key: 'all', label: 'Tất cả' }, { key: 'new', label: 'Mới' },
    { key: 'accepted', label: 'Tiếp nhận' }, { key: 'done', label: 'Hoàn tất' },
  ]

  return (
    <div className="space-y-5">
      <PageHead title="Đặt lịch khám" desc="Tiếp nhận, lọc, xuất báo cáo yêu cầu đặt lịch từ website." />

      {needSetup && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 p-4 text-sm flex gap-3">
          <BellRing className="size-5 shrink-0 mt-0.5" />
          <div><b>Tài khoản này chưa gắn với phòng khám nào.</b> Thử <b>đăng xuất rồi đăng nhập lại</b>. Xem <a href="/huong-dan.html" target="_blank" rel="noreferrer" className="underline font-semibold">Hướng dẫn</a>.</div>
        </div>
      )}

      {/* Thanh lọc & thao tác */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((t) => {
              const on = filter === t.key
              return (
                <button key={t.key} onClick={() => setFilter(t.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${on ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-secondary border-input text-foreground'}`}>
                  {t.label}
                  <span className={`text-[.72rem] font-bold rounded-full px-1.5 min-w-5 text-center ${on ? 'bg-white/25' : 'bg-secondary'}`}>{counts[t.key]}</span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-end gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Từ ngày (gửi)</label>
              <div className="w-40"><DatePicker value={from} onChange={setFrom} placeholder="Từ ngày" /></div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Đến ngày (gửi)</label>
              <div className="w-40"><DatePicker value={to} onChange={setTo} placeholder="Đến ngày" /></div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên hoặc SĐT…" className="h-10 w-48 pl-8" />
              </div>
            </div>
            {hasFilter && <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearFilter}><FilterX className="size-4" /> Xoá lọc</Button>}

            <div className="ml-auto flex items-center gap-2">
              {isBackend && <Button variant="outline" size="sm" onClick={() => loadRemote()}><RefreshCw className="size-4" /> Tải lại</Button>}
              <Button variant="outline" size="sm" disabled={!filtered.length} onClick={() => exportExcel(filtered)}><FileSpreadsheet className="size-4" /> Excel</Button>
              <Button variant="outline" size="sm" disabled={!filtered.length} onClick={() => exportPDF(filtered, { name: info.clinicName, address: `${info.address} ${info.addressNote}`.trim() })}><FileText className="size-4" /> PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card><CardContent className="p-14 text-center">
          <span className="grid place-items-center size-14 rounded-2xl bg-secondary mx-auto mb-4"><CalendarX2 className="size-7 text-muted-foreground" /></span>
          <div className="font-semibold">Chưa có yêu cầu đặt lịch</div>
          <p className="text-sm text-muted-foreground mt-1">Khi khách gửi form trên website, yêu cầu sẽ hiển thị tại đây.</p>
        </CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Không có yêu cầu nào khớp bộ lọc.</CardContent></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/60 text-left text-[.72rem] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Khách hàng</th>
                  <th className="px-4 py-3 font-semibold">Điện thoại</th>
                  <th className="px-4 py-3 font-semibold">Dịch vụ</th>
                  <th className="px-4 py-3 font-semibold">Lịch hẹn</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paged.map((b, idx) => {
                  const gi = (curPage - 1) * PER + idx
                  const st = STATUS[b.status]
                  return (
                    <tr key={b.id} className="hover:bg-secondary/30 align-top">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid place-items-center size-9 rounded-full text-[.9rem] font-bold shrink-0" style={{ background: AVA[gi % AVA.length], color: AVAFG[gi % AVAFG.length] }}>{b.name.trim().charAt(0).toUpperCase() || '?'}</span>
                          <div className="min-w-0"><div className="font-medium truncate">{b.name}</div><div className="text-[.72rem] text-muted-foreground">Gửi {fmt(b.createdAt)}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><a href={`tel:${tel(b.phone)}`} className="inline-flex items-center gap-1.5 hover:text-primary"><Phone className="size-3.5" />{b.phone}</a></td>
                      <td className="px-4 py-3">
                        <div className="max-w-[220px]">{b.service || 'Tư vấn chung'}</div>
                        {b.note && <div className="text-[.78rem] italic text-muted-foreground/80 line-clamp-1 max-w-[220px]">“{b.note}”</div>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateVN(b.date) || '—'}<div className="text-[.78rem] text-muted-foreground">{b.time}</div></td>
                      <td className="px-4 py-3"><span className={`text-[.7rem] font-bold rounded-full px-2.5 py-1 whitespace-nowrap ${st.badge}`}>{st.label}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'new' && <Button size="sm" onClick={() => { setStatus(b.id, 'accepted'); toast.success('Đã tiếp nhận') }}><Handshake className="size-4" /> Tiếp nhận</Button>}
                          {b.status === 'accepted' && <Button size="sm" variant="success" onClick={() => { setStatus(b.id, 'done'); toast.success('Đã hoàn tất') }}><CheckCheck className="size-4" /> Hoàn tất</Button>}
                          {b.status === 'done' && <Button size="sm" variant="outline" onClick={() => setStatus(b.id, 'accepted')}><RotateCcw className="size-4" /> Mở lại</Button>}
                          <ConfirmDialog
                            title="Xoá yêu cầu đặt lịch?"
                            desc={`Xoá đơn của “${b.name}”. Hành động này không thể hoàn tác.`}
                            confirmText="Xoá" destructive
                            onConfirm={() => remove(b.id)}
                            trigger={<Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Xoá"><Trash2 className="size-4" /></Button>}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-2 p-3 border-t text-sm">
            <span className="text-muted-foreground">Hiển thị <b className="text-foreground">{paged.length}</b> / {filtered.length} yêu cầu</span>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="size-8" disabled={curPage <= 1} onClick={() => setPage(curPage - 1)}><ChevronLeft className="size-4" /></Button>
              <span className="text-muted-foreground">Trang <b className="text-foreground">{curPage}</b> / {totalPages}</span>
              <Button size="icon" variant="outline" className="size-8" disabled={curPage >= totalPages} onClick={() => setPage(curPage + 1)}><ChevronRight className="size-4" /></Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
