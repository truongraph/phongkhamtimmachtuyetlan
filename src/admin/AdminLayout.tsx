import { Link, NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover } from '@/components/ui/popover'
import {
  LayoutDashboard, Blocks, Home, BarChart3, User, Stethoscope, ShieldCheck, HeartPulse,
  GraduationCap, MessageSquareQuote, HelpCircle, CircleDollarSign, Images,
  MapPin, Settings, KeyRound, LogOut, ExternalLink, Menu, X, CalendarClock, Palette,
  BookOpen, Search, ChevronDown, UserRound, PanelLeft, DatabaseBackup, Check, Undo2, Wrench, Bell, Sparkles, Sun, Moon,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useContent } from '@/store/content'
import { useBookings } from '@/store/bookings'
import { normalizeVN } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SEARCH_INDEX } from './searchIndex'
import { CHANGELOG } from '@/lib/changelog'
import { useTheme } from '@/store/theme'

/** Tooltip nhỏ hiện dưới nút khi rê chuột. */
function TipLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[60] whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[.72rem] font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
      {children}
    </span>
  )
}

/** Nút chuyển Sáng/Tối cho trang quản trị. */
function ThemeToggle() {
  const dark = useTheme((s) => s.dark)
  const toggle = useTheme((s) => s.toggle)
  return (
    <button type="button" onClick={toggle} aria-label={dark ? 'Chuyển chế độ sáng' : 'Chuyển chế độ tối'}
      className="group relative grid place-items-center size-9 rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
      <TipLabel>{dark ? 'Chế độ sáng' : 'Chế độ tối'}</TipLabel>
    </button>
  )
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const loggedIn = useAuth((s) => s.loggedIn)
  const ready = useAuth((s) => s.ready)
  const initAuth = useAuth((s) => s.initAuth)
  useEffect(() => { initAuth() }, [initAuth])
  if (!ready) return <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">Đang kiểm tra đăng nhập…</div>
  if (!loggedIn) return <Navigate to="/admin/login" replace />
  return children
}

const NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/admin/bookings', icon: CalendarClock, label: 'Đặt lịch', badge: true },
  { section: 'Nội dung' },
  { to: '/admin/customize', icon: Blocks, label: 'Tùy chỉnh giao diện' },
  { to: '/admin/hero', icon: Home, label: 'Trang chủ' },
  { to: '/admin/stats', icon: BarChart3, label: 'Dải số liệu' },
  { to: '/admin/about', icon: User, label: 'Giới thiệu bác sĩ' },
  { to: '/admin/services', icon: Stethoscope, label: 'Dịch vụ' },
  { to: '/admin/why', icon: ShieldCheck, label: 'Cam kết' },
  { to: '/admin/specialties', icon: HeartPulse, label: 'Chuyên môn' },
  { to: '/admin/journey', icon: GraduationCap, label: 'Đào tạo & Nghiên cứu' },
  { to: '/admin/testimonials', icon: MessageSquareQuote, label: 'Cảm nhận bệnh nhân' },
  { to: '/admin/faq', icon: HelpCircle, label: 'Câu hỏi thường gặp' },
  { to: '/admin/pricing', icon: CircleDollarSign, label: 'Bảng giá dịch vụ' },
  { to: '/admin/gallery', icon: Images, label: 'Thư viện ảnh' },
  { to: '/admin/contact', icon: MapPin, label: 'Liên hệ' },
  { section: 'Hệ thống' },
  { to: '/admin/settings', icon: Settings, label: 'Cài đặt chung' },
  { to: '/admin/themes', icon: Palette, label: 'Giao diện mẫu' },
  { to: '/admin/backup', icon: DatabaseBackup, label: 'Sao lưu & Email' },
] as const

// Mục nav tương ứng 1 phần bật/tắt được — nếu phần đó ĐANG TẮT thì ẩn mục khỏi menu.
const ROUTE_SECTION: Record<string, string> = {
  '/admin/stats': 'stats', '/admin/about': 'about', '/admin/services': 'services', '/admin/why': 'why',
  '/admin/specialties': 'specialties', '/admin/journey': 'journey', '/admin/testimonials': 'testimonials',
  '/admin/faq': 'faq', '/admin/pricing': 'pricing', '/admin/gallery': 'gallery', '/admin/contact': 'contact',
}

