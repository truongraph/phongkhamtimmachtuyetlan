import { useState } from 'react'
import { useContent, type MenuItem, type SectionMeta, type PageDef } from '@/store/content'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PageHead, SortableList, DeleteBtn } from '../parts'
import { SECTION_NAV } from '@/site/SiteChrome'
import { Home, LayoutList, FileText, Link2, Newspaper, ChevronDown, Wand2, RotateCcw, ListTree } from 'lucide-react'
import { toast } from 'sonner'

const KIND_META = {
  home: { label: 'Trang chủ', icon: Home },
  section: { label: 'Phần trên trang', icon: LayoutList },
  page: { label: 'Trang phụ', icon: FileText },
  url: { label: 'Liên kết', icon: Link2 },
} as const

function buildAuto(sections: SectionMeta[], pages: PageDef[], newId: () => string): MenuItem[] {
  const items: MenuItem[] = [{ id: newId(), label: 'Trang chủ', kind: 'home' }]
  for (const s of sections) { const m = s.visible ? SECTION_NAV[s.type] : undefined; if (m) items.push({ id: newId(), label: m.label, kind: 'section', ref: m.id }) }
  for (const p of pages) items.push({ id: newId(), label: p.title, kind: 'page', ref: p.id })
  return items
}

/** Panel "Thêm mục menu" bên trái — mở/gập được (kiểu WP). */
function AddPanel({ title, icon: Icon, defaultOpen, children }: { title: string; icon: typeof Home; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="border rounded-md bg-card overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-muted/40">
        <Icon className="size-4 text-muted-foreground" /> <span className="flex-1 text-left">{title}</span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t p-3">{children}</div>}
    </div>
  )
}

/** Danh sách chọn (checkbox) + nút "Thêm vào menu". */
function CheckAdd({ items, empty, onAdd }: { items: { key: string; label: string }[]; empty: string; onAdd: (keys: string[]) => void }) {
  const [sel, setSel] = useState<Set<string>>(new Set())
  const toggle = (k: string) => setSel((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n })
  return (
    <>
      <div className="max-h-52 overflow-y-auto rounded border bg-background p-2 mb-2.5">
        {items.length === 0 ? <p className="text-[.8rem] text-muted-foreground py-1.5 px-1">{empty}</p>
          : items.map((it) => (
            <label key={it.key} className="flex items-center gap-2 text-sm cursor-pointer py-1 px-1 rounded hover:bg-muted/50">
              <Checkbox checked={sel.has(it.key)} onCheckedChange={() => toggle(it.key)} />
              <span className="truncate">{it.label}</span>
            </label>
          ))}
      </div>
      <Button size="sm" variant="outline" disabled={!sel.size} onClick={() => { onAdd([...sel]); setSel(new Set()) }}>Thêm vào menu</Button>
    </>
  )
}

