'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { FileText, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatBytes, formatDate } from '@/lib/utils'
import type { ProjectFile } from '@/types/database'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface FileItemProps {
  file: ProjectFile
  onDelete?: (file: ProjectFile) => void
  className?: string
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function FileItem({ file, onDelete, className }: FileItemProps) {
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete?.(file)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      // Auto-cancel confirmation after 3 s
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'group flex items-center gap-3',
        'rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]',
        'px-3 py-2.5',
        'hover:bg-[#1E1E1E] hover:border-[#363636]',
        'transition-colors duration-150',
        className,
      )}
    >
      {/* File icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#242424] border border-[#2A2A2A]">
        <FileText className="h-4 w-4 text-[#6B7280]" />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white leading-tight">
          {file.name}
        </p>
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className="text-[11px] text-[#6B7280]">
            {formatBytes(file.size_bytes)}
          </span>
          <span className="text-[#3A3A3A]">·</span>
          <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <Calendar className="h-3 w-3" />
            {formatDate(file.created_at)}
          </span>
        </div>
      </div>

      {/* Delete button */}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteClick}
          className={cn(
            'h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
            'transition-all duration-150',
            confirmDelete
              ? 'opacity-100 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300'
              : 'text-[#6B7280] hover:text-red-400 hover:bg-red-500/10',
          )}
          title={confirmDelete ? 'Click again to confirm delete' : 'Delete file'}
          aria-label={confirmDelete ? 'Confirm delete' : 'Delete file'}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </motion.div>
  )
}
