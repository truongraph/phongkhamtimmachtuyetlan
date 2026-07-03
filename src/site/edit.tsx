import { createElement, useEffect } from 'react'
import { useContent } from '@/store/content'
import { isEditMode, postToParent, TL_READY, TL_CONTENT, TL_SET, TL_FOCUS } from '@/lib/editMode'

/**
 * Bọc một đoạn chữ để có thể BẤM–SỬA TẠI CHỖ khi website chạy ở chế độ "Sửa trực quan".
 * - Ngoài chế độ sửa: render y như thẻ thường (không thêm gì).
 * - Trong chế độ sửa: bật contentEditable, viền sáng khi rê chuột, và GỬI giá trị mới
 *   lên trang quản trị khi rời ô (blur). Nguyên tắc "commit khi blur" giúp con trỏ không
 *   bị nhảy do React vẽ lại giữa chừng.
 */
export function Editable({ path, as = 'span', children, className, style, multiline }: {
  path: string
  as?: keyof JSX.IntrinsicElements
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  multiline?: boolean
}) {
  if (!isEditMode()) return createElement(as, { className, style }, children)

  const onFocus = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.dataset.tlOrig = e.currentTarget.innerText
    postToParent({ type: TL_FOCUS, path }) // báo sidebar nhảy tới đúng phần
  }
  const commit = (e: React.FocusEvent<HTMLElement>) => {
    const before = e.currentTarget.dataset.tlOrig
    delete e.currentTarget.dataset.tlOrig
    // Chỉ vào rồi ra mà KHÔNG sửa gì → không gửi, tránh báo "đã thay đổi" oan.
    if (before === undefined || e.currentTarget.innerText === before) return
    const value = e.currentTarget.innerText.replace(/ /g, ' ').trim()
    postToParent({ type: TL_SET, path, value })
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      const o = e.currentTarget.dataset.tlOrig
      if (o !== undefined) e.currentTarget.innerText = o // huỷ sửa: trả lại chữ ban đầu
      e.currentTarget.blur(); return
    }
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); e.currentTarget.blur() }
  }
  return createElement(as, {
    className: (className ? className + ' ' : '') + 'tl-editable',
    style,
    'data-edit': path,
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: false,
    onFocus,
    onKeyDown,
    onBlur: commit,
  }, children)
}

/**
 * Bọc một tấm ẢNH để đổi ảnh khi ở chế độ sửa: rê chuột thấy viền, bấm để chọn ảnh mới.
 * Ngoài chế độ sửa: render <img> y như thường (không đổi layout).
 */
export function EditableImage({ path, src, alt, className, style }: {
  path: string
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties
}) {
  if (!isEditMode()) return <img src={src} alt={alt} className={className} style={style} />
  const pick = () => {
    postToParent({ type: TL_FOCUS, path }) // báo sidebar nhảy tới đúng phần
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => postToParent({ type: TL_SET, path, value: String(reader.result) })
      reader.readAsDataURL(file)
    }
    input.click()
  }
  return <img src={src} alt={alt} className={className} style={{ ...style, cursor: 'pointer' }}
    data-editimg="" title="Bấm để đổi ảnh" onClick={pick} />
}

const EDIT_CSS = `
[data-edit]{ cursor:text; outline:1px dashed transparent; outline-offset:3px; border-radius:4px; transition:outline-color .12s, background-color .12s; }
[data-edit]:hover{ outline-color: color-mix(in srgb, var(--tl-primary,#2563eb) 55%, transparent); background: color-mix(in srgb, var(--tl-primary,#2563eb) 7%, transparent); }
[data-edit]:focus{ outline:2px solid var(--tl-primary,#2563eb); outline-offset:3px; background: color-mix(in srgb, var(--tl-primary,#2563eb) 9%, transparent); }
[data-editimg]{ transition:outline-color .12s; outline:2px solid transparent; outline-offset:2px; }
[data-editimg]:hover{ outline-color: var(--tl-primary,#2563eb); }
.tl-edit-pencil{ position:fixed; z-index:2147483647; display:none; place-items:center; width:28px; height:28px; padding:0; border-radius:999px; border:2px solid #fff; background:var(--tl-primary,#2563eb); color:#fff; box-shadow:0 3px 10px rgba(0,0,0,.28); cursor:pointer; }
.tl-edit-pencil:hover{ filter:brightness(1.08); transform:scale(1.06); }
.tl-edit-pencil svg{ width:15px; height:15px; }
`

/**
 * Cầu nối đặt trong website khi ở chế độ sửa:
 * - Nhận nội dung nháp từ trang quản trị (postMessage) → xem trước ngay (trong bộ nhớ).
 * - Preview VẪN thao tác được (điều hướng, mở popup, cuộn) — chỉ chặn GỬI form (đăng ký khám).
 * - Rê chuột vào mục sửa được → hiện nút BÚT CHÌ; bấm bút để bắt đầu sửa / đổi ảnh.
 * - Báo "đã sẵn sàng" để trang quản trị gửi nội dung lần đầu.
 */
const PENCIL_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'

export function EditBridge() {
  useEffect(() => {
    if (!isEditMode()) return
    const style = document.createElement('style')
    style.textContent = EDIT_CSS
    document.head.appendChild(style)

    // Chỉ chặn GỬI form (nút "Gửi đăng ký khám") và điều hướng khi bấm vào chính vùng đang sửa.
    // Mọi thao tác khác (mở popup đặt lịch, menu, cuộn…) vẫn hoạt động bình thường.
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const zone = t.closest('[data-edit],[data-editimg]')
      if (zone && t.closest('a')) e.preventDefault() // đừng nhảy link khi đang bấm để sửa
    }
    const onSubmit = (e: Event) => { e.preventDefault(); e.stopPropagation() }
    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)

    // Nút bút chì nổi khi rê chuột vào mục sửa được.
    const pencil = document.createElement('button')
    pencil.type = 'button'
    pencil.className = 'tl-edit-pencil'
    pencil.innerHTML = PENCIL_SVG
    pencil.setAttribute('aria-label', 'Sửa mục này')
    document.body.appendChild(pencil)
    let current: HTMLElement | null = null
    const place = (el: HTMLElement) => {
      current = el
      const r = el.getBoundingClientRect()
      pencil.style.left = Math.max(4, r.left - 13) + 'px'
      pencil.style.top = Math.max(4, r.top - 13) + 'px'
      pencil.style.display = 'grid'
    }
    const hide = () => { pencil.style.display = 'none'; current = null }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t === pencil || pencil.contains(t)) return
      const el = t.closest?.('[data-edit],[data-editimg]') as HTMLElement | null
      if (el) place(el); else hide()
    }
    const onPencil = (e: MouseEvent) => {
      e.preventDefault(); e.stopPropagation()
      if (!current) return
      if (current.hasAttribute('data-editimg')) { current.click(); return }
      current.focus()
      const sel = window.getSelection()
      if (sel) { const rg = document.createRange(); rg.selectNodeContents(current); rg.collapse(false); sel.removeAllRanges(); sel.addRange(rg) }
    }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('scroll', hide, true)
    pencil.addEventListener('click', onPencil)

    // Nhận nội dung nháp từ khung cha.
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as { type?: string; content?: any }
      if (d?.type === TL_CONTENT && d.content) useContent.getState().setPreview(d.content)
    }
    window.addEventListener('message', onMsg)

    postToParent({ type: TL_READY })
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('scroll', hide, true)
      window.removeEventListener('message', onMsg)
      pencil.remove()
      style.remove()
    }
  }, [])
  return null
}
