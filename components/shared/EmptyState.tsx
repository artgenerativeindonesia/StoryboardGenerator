import * as React from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 px-4 text-center',
        className,
      )}
    >
      {/* Icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A]">
        <Icon className="h-6 w-6 text-[#6B7280]" />
      </div>

      {/* Text */}
      <div className="space-y-1 max-w-xs">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-[#6B7280] leading-relaxed">{description}</p>
        )}
      </div>

      {/* Action */}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-1"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
