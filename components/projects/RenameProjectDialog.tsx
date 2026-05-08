'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validations/project'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/database'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface RenameProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onConfirm: (projectId: string, name: string) => Promise<void>
}

/* ─── Schema (name only) ─────────────────────────────────────────────────── */

const renameSchema = createProjectSchema.pick({ name: true })
type RenameInput = Pick<CreateProjectInput, 'name'>

/* ─── Component ──────────────────────────────────────────────────────────── */

export function RenameProjectDialog({
  open,
  onOpenChange,
  project,
  onConfirm,
}: RenameProjectDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RenameInput>({
    resolver: zodResolver(renameSchema),
    values: { name: project?.name ?? '' },
  })

  const onSubmit = async ({ name }: RenameInput) => {
    if (!project) return
    await onConfirm(project.id, name)
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      if (!open) reset()
      onOpenChange(open)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Enter a new name for &quot;{project?.name ?? 'this project'}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="rename-name" className="text-sm font-medium text-white">
              Name
            </label>
            <Input
              id="rename-name"
              autoFocus
              autoComplete="off"
              {...register('name')}
              className={cn(errors.name && 'border-red-500/60 focus-visible:ring-red-500')}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
