import { useState, useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { useContent } from '@/store/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Lock, User, Eye, EyeOff, Loader2, ArrowRight, ExternalLink } from 'lucide-react'
import { isBackend } from '@/lib/backend'

export function Login() {
  const nav = useNavigate()
  const login = useAuth((s) => s.login)
  const loggedIn = useAuth((s) => s.loggedIn)
  const info = useContent((s) => s.content.info)
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRememberState] = useState(true)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  // Tự ẩn báo lỗi sau vài giây.
  useEffect(() => {
    if (!err) return
    const t = setTimeout(() => setErr(''), 5000)
    return () => clearTimeout(t)
  }, [err])

  if (loggedIn) return <Navigate to="/admin" replace />

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setLoading(true)
    const r = await login(u, p, remember)
    setLoading(false)
    if (r.ok) nav('/admin', { replace: true })
    else setErr(r.msg || 'Sai tài khoản hoặc mật khẩu.')
  }

  return (
    <div
      className="min-h-screen grid place-items-center px-4 py-10 bg-muted/30"
      style={{ backgroundImage: 'radial-gradient(58% 42% at 50% 0%, rgba(0,112,244,.06), transparent 70%)' }}
    >
      <div className="w-full max-w-[400px]">

        {/* Thẻ đăng nhập */}
        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight">Đăng nhập quản trị</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">Nhập tài khoản để quản lý nội dung website.</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u">{isBackend ? 'Email quản trị' : 'Tài khoản'}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="u" className="pl-9" value={u} onChange={(e) => setU(e.target.value)} placeholder={isBackend ? 'ban@phongkham.com' : 'admin'} autoFocus autoComplete="username" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="p" type={show ? 'text' : 'password'} className="pl-9 pr-9" value={p} onChange={(e) => setP(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  tabIndex={-1}
                  aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 select-none cursor-pointer text-sm">
              <Checkbox checked={remember} onCheckedChange={(v) => setRememberState(!!v)} />
              <span className="text-foreground/80">Ghi nhớ đăng nhập</span>
            </label>

            {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading
                ? <><Loader2 className="size-4 animate-spin" /> Đang đăng nhập…</>
                : <>Đăng nhập <ArrowRight className="size-4" /></>}
            </Button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ExternalLink className="size-3.5" /> Về trang website
          </Link>
        </div>
      </div>
    </div>
  )
}
