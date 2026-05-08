import * as React from 'react'
import { cn } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/* ─── Component ──────────────────────────────────────────────────────────── */

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          // Layout & shape
          'flex h-9 w-full rounded-lg px-3 py-1',
          // Dark surface
          'bg-[#1A1A1A] border border-[#2A2A2A]',
          // Text
          'text-sm text-white placeholder:text-[#4B5563]',
          // Focus ring
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-0 focus-visible:border-[#7C3AED]',
          // File input
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white',
          // Disabled
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
