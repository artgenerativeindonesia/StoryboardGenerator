'use client'

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

/* ─── Icon Map ───────────────────────────────────────────────────────────── */

function ToastIcon({ variant }: { variant?: string }) {
  if (variant === 'destructive')
    return <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
  if (variant === 'success')
    return <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
  return <Info className="h-4 w-4 text-[#7C3AED] mt-0.5 shrink-0" />
}

/* ─── Toaster ────────────────────────────────────────────────────────────── */

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <Toast key={id} variant={variant as any} {...props}>
          <ToastIcon variant={variant} />
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
