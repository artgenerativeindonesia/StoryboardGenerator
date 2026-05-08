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
import { Textarea } from '@/components/ui/textarea'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validations/project'
import { cn } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: CreateProjectInput) => Promise<void>
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function CreateProjectDialog({
  open,
  onOpenChange,
  onConfirm,
}: CreateProjectDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', description: '' },
  })

  const onSubmit = async (data: CreateProjectInput) => {
    await onConfirm(data)
    reset()
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Create a new storyboard project. You can add files and generate sessions after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="create-name"
                className="text-sm font-medium text-white"
              >
                Name <span className="text-red-400">*</span>
              </label>
              <Input
                id="create-name"
                placeholder="My Storyboard Project"
                autoComplete="off"
                autoFocus
                {...register('name')}
                className={cn(errors.name && 'border-red-500/60 focus-visible:ring-red-500')}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="create-description"
                className="text-sm font-medium text-white"
              >
                Description{' '}
                <span className="text-[#6B7280] font-normal">(optional)</span>
              </label>
              <Textarea
                id="create-description"
                placeholder="Brief description of this project…"
                rows={3}
                {...register('description')}
                className={cn(
                  errors.description && 'border-red-500/60 focus-visible:ring-red-500',
                )}
              />
              {errors.description && (
                <p className="text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>
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
                  Creating…
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
