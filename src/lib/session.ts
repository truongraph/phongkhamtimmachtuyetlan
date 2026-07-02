// Quản lý "Ghi nhớ đăng nhập" (Remember Me).
// - Có tích  → phiên lưu ở localStorage: đóng trình duyệt mở lại vẫn đăng nhập.
// - Bỏ tích  → phiên lưu ở sessionStorage: tải lại trang vẫn còn, nhưng ĐÓNG trình duyệt là đăng xuất.
// Dùng chung cho cả Supabase Auth (online) lẫn đăng nhập demo cục bộ.

const REMEMBER_KEY = 'tl_remember'

/** Mặc định GHI NHỚ, trừ khi người dùng bỏ tích (lưu cờ '0'). */
export function getRemember(): boolean {
  try { return localStorage.getItem(REMEMBER_KEY) !== '0' } catch { return true }
}

export function setRemember(v: boolean): void {
  try { localStorage.setItem(REMEMBER_KEY, v ? '1' : '0') } catch { /* bỏ qua */ }
}

/**
 * Kho lưu phiên theo lựa chọn "ghi nhớ":
 * - ghi vào localStorage (ghi nhớ) hoặc sessionStorage (không ghi nhớ), và dọn sạch nơi còn lại;
 * - đọc được ở CẢ hai nơi để không mất phiên khi vừa đổi lựa chọn.
 * Interface tương thích với Supabase auth `storage` và zustand persist `storage`.
 */
export const sessionStore = {
  getItem: (key: string): string | null => {
    try { return sessionStorage.getItem(key) ?? localStorage.getItem(key) } catch { return null }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (getRemember()) { localStorage.setItem(key, value); sessionStorage.removeItem(key) }
      else { sessionStorage.setItem(key, value); localStorage.removeItem(key) }
    } catch { /* bỏ qua */ }
  },
  removeItem: (key: string): void => {
    try { localStorage.removeItem(key); sessionStorage.removeItem(key) } catch { /* bỏ qua */ }
  },
}

/** Cờ đăng nhập demo cục bộ — cũng theo lựa chọn ghi nhớ. */
const LOCAL_FLAG = 'tl_admin_logged'
export const localSession = {
  isLogged: (): boolean => sessionStore.getItem(LOCAL_FLAG) === '1',
  setLogged: (v: boolean): void => { v ? sessionStore.setItem(LOCAL_FLAG, '1') : sessionStore.removeItem(LOCAL_FLAG) },
}
