import { useContent, DEFAULT_CONTENT, type SiteContent } from '@/store/content'
import { isBackend, fetchContent, pushContent, subscribeContent, resolveActiveCompany } from '@/lib/backend'

function mergeDefault(remote: Partial<SiteContent>): SiteContent {
  return {
    ...DEFAULT_CONTENT, ...remote,
    theme: { ...DEFAULT_CONTENT.theme, ...(remote.theme ?? {}) },
    seo: { ...DEFAULT_CONTENT.seo, ...(remote.seo ?? {}) },
    info: { ...DEFAULT_CONTENT.info, ...(remote.info ?? {}) },
    booking: { ...DEFAULT_CONTENT.booking, ...(remote.booking ?? {}) },
  }
}

let started = false
let applyingRemote = false
let prevPub: SiteContent | null = null

const epoch = (ts: string) => (ts ? new Date(ts).getTime() : 0)

export async function initContentSync() {
  if (!isBackend || started) return
  const cid = await resolveActiveCompany()
  if (!cid) return // chưa xác định được công ty (chưa đăng nhập & chưa cấu hình VITE_SITE_SLUG)
  started = true

  // Áp dữ liệu từ server — nhưng CHỈ khi nó MỚI HƠN bản đã lưu cục bộ (theo updated_at).
  // Nhờ vậy: echo bản ghi của chính mình, hay cú fetch đầu chậm trả về bản cũ,
  // sẽ KHÔNG ghi đè thay đổi vừa lưu ("quay về như cũ"). Bản nháp đang gõ dở luôn được giữ.
  const apply = (remote: Partial<SiteContent>, ts: string) => {
    if (epoch(ts) && epoch(ts) <= epoch(useContent.getState().pubTs)) return // server cũ hơn/bằng → bỏ qua
    applyingRemote = true
    try { useContent.getState().applyRemote(mergeDefault(remote), ts) } finally { applyingRemote = false }
    prevPub = useContent.getState().published
  }

  prevPub = useContent.getState().published
  const remote = await fetchContent()
  if (remote) {
    apply(remote.data, remote.updatedAt)
    // Bản cục bộ MỚI HƠN server (vd lần đẩy trước bị lỗi) → đẩy lại lên để không mất.
    const st = useContent.getState()
    if (st.pubTs && epoch(st.pubTs) > epoch(remote.updatedAt)) pushContent(st.published, st.pubTs)
  } else {
    const st = useContent.getState()
    pushContent(st.published, st.pubTs || undefined) // seed lần đầu
  }

  let t: ReturnType<typeof setTimeout>
  // Chỉ đẩy lên server khi bản ĐÃ LƯU (published) thay đổi — không đẩy khi đang gõ nháp.
  useContent.subscribe((state) => {
    if (state.published === prevPub) return
    prevPub = state.published
    if (applyingRemote) return
    clearTimeout(t); t = setTimeout(() => pushContent(state.published, useContent.getState().pubTs), 700)
  })

  subscribeContent(cid, (data, ts) => apply(data, ts))
}
