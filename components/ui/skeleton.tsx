import * as React from 'react'
import { cn } from '@/lib/utils'

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Skeleton loader placeholder.
 * Uses a shimmer gradient animation defined in globals.css / tailwind.config.ts.
 * Pass width/height via className to size the skeleton.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md',
        'bg-gradient-to-r from-[#1A1A1A] via-[#242424] to-[#1A1A1A]',
        'bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
