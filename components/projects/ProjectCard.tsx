'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  MoreHorizontal,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  FileText,
  Layers,
  Calendar,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import type { Project } from '@/types/database'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ProjectCardProps {
  project: Project
  fileCount?: number
  sessionCount?: number
  onClick?: (project: Project) => void
  onRename?: (project: Project) => void
  onArchive?: (project: Project) => void
  onDelete?: (project: Project) => void
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function ProjectCard({
  project,
  fileCount = 0,
  sessionCount = 0,
  onClick,
  onRename,
  onArchive,
  onDelete,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking the menu trigger
    if ((e.target as HTMLElement).closest('[data-menu-trigger]')) return
    onClick?.(project)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(project)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: menuOpen ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open project: ${project.name}`}
      className={cn(
        'group relative rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]',
        'p-5 cursor-pointer select-none outline-none',
        'hover:bg-[#1E1E1E] hover:border-[#363636]',
        'focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]',
        'transition-colors duration-150',
        project.is_archived && 'opacity-60',
      )}
    >
      {/* ── Three-dot menu ── */}
      <div
        data-menu-trigger
        className="absolute right-3 top-3"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md',
                'text-[#6B7280] hover:text-white hover:bg-[#2A2A2A]',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
                'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                menuOpen && 'opacity-100',
              )}
              aria-label="Project actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => onRename?.(project)}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onArchive?.(project)}
              className="cursor-pointer"
            >
              {project.is_archived ? (
                <>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(project)}
              className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Content ── */}
      <div className="pr-8">
        {/* Name + archived badge */}
        <div className="flex items-start gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-white leading-tight line-clamp-1 flex-1">
            {project.name}
          </h3>
          {project.is_archived && (
            <Badge variant="secondary" className="shrink-0 text-[10px] h-4 px-1.5">
              Archived
            </Badge>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            <FileText className="h-3 w-3" />
            <span>{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
          </div>
          <span className="text-[#3A3A3A]">·</span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            <Layers className="h-3 w-3" />
            <span>{sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
