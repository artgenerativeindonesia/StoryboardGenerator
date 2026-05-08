'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from 'lucide-react'
import { FileItem } from '@/components/files/FileItem'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProjectFile } from '@/types/database'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface FileListProps {
  files: ProjectFile[]
  isLoading?: boolean
  onDelete?: (file: ProjectFile) => void
  className?: string
}

/* ─── Stagger Container ──────────────────────────────────────────────────── */

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function FileList({
  files,
  isLoading = false,
  onDelete,
  className,
}: FileListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No files yet"
        description="Upload PDF files to get started with storyboard generation."
      />
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      <AnimatePresence initial={false}>
        <div className="space-y-2">
          {files.map((file) => (
            <FileItem key={file.id} file={file} onDelete={onDelete} />
          ))}
        </div>
      </AnimatePresence>
    </motion.div>
  )
}
