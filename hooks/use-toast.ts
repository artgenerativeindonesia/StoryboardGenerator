'use client'

import * as React from 'react'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction =
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'UPDATE_TOAST'; toast: Partial<Toast> & { id: string } }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string }

/* ─── Constants ──────────────────────────────────────────────────────────── */

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 200

/* ─── ID Generator ───────────────────────────────────────────────────────── */

let count = 0
function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return `toast-${count}`
}

/* ─── Timeout Map ────────────────────────────────────────────────────────── */

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function addToRemoveQueue(toastId: string, dispatch: React.Dispatch<ToastAction>) {
  if (toastTimeouts.has(toastId)) return
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: 'REMOVE_TOAST', toastId })
  }, TOAST_REMOVE_DELAY)
  toastTimeouts.set(toastId, timeout)
}

/* ─── Reducer ────────────────────────────────────────────────────────────── */

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      }
    case 'DISMISS_TOAST': {
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? { ...t }
            : t,
        ),
      }
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) return { ...state, toasts: [] }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

/* ─── Global Store (module-level singleton) ──────────────────────────────── */

type Listener = (state: ToastState) => void
let memoryState: ToastState = { toasts: [] }
const listeners: Listener[] = []

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((l) => l(memoryState))
}

/* ─── Public API ─────────────────────────────────────────────────────────── */

export interface ToastOptions
  extends Omit<Toast, 'id'> {}

export function toast(opts: ToastOptions) {
  const id = genId()
  const duration = opts.duration ?? 4000

  dispatch({ type: 'ADD_TOAST', toast: { ...opts, id } })

  // Auto-dismiss after duration
  const timer = setTimeout(() => {
    dispatch({ type: 'DISMISS_TOAST', toastId: id })
    addToRemoveQueue(id, dispatch)
  }, duration)

  return {
    id,
    dismiss: () => {
      clearTimeout(timer)
      dispatch({ type: 'DISMISS_TOAST', toastId: id })
      addToRemoveQueue(id, dispatch)
    },
    update: (opts: ToastOptions) =>
      dispatch({ type: 'UPDATE_TOAST', toast: { ...opts, id } }),
  }
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId?: string) => {
      dispatch({ type: 'DISMISS_TOAST', toastId })
      if (toastId) addToRemoveQueue(toastId, dispatch)
    },
  }
}
