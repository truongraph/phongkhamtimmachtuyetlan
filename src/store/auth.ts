import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isBackend, supabase, ensureTenant } from '@/lib/backend'
import { useContent } from '@/store/content'
import { setRemember, localSession } from '@/lib/session'

/** Sau khi có phiên đăng nhập: tự cấu hình công ty + bật đồng bộ nội dung & đặt lịch. */
async function bootstrapTenant() {
  await ensureTenant(useContent.getState().content.info.clinicName)
  try {
    const [{ initContentSync }, { initBookingsRealtime }] = await Promise.all([
      import('@/lib/sync'),
      import('@/store/bookings'),
    ])
    initContentSync()
    initBookingsRealtime()
  } catch { /* bỏ qua */ }
}

// Local demo auth (dùng khi CHƯA cấu hình Supabase). Khi đã cấu hình Supabase,
// đăng nhập/đổi mật khẩu dùng Supabase Auth (xác thực phía máy chủ, an toàn).
function hash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i)
  return (h >>> 0).toString(16)
}

interface AuthResult { ok: boolean; msg: string }

interface AuthState {
  username: string
  passHash: string
  loggedIn: boolean
  ready: boolean
  initAuth: () => Promise<void>
  login: (u: string, p: string, remember?: boolean) => Promise<AuthResult>
  logout: () => Promise<void>
  changeCredentials: (u: string, currentPass: string, newPass: string) => Promise<AuthResult>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      username: 'admin',
      passHash: hash('admin123'),
      // Chế độ demo cục bộ: khôi phục trạng thái đăng nhập theo lựa chọn "Ghi nhớ" (localStorage/sessionStorage).
      loggedIn: !isBackend && localSession.isLogged(),
      ready: !isBackend, // local mode is ready immediately; backend waits for session check
      initAuth: async () => {
        if (!isBackend || !supabase) { set({ loggedIn: localSession.isLogged(), ready: true }); return }
        const { data } = await supabase.auth.getSession()
        if (data.session) await bootstrapTenant()
        set({ loggedIn: !!data.session, username: data.session?.user.email ?? 'admin', ready: true })
        supabase.auth.onAuthStateChange((_e, session) => {
          set({ loggedIn: !!session, username: session?.user.email ?? get().username })
          if (session) bootstrapTenant()
        })
      },
      login: async (u, p, remember = true) => {
        setRemember(remember) // ghi lựa chọn TRƯỚC khi lưu phiên để token vào đúng nơi (local/session)
        if (isBackend && supabase) {
          const { error } = await supabase.auth.signInWithPassword({ email: u.trim(), password: p })
          if (error) return { ok: false, msg: 'Email hoặc mật khẩu không đúng.' }
          set({ loggedIn: true, username: u.trim() })
          await bootstrapTenant()
          return { ok: true, msg: '' }
        }
        const s = get()
        if (u.trim() === s.username && hash(p) === s.passHash) {
          localSession.setLogged(true)
          set({ loggedIn: true })
          return { ok: true, msg: '' }
        }
        return { ok: false, msg: 'Sai tài khoản hoặc mật khẩu.' }
      },
      logout: async () => {
        if (isBackend && supabase) await supabase.auth.signOut()
        localSession.setLogged(false)
        set({ loggedIn: false })
      },
      changeCredentials: async (u, currentPass, newPass) => {
        if (newPass.length < 6) return { ok: false, msg: 'Mật khẩu mới cần tối thiểu 6 ký tự.' }
        if (isBackend && supabase) {
          const { error } = await supabase.auth.updateUser({ password: newPass })
          if (error) return { ok: false, msg: error.message }
          return { ok: true, msg: 'Đã đổi mật khẩu (Supabase).' }
        }
        const s = get()
        if (hash(currentPass) !== s.passHash) return { ok: false, msg: 'Mật khẩu hiện tại không đúng.' }
        set({ username: u.trim() || s.username, passHash: hash(newPass) })
        return { ok: true, msg: 'Đã cập nhật tài khoản.' }
      },
    }),
    // loggedIn KHÔNG lưu ở đây — trạng thái phiên do "Ghi nhớ đăng nhập" quản lý (local/sessionStorage).
    {
      name: 'tl_admin_auth', version: 3,
      partialize: (s) => ({ username: s.username, passHash: s.passHash }),
      // v2 → v3: bỏ loggedIn khỏi bản lưu cũ (tránh tự đăng nhập bỏ qua lựa chọn ghi nhớ), giữ tài khoản.
      migrate: (persisted: any) => ({ username: persisted?.username, passHash: persisted?.passHash }),
    }
  )
)
