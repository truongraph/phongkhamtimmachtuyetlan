/**
 * Ghi giá trị vào một object lồng nhau theo "đường dẫn" dạng chuỗi.
 * Đoạn số ("0") = chỉ số mảng; đoạn chữ trong mảng = tra theo item.id.
 * Ví dụ: "hero.title", "hero.bullets.0", "services.<id>.title", "stats.<id>.value".
 * Đổi tại chỗ (mutate) — dùng trên bản đã structuredClone.
 */
export function setByPath(root: any, path: string, value: any): void {
  const parts = path.split('.')
  let cur = root
  for (let i = 0; i < parts.length - 1; i++) {
    cur = step(cur, parts[i])
    if (cur == null) return // đường dẫn không hợp lệ → bỏ qua an toàn
  }
  const last = parts[parts.length - 1]
  if (Array.isArray(cur)) {
    const idx = indexIn(cur, last)
    if (idx >= 0) cur[idx] = value
  } else if (cur && typeof cur === 'object') {
    cur[last] = value
  }
}

function step(cur: any, key: string): any {
  if (Array.isArray(cur)) {
    const idx = indexIn(cur, key)
    return idx >= 0 ? cur[idx] : undefined
  }
  return cur?.[key]
}

/** Vị trí trong mảng: theo chỉ số nếu là số, ngược lại theo item.id. */
function indexIn(arr: any[], key: string): number {
  if (/^\d+$/.test(key)) return Number(key)
  return arr.findIndex((x) => x && x.id === key)
}