type PageItem = { to: string; label: string; icon: typeof Home }
const PAGES: PageItem[] = NAV.filter((n) => 'to' in n).map((n) => ({ to: (n as any).to, label: (n as any).label, icon: (n as any).icon }))
// Icon theo route (để kết quả tìm kiếm mục con vẫn có icon của trang chứa nó)
const ICON_BY_ROUTE: Record<string, typeof Home> = { '/admin/account': KeyRound }
PAGES.forEach((p) => { ICON_BY_ROUTE[p.to] = p.icon })

/** Khoảng thời gian tương đối gọn (vd: "5 phút trước"). */
function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return 'Vừa xong'
  const m = Math.floor(s / 60); if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60); if (h < 24) return `${h} giờ trước`
  const d = Math.floor(h / 24); if (d < 30) return `${d} ngày trước`
  return new Date(ts).toLocaleDateString('vi-VN')
}

/** Chuông thông báo: liệt kê các đặt lịch mới nhất, bấm để tới trang Đặt lịch. */
function NotifyBell() {
  const nav = useNavigate()
  const items = useBookings((s) => s.items)
  const [open, setOpen] = useState(false)
  const newCount = items.filter((i) => i.status === 'new').length
  const recent = [...items].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)
  const go = () => { setOpen(false); nav('/admin/bookings') }
  return (
    <Popover open={open} onOpenChange={setOpen} align="end" className="w-[21rem] p-0"
      trigger={
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Thông báo đặt lịch"
          className="group relative grid place-items-center size-9 rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="size-[18px]" />
          {newCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-destructive text-destructive-foreground text-[.6rem] font-bold ring-2 ring-background">{newCount > 9 ? '9+' : newCount}</span>}
          <TipLabel>Thông báo đặt lịch</TipLabel>
        </button>
      }>
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b">
        <div className="font-semibold text-sm">Đặt lịch mới nhất</div>
        {newCount > 0 && <span className="text-[.68rem] font-bold text-destructive bg-destructive/10 rounded-full px-2 py-0.5">{newCount} mới</span>}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {recent.length === 0
          ? <div className="px-3 py-10 text-center text-sm text-muted-foreground">Chưa có đặt lịch nào</div>
          : recent.map((b) => (
            <button key={b.id} type="button" onClick={go} className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left hover:bg-accent border-b last:border-0">
              <span className={cn('mt-0.5 grid place-items-center size-8 rounded-full shrink-0', b.status === 'new' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground')}><CalendarClock className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><b className="text-sm truncate">{b.name}</b>{b.status === 'new' && <span className="text-[.58rem] font-bold text-destructive tracking-wide shrink-0">MỚI</span>}</div>
                <div className="text-xs text-muted-foreground truncate">{b.service || 'Tư vấn chung'} · {b.phone}</div>
                <div className="text-[.68rem] text-muted-foreground mt-0.5">{timeAgo(b.createdAt)}</div>
              </div>
            </button>
          ))}
      </div>
      <button type="button" onClick={go} className="w-full text-center text-sm font-medium text-primary py-2.5 border-t hover:bg-accent">Xem tất cả đặt lịch</button>
    </Popover>
  )
}

/** Nhật ký cập nhật (dev log) — chấm đỏ nếu có bản mới chưa xem. */
function DevLog() {
  // Khoá theo ngày + tiêu đề để mục mới CÙNG NGÀY vẫn báo "có bản mới".
  const latest = CHANGELOG[0] ? `${CHANGELOG[0].date}·${CHANGELOG[0].title}` : ''
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('tl_devlog_seen') : null))
  const hasNew = !!latest && seen !== latest
  const onOpenChange = (o: boolean) => { setOpen(o); if (o && latest) { localStorage.setItem('tl_devlog_seen', latest); setSeen(latest) } }
  return (
    <Popover open={open} onOpenChange={onOpenChange} align="end" className="w-[22rem] p-0"
      trigger={
        <button type="button" onClick={() => onOpenChange(!open)} aria-label="Nhật ký cập nhật"
          className="group relative grid place-items-center size-9 rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Sparkles className="size-[18px]" />
          {hasNew && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background" />}
          <TipLabel>Nhật ký cập nhật</TipLabel>
        </button>
      }>
      <div className="px-3.5 py-2.5 border-b font-semibold text-sm flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Nhật ký cập nhật</div>
      <div className="max-h-[26rem] overflow-y-auto p-3.5 space-y-5">
        {CHANGELOG.map((c, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[.72rem] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">{c.date}</span>
              <span className="text-xs font-medium text-muted-foreground">{c.title}</span>
            </div>
            <ul className="space-y-1.5">
              {c.notes.map((n, j) => (
                <li key={j} className="text-[.82rem] text-foreground/80 flex gap-2 leading-relaxed">
                  <span className="mt-1.5 size-1.5 rounded-full bg-primary/60 shrink-0" />{n}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Popover>
  )
}

type NavItem = { to: string; icon: typeof Home; label: string; end?: boolean; badge?: boolean }

/** Mục sidebar; khi thu gọn, hover hiện tooltip đen bên phải (render qua portal, không bị cắt). */
function SideNavLink({ item, mini, count, onClick }: { item: NavItem; mini: boolean; count: number; onClick: () => void }) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const badge = !!item.badge
  return (
    <>
      <NavLink to={item.to} end={item.end} onClick={onClick}
        onMouseEnter={(e) => { if (mini) setRect(e.currentTarget.getBoundingClientRect()) }}
        onMouseLeave={() => setRect(null)}
        className={({ isActive }) => cn(
          'flex items-center rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
          mini ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5',
          isActive ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm' : 'text-foreground/75 hover:bg-primary/5 hover:text-primary',
        )}>
        <span className="relative shrink-0">
          <item.icon className="size-[18px]" />
          {mini && badge && count > 0 && <span className="absolute -top-1.5 -right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />}
        </span>
        {!mini && <>
          {item.label}
          {badge && count > 0 && <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[.68rem] font-bold">{count}</span>}
        </>}
      </NavLink>
      {mini && rect && createPortal(
        <div style={{ position: 'fixed', top: rect.top + rect.height / 2, left: rect.right + 5, transform: 'translateY(-50%)', zIndex: 70 }}
          className="pointer-events-none rounded-md bg-foreground text-background text-[.8rem] font-semibold px-2.5 py-1.5 shadow-lg whitespace-nowrap">
          {item.label}{badge && count > 0 ? ` · ${count}` : ''}
        </div>, document.body)}
    </>
  )
}

/** Bảng lệnh (command palette): bấm ô tìm hoặc Ctrl/⌘+K để mở modal ở giữa màn hình. */
type SearchResult = { label: string; page: string; to: string }
function FormSearch() {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true) }
      else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    if (!open) return
    setQ(''); setActive(0)
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  const nq = normalizeVN(q)
  const results: SearchResult[] = nq
    ? SEARCH_INDEX
        .filter((it) => normalizeVN(`${it.label} ${it.page} ${it.keywords || ''}`).includes(nq))
        .slice(0, 12)
        .map((it) => ({ label: it.label, page: it.page, to: it.to }))
    : PAGES.map((p) => ({ label: p.label, page: '', to: p.to }))

  const go = (to: string) => { nav(to); setOpen(false); setQ('') }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) go(results[active].to) }
  }

  return (
    <>
      {/* Ô tìm kiếm (input thật, chỉ đọc) — bấm/Enter để mở bảng lệnh */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          readOnly
          onClick={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } }}
          placeholder="Tìm trang hoặc mục…"
          className="w-full h-9 rounded-lg border bg-secondary/40 pl-9 pr-16 text-sm cursor-pointer hover:bg-secondary/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center rounded border bg-background px-1.5 h-5 text-[.65rem] font-medium text-muted-foreground pointer-events-none">Ctrl K</kbd>
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh] bg-black/50 backdrop-blur-sm animate-in fade-in duration-150" onMouseDown={() => setOpen(false)}>
          <div className="w-full max-w-xl rounded-xl border bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-150" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 px-4 border-b">
              <Search className="size-[18px] text-muted-foreground shrink-0" />
              <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setActive(0) }} onKeyDown={onKeyDown}
                placeholder="Chạy lệnh hoặc tìm kiếm…" className="flex-1 h-12 bg-transparent outline-none text-[.95rem] placeholder:text-muted-foreground" />
              <kbd className="hidden sm:flex items-center rounded border bg-muted px-1.5 h-5 text-[.65rem] font-medium text-muted-foreground">Esc</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <div className="px-2 py-1.5 text-[.66rem] font-bold uppercase tracking-wider text-muted-foreground">{nq ? 'Kết quả' : 'Trang quản trị'}</div>
              {results.length === 0
                ? <div className="px-3 py-10 text-center text-sm text-muted-foreground">Không tìm thấy mục nào cho “{q}”.</div>
                : results.map((r, i) => {
                  const Icon = ICON_BY_ROUTE[r.to] ?? Search
                  return (
                    <button key={`${r.to}-${i}`} type="button" onMouseMove={() => setActive(i)} onClick={() => go(r.to)}
                      className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors', active === i ? 'bg-accent' : 'hover:bg-accent/60')}>
                      <Icon className="size-[18px] text-primary shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm truncate">{r.label}</span>
                        {r.page && <span className="block text-[.7rem] text-muted-foreground truncate">trong {r.page}</span>}
                      </span>
                      {active === i && <span className="text-muted-foreground text-xs shrink-0">↵</span>}
                    </button>
                  )
                })}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

export function AdminLayout() {
  const nav = useNavigate()
  const logout = useAuth((s) => s.logout)
  const username = useAuth((s) => s.username)
  const info = useContent((s) => s.content.info)
  const sections = useContent((s) => s.content.sections)
  const visibleTypes = new Set(sections.filter((s) => s.visible).map((s) => s.type))
  const navVisible = (item: (typeof NAV)[number]) => !('to' in item) || !ROUTE_SECTION[item.to] || visibleTypes.has(ROUTE_SECTION[item.to] as any)
  const dirty = useContent((s) => s.dirty)
  const saveContent = useContent((s) => s.save)
  const discardContent = useContent((s) => s.discard)
  const newBookings = useBookings((s) => s.items.filter((i) => i.status === 'new').length)
  const [open, setOpen] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => (typeof localStorage !== 'undefined' && localStorage.getItem('tl_sidebar') === '1'))
  const toggleCollapse = () => setCollapsed((v) => { localStorage.setItem('tl_sidebar', v ? '0' : '1'); return !v })
  // Class dùng chung cho mục trong menu tài khoản — cùng kiểu item với Combobox.
  const acctItem = 'flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground'

  const Sidebar = ({ mini }: { mini: boolean }) => (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center gap-2.5 h-16 border-b', mini ? 'justify-center px-2' : 'px-5')}>
        <img src={info.logoUrl} className="size-9 rounded-lg border object-contain bg-white p-0.5 shrink-0" alt="" />
        {!mini && (
          <div className="leading-tight min-w-0">
            <div className="font-bold text-[.98rem] tracking-tight text-primary truncate">Quản trị website</div>
            <div className="text-[.66rem] uppercase tracking-wider text-muted-foreground font-semibold">Bảng quản trị</div>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
        {NAV.filter(navVisible).map((item, i) =>
          'section' in item
            ? (mini
              ? <div key={i} className="my-2 border-t mx-1" />
              : <div key={i} className="px-3 pt-4 pb-1 text-[.68rem] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{item.section}</div>)
            : <SideNavLink key={(item as any).to} item={item as NavItem} mini={mini} count={newBookings} onClick={() => setOpen(false)} />
        )}
      </nav>
      <div className="p-3 border-t hidden lg:block">
        <button onClick={toggleCollapse} className={cn('w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-secondary', mini && 'justify-center px-0')} title={mini ? 'Mở rộng' : 'Thu gọn'}>
          <PanelLeft className={cn('size-[18px] transition-transform', mini && 'rotate-180')} />{!mini && 'Thu gọn'}
        </button>
      </div>
    </div>
  )

  const sideW = collapsed ? 'lg:w-[74px]' : 'lg:w-[268px]'
  const mainPad = collapsed ? 'lg:pl-[74px]' : 'lg:pl-[268px]'

  return (
    <div className="min-h-screen bg-secondary/40">
      <Toaster position="top-right" richColors />
      {/* desktop sidebar */}
      <aside className={cn('hidden lg:flex fixed inset-y-0 left-0 bg-background border-r flex-col overflow-hidden transition-[width] duration-200', sideW)}>
        <Sidebar mini={collapsed} />
      </aside>
      {/* mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[268px] bg-background border-r">
            <div className="absolute right-2 top-3"><Button variant="ghost" size="icon" className="size-8" onClick={() => setOpen(false)}><X className="size-4" /></Button></div>
            <Sidebar mini={false} />
          </aside>
        </div>
      )}

      <div className={cn('transition-[padding] duration-200', mainPad)}>
        <header className="sticky top-0 z-30 h-16 bg-background/85 backdrop-blur border-b flex items-center gap-3 px-4 lg:px-6">
          <Button variant="outline" size="icon" className="lg:hidden shrink-0" onClick={() => setOpen(true)}><Menu className="size-5" /></Button>

          {/* Trái: tìm kiếm trang */}
          <div className="hidden sm:block w-64 md:w-96 lg:w-[30rem]"><FormSearch /></div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <NotifyBell />
            <DevLog />
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex rounded-lg"><Link to="/" target="_blank"><ExternalLink className="size-4" /> Xem website</Link></Button>

            {/* Phải: menu tài khoản — dựng trên cùng Popover với Combobox cho đồng bộ giao diện */}
            <Popover
              open={acctOpen}
              onOpenChange={setAcctOpen}
              align="end"
              className="w-60 p-1"
              trigger={
                <button
                  type="button"
                  onClick={() => setAcctOpen((o) => !o)}
                  aria-label="Tài khoản"
                  className="flex items-center gap-0.5 rounded-lg border p-0.5 pr-1 hover:bg-muted transition-colors"
                >
                  <span className="grid place-items-center size-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white"><UserRound className="size-[18px]" /></span>
                  <span className="hidden sm:block text-sm font-medium px-0.5">Tài khoản</span>
                  <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', acctOpen && 'rotate-180')} />
                </button>
              }
            >
              <div className="px-2 py-1.5">
                <div className="text-xs text-muted-foreground">Xin chào tài khoản:</div>
                <div className="font-semibold truncate text-sm">{username}</div>
              </div>
              <div className="my-1 -mx-1 h-px bg-border" />
              <Link to="/admin/account" onClick={() => setAcctOpen(false)} className={acctItem}><KeyRound className="size-4 text-muted-foreground" /> Tài khoản</Link>
              <a href="/huong-dan.html" target="_blank" rel="noreferrer" onClick={() => setAcctOpen(false)} className={acctItem}><BookOpen className="size-4 text-muted-foreground" /> Hướng dẫn sử dụng</a>
              <a href="/cau-hinh.html" target="_blank" rel="noreferrer" onClick={() => setAcctOpen(false)} className={acctItem}><Wrench className="size-4 text-muted-foreground" /> Cấu hình hệ thống</a>
              <a href="/" target="_blank" rel="noreferrer" onClick={() => setAcctOpen(false)} className={cn(acctItem, 'sm:hidden')}><ExternalLink className="size-4 text-muted-foreground" /> Xem website</a>
              <div className="my-1 -mx-1 h-px bg-border" />
              <button type="button" onClick={() => { setAcctOpen(false); logout(); nav('/admin/login') }} className={cn(acctItem, 'text-destructive hover:bg-destructive/10 hover:text-destructive')}><LogOut className="size-4" /> Đăng xuất</button>
            </Popover>
          </div>
        </header>
        <main className="p-4 mx-auto lg:p-8 max-w-7xl">
          <Outlet />
        </main>
      </div>

      {/* Thanh Lưu thay đổi: trượt lên từ dưới khi có chỉnh sửa chưa lưu */}
      <div className={cn('fixed bottom-0 right-0 left-0 z-40 transition-transform duration-300',
        collapsed ? 'lg:left-[74px]' : 'lg:left-[268px]',
        dirty ? 'translate-y-0' : 'translate-y-[140%] pointer-events-none')}>
        <div className="mx-4 lg:mx-auto mb-4 rounded-2xl border bg-background/95 backdrop-blur shadow-2xl px-4 py-3 flex items-center gap-3 max-w-3xl">
          <span className="grid place-items-center size-9 rounded-full bg-amber-100 dark:bg-amber-500/20 shrink-0"><span className="size-2.5 rounded-full bg-amber-500 animate-pulse" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Có thay đổi chưa lưu</div>
            <div className="text-xs text-muted-foreground hidden sm:block">Bấm “Lưu thay đổi” để cập nhật lên website.</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => discardContent()}><Undo2 className="size-4" /> Hoàn tác</Button>
          <Button size="sm" onClick={() => { saveContent(); toast.success('Đã lưu — website đã cập nhật') }}><Check className="size-4" /> Lưu thay đổi</Button>
        </div>
      </div>
    </div>
  )
}
