// Định dạng số điện thoại kiểu Việt Nam: chỉ giữ chữ số, tối đa 11 số,
// tự chèn khoảng trắng theo nhóm (VD: "090 941 073", "097 986 7751").
export function formatVnPhone(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 11)
  const out: string[] = []
  let i = 0
  while (i < d.length) {
    const take = d.length - i > 4 ? 3 : d.length - i
    out.push(d.slice(i, i + take))
    i += take
  }
  return out.join(' ')
}

/** Chỉ lấy phần chữ số của số điện thoại (dùng để kiểm tra & gọi tel:). */
export const phoneDigits = (s: string) => s.replace(/\D/g, '')

/** Chuẩn hoá chuỗi tiếng Việt để tìm kiếm không dấu, không phân biệt hoa/thường. */
export function normalizeVN(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}
