'use client'

import * as React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types/database'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onConfirm: (projectId: string) => Promise<void>
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onConfirm,
}: DeleteProjectDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const handleConfirm = async () => {
    if (!project) return
    setLoading(true)
    try {
      await onConfirm(project.id)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!loading) onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <DialogTitle className="text-white">Delete Project?</DialogTitle>
          </div>
          <DialogDescription className="text-[#6B7280]">
            <span className="block">
              You are about to permanently delete{' '}
              <span className="font-medium text-white">
                &quot;{project?.name ?? 'this project'}&quot;
              </span>
              .
            </span>
            <span className="mt-2 block text-xs text-red-400/80">
              This will permanently delete all files and sessions in this project. This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              'Delete Project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
