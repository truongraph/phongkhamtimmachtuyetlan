/**
 * Chế độ "Sửa trực quan": website chạy trong iframe với ?edit=1 sẽ bật khả năng
 * bấm–sửa chữ tại chỗ và nhận nội dung nháp từ trang quản trị qua postMessage.
 * Tách riêng (không React) để mọi nơi import được mà không lo vòng lặp phụ thuộc.
 */
export function isEditMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('edit') === '1'
}

/** Đang chạy bên trong một iframe (khung cha khác). */
export const IN_IFRAME = typeof window !== 'undefined' && window.self !== window.top

/* Giao thức postMessage giữa trang quản trị (cha) và website (iframe). */
export const TL_READY = 'tl-edit:ready' as const   // iframe → cha: đã sẵn sàng, xin nội dung
export const TL_CONTENT = 'tl-edit:content' as const // cha → iframe: đây là nội dung nháp hiện tại
export const TL_SET = 'tl-edit:set' as const       // iframe → cha: người dùng vừa sửa 1 trường
export const TL_FOCUS = 'tl-edit:focus' as const   // iframe → cha: đang sửa trường nào (để sidebar nhảy tới)
export const TL_SELECT = 'tl-edit:select' as const // iframe → cha: người dùng chọn 1 khối (dùng sau này)
export const TL_PICKIMG = 'tl-edit:pickimg' as const // iframe → cha: mở Thư viện Media để đổi ảnh tại path

/** Gửi tin lên khung cha (nếu đang trong iframe cùng origin). */
export function postToParent(msg: unknown) {
  if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
    window.parent.postMessage(msg, window.location.origin)
  }
}
