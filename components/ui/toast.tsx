'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Provider & Viewport ────────────────────────────────────────────────── */

const ToastProvider = ToastPrimitive.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[400px]',
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

/* ─── Toast Variants ─────────────────────────────────────────────────────── */

const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden',
    'rounded-xl border p-4 pr-8 shadow-lg',
    'transition-all duration-200',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
    'data-[state=open]:slide-in-from-bottom-full data-[state=open]:sm:slide-in-from-bottom-full',
  ],
  {
    variants: {
      variant: {
        default: 'bg-[#1A1A1A] border-[#2A2A2A] text-white',
        destructive: 'bg-[#1A1A1A] border-[#EF4444]/40 text-white',
        success: 'bg-[#1A1A1A] border-emerald-500/40 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

/* ─── Toast ──────────────────────────────────────────────────────────────── */

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
))
Toast.displayName = ToastPrimitive.Root.displayName

/* ─── ToastAction ────────────────────────────────────────────────────────── */

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#2A2A2A]',
      'bg-transparent px-3 text-xs font-medium text-white',
      'transition-colors duration-150 hover:bg-[#242424]',
      'focus:outline-none focus:ring-2 focus:ring-[#7C3AED]',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

/* ─── ToastClose ─────────────────────────────────────────────────────────── */

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1',
      'text-[#6B7280] hover:text-white hover:bg-[#2A2A2A]',
      'transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-[#7C3AED]',
      'opacity-0 group-hover:opacity-100',
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

/* ─── ToastTitle ─────────────────────────────────────────────────────────── */

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold text-white leading-tight', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

/* ─── ToastDescription ───────────────────────────────────────────────────── */

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[#6B7280] leading-snug', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

/* ─── Exports ────────────────────────────────────────────────────────────── */

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
export type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
