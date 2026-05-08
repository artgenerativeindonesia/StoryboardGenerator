import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* ─── Variants ───────────────────────────────────────────────────────────── */

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5',
    'text-xs font-medium',
    'border',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/30',
        outline:
          'bg-transparent text-white border-[#2A2A2A]',
        secondary:
          'bg-[#242424] text-[#6B7280] border-[#2A2A2A]',
        success:
          'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        warning:
          'bg-amber-500/15 text-amber-400 border-amber-500/30',
        error:
          'bg-red-500/15 text-red-400 border-red-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/* ─── Component ──────────────────────────────────────────────────────────── */

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
