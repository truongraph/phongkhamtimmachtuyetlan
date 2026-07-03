import { useState, useRef, useLayoutEffect, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

/**
 * Popover nhẹ, tự dựng (không cần thêm thư viện). Panel render qua portal ra
 * document.body + position:fixed nên không bị cắt bởi các khung overflow-hidden.
 */
export function Popover({
  open, onOpenChange, trigger, children, matchWidth = false, align = 'start', className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  children: ReactNode
  matchWidth?: boolean
  align?: 'start' | 'end'
  className?: string
}) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<{ top: number; left: number; right: number; width: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setRect({ top: r.bottom + 6, left: r.left, right: r.right, width: r.width })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      onOpenChange(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  return (
    <>
      <div ref={triggerRef}>{trigger}</div>
      {open && rect && createPortal(
        <div
          ref={panelRef}
          style={align === 'end'
            ? { position: 'fixed', top: rect.top, right: window.innerWidth - rect.right, minWidth: matchWidth ? rect.width : undefined, zIndex: 80 }
            : { position: 'fixed', top: rect.top, left: rect.left, minWidth: matchWidth ? rect.width : undefined, zIndex: 80 }}
          className={cn('rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95', className)}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  )
}
