import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover } from './popover'
import { Calendar, formatDateVN } from './calendar'

/** Chọn ngày kiểu shadcn: nút hiển thị ngày + lịch bật lên (Popover + Calendar). */
export function DatePicker({ value, onChange, placeholder = 'Chọn ngày', disablePast = false, className }: {
  value: string
  onChange: (iso: string) => void
  placeholder?: string
  disablePast?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarDays className="size-4 opacity-60 shrink-0" />
          <span className="flex-1 text-left">{value ? formatDateVN(value) : placeholder}</span>
        </button>
      }
    >
      <Calendar value={value} disablePast={disablePast} onSelect={(iso) => { onChange(iso); setOpen(false) }} />
    </Popover>
  )
}
