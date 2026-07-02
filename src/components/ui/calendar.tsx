import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(s?: string): Date | null {
  if (!s) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

/** Hiển thị ngày dạng dd/MM/yyyy (VN). Trả về '' nếu chưa chọn. */
export function formatDateVN(s?: string): string {
  const d = parseISODate(s)
  if (!d) return ''
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export function Calendar({ value, onSelect, disablePast = false }: {
  value?: string
  onSelect: (iso: string) => void
  disablePast?: boolean
}) {
  const sel = parseISODate(value)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [view, setView] = useState(() => {
    const base = sel ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // thứ 2 = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  return (
    <div className="p-3 w-[264px]">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => setView(new Date(year, month - 1, 1))} className="grid place-items-center size-7 rounded-md hover:bg-accent" aria-label="Tháng trước"><ChevronLeft className="size-4" /></button>
        <div className="text-sm font-semibold">Tháng {month + 1} · {year}</div>
        <button type="button" onClick={() => setView(new Date(year, month + 1, 1))} className="grid place-items-center size-7 rounded-md hover:bg-accent" aria-label="Tháng sau"><ChevronRight className="size-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEK.map((w) => <div key={w} className="text-center text-[.7rem] font-semibold text-muted-foreground py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((c, i) => {
          if (!c) return <div key={i} />
          const disabled = disablePast && c < today
          const isSel = !!sel && sameDay(c, sel)
          const isToday = sameDay(c, today)
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(toISODate(c))}
              className={cn(
                'h-8 rounded-md text-sm grid place-items-center transition-colors',
                disabled && 'text-muted-foreground/40 cursor-not-allowed',
                !disabled && !isSel && 'hover:bg-accent',
                isSel && 'bg-primary text-primary-foreground font-semibold',
                !isSel && isToday && 'ring-1 ring-primary/40 font-semibold',
              )}
            >
              {c.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
