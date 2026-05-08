import * as React from 'react'
import { cn } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** When true, the textarea grows to fit its content automatically. */
  autoResize?: boolean
}

/* ─── Component ──────────────────────────────────────────────────────────── */

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, onChange, ...props }, ref) => {
    // Internal ref used for auto-resize logic
    const internalRef = React.useRef<HTMLTextAreaElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? internalRef

    const resize = React.useCallback(() => {
      const el = resolvedRef.current
      if (!el || !autoResize) return
      // Reset to auto first so shrinking works correctly
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [autoResize, resolvedRef])

    // Resize on mount
    React.useEffect(() => {
      resize()
    }, [resize])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      resize()
      onChange?.(e)
    }

    return (
      <textarea
        ref={resolvedRef}
        onChange={handleChange}
        className={cn(
          // Layout & shape
          'flex min-h-[80px] w-full rounded-lg px-3 py-2',
          // Dark surface
          'bg-[#1A1A1A] border border-[#2A2A2A]',
          // Text
          'text-sm text-white placeholder:text-[#4B5563]',
          // Resize
          autoResize ? 'resize-none overflow-hidden' : 'resize-y',
          // Focus ring
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-0 focus-visible:border-[#7C3AED]',
          // Disabled
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
