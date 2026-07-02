import { useMemo, useState, type ReactNode } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { normalizeVN } from '@/lib/format'
import { Popover } from './popover'

export interface ComboOption {
  value: string
  label: string
  icon?: ReactNode
  keywords?: string
}

/**
 * Combobox (dropdown có ô tìm kiếm) kiểu shadcn, dựng trên Popover tự có.
 * allowCustom=true cho phép giữ giá trị người dùng tự gõ (VD: tên phường/xã mới).
 */
export function Combobox({
  value, onChange, options, placeholder = 'Chọn…', searchPlaceholder = 'Tìm…',
  empty = 'Không có kết quả', allowCustom = false, className,
}: {
  value: string
  onChange: (value: string) => void
  options: ComboOption[]
  placeholder?: string
  searchPlaceholder?: string
  empty?: string
  allowCustom?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const selected = options.find((o) => o.value === value)
  const nq = normalizeVN(q)
  const filtered = useMemo(
    () => (!nq ? options : options.filter((o) => normalizeVN(`${o.label} ${o.keywords ?? ''}`).includes(nq))),
    [options, nq],
  )
  const showCustom = allowCustom && q.trim().length > 0 && !options.some((o) => normalizeVN(o.label) === nq)

  const choose = (v: string) => { onChange(v); setOpen(false); setQ('') }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) setQ('') }}
      matchWidth
      trigger={
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring',
            !selected && !(allowCustom && value) && 'text-muted-foreground',
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected?.icon}
            {selected ? selected.label : (allowCustom && value ? value : placeholder)}
          </span>
          <ChevronsUpDown className="size-4 opacity-50 shrink-0" />
        </button>
      }
    >
      <div className="flex items-center gap-2 border-b px-3">
        <Search className="size-4 opacity-50 shrink-0" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="max-h-60 overflow-y-auto p-1">
        {filtered.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => choose(o.value)}
            className={cn(
              'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground',
              o.value === value && 'bg-accent/60',
            )}
          >
            {o.icon}
            <span className="flex-1 truncate">{o.label}</span>
            {o.value === value && <Check className="size-4 text-primary shrink-0" />}
          </button>
        ))}
        {showCustom && (
          <button
            type="button"
            onClick={() => choose(q.trim())}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-left hover:bg-accent"
          >
            <Check className="size-4 opacity-0 shrink-0" />
            <span className="truncate">Dùng: <b>{q.trim()}</b></span>
          </button>
        )}
        {filtered.length === 0 && !showCustom && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">{empty}</div>
        )}
      </div>
    </Popover>
  )
}
