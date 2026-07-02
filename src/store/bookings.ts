import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isBackend, insertBooking, fetchBookings, updateBookingStatus, deleteBooking, subscribeBookings, resolveActiveCompany } from '@/lib/backend'

export interface Booking {
  id: string
  name: string
  phone: string
  service: string
  date: string
  time: string
  note?: string
  createdAt: number
  status: 'new' | 'accepted' | 'done'
}

interface BookingState {
  items: Booking[]
  loading: boolean
  add: (b: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Promise<boolean>
  loadRemote: () => Promise<void>
  setStatus: (id: string, status: Booking['status']) => Promise<void>
  remove: (id: string) => Promise<void>
  clearDone: () => Promise<void>
}

const localAdd = (items: Booking[], b: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking[] => [
  { ...b, id: Math.random().toString(36).slice(2, 9), createdAt: Date.now(), status: 'new' },
  ...items,
]

export const useBookings = create<BookingState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      add: async (b) => {
        if (isBackend) { const r = await insertBooking(b); return r.ok }
        set((s) => ({ items: localAdd(s.items, b) }))
        return true
      },
      loadRemote: async () => {
        if (!isBackend) return
        set({ loading: true })
        const rows = await fetchBookings()
        if (rows) set({ items: rows.map((r) => ({ id: r.id, name: r.name, phone: r.phone, service: r.service, date: r.date, time: r.time, note: r.note, status: r.status, createdAt: Date.parse(r.created_at) })) })
        set({ loading: false })
      },
      setStatus: async (id, status) => {
        if (isBackend) await updateBookingStatus(id, status)
        set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, status } : it)) }))
      },
      remove: async (id) => {
        if (isBackend) await deleteBooking(id)
        set((s) => ({ items: s.items.filter((it) => it.id !== id) }))
      },
      clearDone: async () => {
        const done = get().items.filter((i) => i.status === 'done')
        if (isBackend) await Promise.all(done.map((d) => deleteBooking(d.id)))
        set((s) => ({ items: s.items.filter((it) => it.status !== 'done') }))
      },
    }),
    { name: 'tl_bookings', version: 1 }
  )
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'tl_bookings') useBookings.persist.rehydrate()
  })
}

let bookingsRtStarted = false
/** Tải danh sách đặt lịch từ Supabase và cập nhật realtime khi có lịch mới. */
export async function initBookingsRealtime() {
  if (!isBackend || bookingsRtStarted) return
  const cid = await resolveActiveCompany()
  if (!cid) return
  bookingsRtStarted = true
  useBookings.getState().loadRemote()
  subscribeBookings(cid, () => useBookings.getState().loadRemote())
}

/** Email tuy chon qua Web3Forms (khong can backend) */
export async function sendBookingEmail(
  cfg: { web3formsKey: string; notifyEmail: string },
  b: { name: string; phone: string; service: string; date: string; time: string }
): Promise<boolean> {
  if (!cfg.web3formsKey) return false
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: cfg.web3formsKey,
        subject: `Dat lich kham moi — ${b.name}`,
        from_name: 'Website Tim mach Tuyet Lan',
        ...(cfg.notifyEmail ? { to: cfg.notifyEmail } : {}),
        'Ho ten': b.name, 'Dien thoai': b.phone, 'Dich vu': b.service,
        'Ngay': b.date || '(chua chon)', 'Buoi': b.time,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
