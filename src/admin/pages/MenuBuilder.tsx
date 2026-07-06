import { useContent, type MenuItem, type SectionMeta, type PageDef } from '@/store/content'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SortableList, DeleteBtn } from '../parts'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { SECTION_NAV } from '@/site/SiteChrome'
import { Home, LayoutList, FileText, Link2, Plus, Menu as MenuIcon, Wand2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

const KIND_META = {
  home: { label: 'Trang chủ', icon: Home },
  section: { label: 'Phần trên trang', icon: LayoutList },
  page: { label: 'Trang phụ', icon: FileText },
  url: { label: 'Liên kết', icon: Link2 },
} as const

/** Menu tự động = trang chủ + các phần đang hiện + các trang phụ. */
function buildAuto(sections: SectionMeta[], pages: PageDef[], newId: () => string): MenuItem[] {
  const items: MenuItem[] = [{ id: newId(), label: 'Trang chủ', kind: 'home' }]
  for (const s of sections) {
    const m = s.visible ? SECTION_NAV[s.type] : undefined
    if (m) items.push({ id: newId(), label: m.label, kind: 'section', ref: m.id })
  }
  for (const p of pages) items.push({ id: newId(), label: p.title, kind: 'page', ref: p.id })
  return items
}

/** Trình dựng MENU điều hướng (kéo–thả sắp thứ tự, đổi nhãn, thêm/xóa mục). */
export function MenuBuilder() {
  const menu = useContent((s) => s.content.menu)
  const sections = useContent((s) => s.content.sections)
  const pages = useContent((s) => s.content.pages)
  const blog = useContent((s) => s.content.blog)
  const hasPosts = useContent((s) => s.content.posts.length > 0)
  const set = useContent((s) => s.set)
  const newId = useContent((s) => s.newId)

  const setMenu = (next: MenuItem[]) => set((c) => { c.menu = next })
  const patch = (id: string, p: Partial<MenuItem>) => set((c) => { const m = c.menu.find((x) => x.id === id); if (m) Object.assign(m, p) })
  const del = (id: string) => set((c) => { c.menu = c.menu.filter((x) => x.id !== id) })
  const push = (item: MenuItem) => set((c) => { c.menu.push(item) })

  const sectionOpts = sections.map((s) => SECTION_NAV[s.type]).filter(Boolean) as { id: string; label: string }[]

  const hint = (m: MenuItem) => {
    if (m.kind === 'home') return '/'
    if (m.kind === 'section') return `#${m.ref}`
    if (m.kind === 'page') { const p = pages.find((x) => x.id === m.ref); return p ? `/${p.slug}` : '(trang đã xóa)' }
    return m.ref || ''
  }

  // ------- Chưa tuỳ chỉnh: đang dùng menu tự động -------
  if (!menu.length) {
    return (
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-1.5"><MenuIcon className="size-[18px] text-primary" /><h3 className="font-semibold">Menu điều hướng</h3><span className="text-[.66rem] font-bold rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5">Tự động</span></div>
        <p className="text-sm text-muted-foreground mb-4">Menu đang <b>tự động</b>: Trang chủ + các phần đang hiển thị + các trang phụ. Muốn tự sắp thứ tự, đổi tên hay ẩn bớt mục thì bật tùy chỉnh.</p>
        <Button onClick={() => { setMenu(buildAuto(sections, pages, newId)); toast.success('Đã bật menu tùy chỉnh') }}><Wand2 className="size-4" /> Tùy chỉnh menu</Button>
      </div>
    )
  }

  // ------- Menu tuỳ chỉnh -------
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <MenuIcon className="size-[18px] text-primary" /><h3 className="font-semibold">Menu điều hướng</h3>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm"><Plus className="size-4" /> Thêm mục</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => push({ id: newId(), label: 'Trang chủ', kind: 'home' })}><Home className="size-4" /> Trang chủ</DropdownMenuItem>
              {sectionOpts.length > 0 && <DropdownMenuLabel>Phần trên trang</DropdownMenuLabel>}
              {sectionOpts.map((o) => <DropdownMenuItem key={o.id} onClick={() => push({ id: newId(), label: o.label, kind: 'section', ref: o.id })}><LayoutList className="size-4" /> {o.label}</DropdownMenuItem>)}
              {pages.length > 0 && <DropdownMenuLabel>Trang phụ</DropdownMenuLabel>}
              {pages.map((p) => <DropdownMenuItem key={p.id} onClick={() => push({ id: newId(), label: p.title, kind: 'page', ref: p.id })}><FileText className="size-4" /> {p.title}</DropdownMenuItem>)}
              {hasPosts && <><DropdownMenuSeparator /><DropdownMenuItem onClick={() => push({ id: newId(), label: blog.title, kind: 'url', ref: `/${blog.slug}` })}><FileText className="size-4" /> {blog.title} (trang tin)</DropdownMenuItem></>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => push({ id: newId(), label: 'Liên kết mới', kind: 'url', ref: 'https://' })}><Link2 className="size-4" /> Liên kết tùy chỉnh…</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => { setMenu([]); toast.success('Đã về menu tự động') }} title="Xóa tùy chỉnh, quay lại menu tự động"><RotateCcw className="size-4" /> Tự động</Button>
        </div>
      </div>

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
      <p className="text-[.72rem] text-muted-foreground mt-3">Kéo <b className="text-foreground">⠿</b> để đổi thứ tự. Đây là menu chung cho toàn website (header + chân trang).</p>
    </div>
  )
}
