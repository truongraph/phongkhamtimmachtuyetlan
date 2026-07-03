import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Tùy chọn Sáng/Tối cho TRANG QUẢN TRỊ (không ảnh hưởng website công khai). */
interface ThemeState {
  dark: boolean
  toggle: () => void
  setDark: (v: boolean) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((s) => ({ dark: !s.dark })),
      setDark: (v) => set({ dark: v }),
    }),
    { name: 'tl_admin_theme' },
  ),
)
