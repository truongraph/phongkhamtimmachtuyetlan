import { Link, NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover } from '@/components/ui/popover'
import {
  LayoutDashboard, Blocks, Home, User, Stethoscope, ShieldCheck, HeartPulse,
  GraduationCap, MapPin, Settings, KeyRound, LogOut, ExternalLink, Menu, X, CalendarClock, Palette,
  BookOpen, Search, ChevronDown, UserRound, PanelLeft, DatabaseBackup, Check, Undo2, Wrench,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useContent } from '@/store/content'
import { useBookings } from '@/store/bookings'
import { normalizeVN } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  { to: '/admin/layout', icon: Blocks, label: 'Bố cục & Xem trước' },
  { to: '/admin/hero', icon: Home, label: 'Trang chủ' },
  { to: '/admin/about', icon: User, label: 'Giới thiệu bác sĩ' },
  { to: '/admin/services', icon: Stethoscope, label: 'Dịch vụ' },
  { to: '/admin/why', icon: ShieldCheck, label: 'Cam kết' },
  { to: '/admin/specialties', icon: HeartPulse, label: 'Chuyên môn' },
  { to: '/admin/journey', icon: GraduationCap, label: 'Đào tạo & Nghiên cứu' },
  { to: '/admin/contact', icon: MapPin, label: 'Liên hệ' },
  { section: 'Hệ thống' },
  { to: '/admin/settings', icon: Settings, label: 'Cài đặt chung' },
  { to: '/admin/themes', icon: Palette, label: 'Giao diện mẫu' },
  { to: '/admin/backup', icon: DatabaseBackup, label: 'Sao lưu & Email' },
] as const

type PageItem = { to: string; label: string; icon: typeof Home }
const PAGES: PageItem[] = NAV.filter((n) => 'to' in n).map((n) => ({ to: (n as any).to, label: (n as any).label, icon: (n as any).icon }))

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

/** Ô tìm nhanh trang quản trị (topbar trái). */
function FormSearch() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const nq = normalizeVN(q)
  const results = (nq ? PAGES.filter((p) => normalizeVN(p.label).includes(nq)) : PAGES).slice(0, 8)
  const go = (to: string) => { nav(to); setOpen(false); setQ('') }
  return (
    <Popover open={open} onOpenChange={setOpen} matchWidth
      trigger={
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={q}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQ(e.target.value); setOpen(true) }}
            onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) go(results[0].to) }}
            placeholder="Tìm trang quản trị…"
            className="h-9 pl-8 bg-secondary/60 border-transparent focus-visible:bg-background"
          />
        </div>
      }>
      <div className="max-h-72 overflow-y-auto p-1">
        {results.length === 0
          ? <div className="px-2 py-6 text-center text-sm text-muted-foreground">Không tìm thấy trang</div>
          : results.map((r) => (
            <button key={r.to} type="button" onClick={() => go(r.to)} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-left hover:bg-accent">
              <r.icon className="size-4 text-primary shrink-0" /> {r.label}
            </button>
          ))}
      </div>
    </Popover>
  )
}

export function AdminLayout() {
  const nav = useNavigate()
  const logout = useAuth((s) => s.logout)
  const username = useAuth((s) => s.username)
  const info = useContent((s) => s.content.info)
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
        {NAV.map((item, i) =>
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
          <div className="hidden sm:block w-56 md:w-72"><FormSearch /></div>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to="/" target="_blank"><ExternalLink className="size-4" /> Xem website</Link></Button>

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
                  className="flex items-center gap-2 rounded-full border pl-1 pr-2.5 py-1 hover:bg-secondary transition-colors"
                >
                  <span className="grid place-items-center size-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white"><UserRound className="size-[18px]" /></span>
                  <span className="hidden sm:block text-sm font-medium max-w-[160px] truncate">{username}</span>
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
          <span className="grid place-items-center size-9 rounded-full bg-amber-100 shrink-0"><span className="size-2.5 rounded-full bg-amber-500 animate-pulse" /></span>
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