/** Trang MENU riêng — bố cục 2 cột kiểu WordPress (Appearance → Menus). */
export function Menus() {
  const menu = useContent((s) => s.content.menu)
  const sections = useContent((s) => s.content.sections)
  const pages = useContent((s) => s.content.pages)
  const posts = useContent((s) => s.content.posts)
  const blog = useContent((s) => s.content.blog)
  const set = useContent((s) => s.set)
  const newId = useContent((s) => s.newId)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')

  const setMenu = (next: MenuItem[]) => set((c) => { c.menu = next })
  const patch = (id: string, p: Partial<MenuItem>) => set((c) => { const m = c.menu.find((x) => x.id === id); if (m) Object.assign(m, p) })
  const del = (id: string) => set((c) => { c.menu = c.menu.filter((x) => x.id !== id) })
  const pushMany = (items: MenuItem[]) => set((c) => { c.menu.push(...items) })

  const sectionOpts = sections.map((s) => SECTION_NAV[s.type]).filter(Boolean) as { id: string; label: string }[]
  const hint = (m: MenuItem) => {
    if (m.kind === 'home') return '/'
    if (m.kind === 'section') return `#${m.ref}`
    if (m.kind === 'page') { const p = pages.find((x) => x.id === m.ref); return p ? `/${p.slug}` : '(đã xóa)' }
    return m.ref || ''
  }
  const addLink = () => { if (!linkUrl.trim()) return; pushMany([{ id: newId(), label: linkLabel.trim() || linkUrl.trim(), kind: 'url', ref: linkUrl.trim() }]); setLinkUrl(''); setLinkLabel(''); toast.success('Đã thêm liên kết') }

  return (
    <div>
      <PageHead title="Menu điều hướng" desc="Chọn mục bên trái để thêm vào menu, kéo–thả bên phải để sắp thứ tự. Menu này dùng cho cả header và chân trang website." />

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* CỘT TRÁI: thêm mục menu */}
        <div className="space-y-3">
          <div className="text-sm font-bold">Thêm mục menu</div>
          <AddPanel title="Trang phụ" icon={FileText} defaultOpen>
            <CheckAdd items={pages.map((p) => ({ key: p.id, label: p.title }))} empty="Chưa có trang phụ nào."
              onAdd={(keys) => pushMany(keys.map((k) => { const p = pages.find((x) => x.id === k)!; return { id: newId(), label: p.title, kind: 'page' as const, ref: p.id } }))} />
          </AddPanel>
          <AddPanel title="Bài viết" icon={Newspaper}>
            <CheckAdd items={posts.map((p) => ({ key: p.id, label: p.title || '(chưa đặt tên)' }))} empty="Chưa có bài viết nào."
              onAdd={(keys) => pushMany(keys.map((k) => { const p = posts.find((x) => x.id === k)!; return { id: newId(), label: p.title, kind: 'url' as const, ref: `/${blog.slug}/${p.slug}` } }))} />
          </AddPanel>
          <AddPanel title="Phần trên trang chủ" icon={LayoutList}>
            <CheckAdd items={sectionOpts.map((o) => ({ key: o.id, label: o.label }))} empty="Không có phần nào."
              onAdd={(keys) => pushMany(keys.map((k) => { const o = sectionOpts.find((x) => x.id === k)!; return { id: newId(), label: o.label, kind: 'section' as const, ref: o.id } }))} />
            <div className="mt-2 pt-2 border-t"><Button size="sm" variant="ghost" className="text-primary" onClick={() => pushMany([{ id: newId(), label: 'Trang chủ', kind: 'home' }])}><Home className="size-4" /> Thêm “Trang chủ”</Button></div>
          </AddPanel>
          <AddPanel title="Liên kết tùy chỉnh" icon={Link2}>
            <div className="space-y-2">
              <div><label className="text-[.72rem] font-semibold text-muted-foreground mb-1 block">Đường dẫn</label><Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://… hoặc /duong-dan" className="h-9" /></div>
              <div><label className="text-[.72rem] font-semibold text-muted-foreground mb-1 block">Chữ hiển thị</label><Input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Vd: Fanpage" className="h-9" /></div>
              <Button size="sm" variant="outline" disabled={!linkUrl.trim()} onClick={addLink}>Thêm vào menu</Button>
            </div>
          </AddPanel>
        </div>

        {/* CỘT PHẢI: cấu trúc menu */}
        <div className="rounded-md border bg-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
            <ListTree className="size-[18px] text-primary" /><h3 className="font-semibold text-sm flex-1">Cấu trúc menu</h3>
            {menu.length > 0 && <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setMenu([]); toast.success('Đã về menu tự động') }} title="Xóa tùy chỉnh"><RotateCcw className="size-4" /> Menu tự động</Button>}
          </div>
          <div className="p-4">
            {menu.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground mb-1">Đang dùng <b className="text-foreground">menu tự động</b></p>
                <p className="text-[.8rem] text-muted-foreground mb-4">Trang chủ + các phần đang hiển thị + trang phụ. Bật tùy chỉnh để tự sắp xếp.</p>
                <Button onClick={() => { setMenu(buildAuto(sections, pages, newId)); toast.success('Đã bật menu tùy chỉnh') }}><Wand2 className="size-4" /> Tùy chỉnh menu</Button>
              </div>
            ) : (
              <SortableList items={menu} onChange={setMenu} className="space-y-2">
                {(m, _i, handle) => {
                  const K = KIND_META[m.kind]
                  return (
                    <div className="flex items-center gap-2.5 rounded-lg border bg-background p-2">
                      {handle}
                      <span className="grid place-items-center size-8 rounded-md bg-primary/10 text-primary shrink-0"><K.icon className="size-4" /></span>
                      <div className="flex-1 min-w-0">
                        <Input value={m.label} onChange={(e) => patch(m.id, { label: e.target.value })} className="h-9" />
                        {m.kind === 'url'
                          ? <Input value={m.ref || ''} onChange={(e) => patch(m.id, { ref: e.target.value })} placeholder="https://… hoặc /duong-dan" className="h-8 mt-1.5 text-[.8rem]" />
                          : <div className="text-[.68rem] text-muted-foreground mt-1 truncate">{K.label} · {hint(m)}</div>}
                      </div>
                      <DeleteBtn onClick={() => del(m.id)} title="Xóa mục menu?" desc="Mục sẽ bị gỡ khỏi thanh menu." />
                    </div>
                  )
                }}
              </SortableList>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
