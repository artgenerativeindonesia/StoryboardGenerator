'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn, formatBytes } from '@/lib/utils'

/* ─── Constants ──────────────────────────────────────────────────────────── */

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ACCEPTED_TYPES = ['application/pdf']

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface UploadingFile {
  id: string
  file: File
  progress: number
  error?: string
  done?: boolean
}

interface FileUploadZoneProps {
  projectId: string
  onUploadComplete?: (file: File) => void | Promise<void>
  disabled?: boolean
  className?: string
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function FileUploadZone({
  projectId: _projectId,
  onUploadComplete,
  disabled = false,
  className,
}: FileUploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = React.useState(false)
  const [dragError, setDragError] = React.useState<string | null>(null)
  const [uploads, setUploads] = React.useState<UploadingFile[]>([])

  /* ── Helpers ── */

  const updateUpload = (id: string, patch: Partial<UploadingFile>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    )
  }

  const processFile = async (file: File) => {
    const id = `${Date.now()}-${file.name}`

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploads((prev) => [
        ...prev,
        { id, file, progress: 0, error: 'Only PDF files are accepted.' },
      ])
      return
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setUploads((prev) => [
        ...prev,
        {
          id,
          file,
          progress: 0,
          error: `File exceeds the 50 MB limit (${formatBytes(file.size)}).`,
        },
      ])
      return
    }

    // Add to list with progress 0
    setUploads((prev) => [...prev, { id, file, progress: 0 }])

    try {
      // Simulate upload progress while calling the actual handler
      const progressInterval = setInterval(() => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === id && u.progress < 85
              ? { ...u, progress: Math.min(u.progress + 12, 85) }
              : u,
          ),
        )
      }, 200)

      await onUploadComplete?.(file)

      clearInterval(progressInterval)
      updateUpload(id, { progress: 100, done: true })

      // Remove from list after 2 s
      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.id !== id))
      }, 2000)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      updateUpload(id, { error: message, progress: 0 })
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(processFile)
  }

  /* ── Drag events ── */

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
    setDragError(null)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (!files.length) return

    const nonPdf = Array.from(files).some((f) => !ACCEPTED_TYPES.includes(f.type))
    if (nonPdf) {
      setDragError('Only PDF files are accepted.')
      return
    }

    handleFiles(files)
  }

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* ── Drop Zone ── */}
      <motion.div
        animate={{
          borderColor: isDragActive ? '#7C3AED' : '#2A2A2A',
          backgroundColor: isDragActive ? 'rgba(124,58,237,0.06)' : 'transparent',
        }}
        transition={{ duration: 0.15 }}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload PDF files"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3',
          'rounded-xl border-2 border-dashed border-[#2A2A2A] p-10',
          'cursor-pointer transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]',
          disabled && 'pointer-events-none opacity-40',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          onClick={(e) => ((e.target as HTMLInputElement).value = '')}
        />

        <motion.div
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            isDragActive
              ? 'bg-[#7C3AED]/20 text-[#7C3AED]'
              : 'bg-[#1E1E1E] text-[#6B7280]',
          )}
        >
          <UploadCloud className="h-6 w-6" />
        </motion.div>

        <div className="text-center">
          <p className="text-sm font-medium text-white">
            {isDragActive ? 'Drop files here' : 'Click or drag & drop'}
          </p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            PDF files only · Max 50 MB each
          </p>
        </div>
      </motion.div>

      {/* ── Drag Error ── */}
      <AnimatePresence>
        {dragError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="text-xs text-red-400">{dragError}</p>
            <button
              onClick={() => setDragError(null)}
              className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upload Progress Items ── */}
      <AnimatePresence initial={false}>
        {uploads.map((upload) => (
          <motion.div
            key={upload.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'flex items-start gap-3 rounded-lg border px-3 py-2.5',
                upload.error
                  ? 'border-red-500/30 bg-red-500/5'
                  : upload.done
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-[#2A2A2A] bg-[#1A1A1A]',
              )}
            >
              {/* Icon */}
              {upload.error ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              ) : upload.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-[#6B7280] mt-0.5" />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-white">
                    {upload.file.name}
                  </p>
                  <span className="shrink-0 text-[10px] text-[#6B7280]">
                    {formatBytes(upload.file.size)}
                  </span>
                </div>

                {upload.error ? (
                  <p className="text-xs text-red-400">{upload.error}</p>
                ) : !upload.done ? (
                  <Progress value={upload.progress} className="h-1" />
                ) : (
                  <p className="text-xs text-emerald-400">Upload complete</p>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeUpload(upload.id)}
                className="shrink-0 text-[#6B7280] hover:text-white transition-colors mt-0.5"
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
