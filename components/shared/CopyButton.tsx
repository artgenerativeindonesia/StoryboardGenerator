'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface CopyButtonProps {
  text: string
  className?: string
  /** Label shown next to the icon. If omitted, icon-only button. */
  label?: string
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function CopyButton({ text, className, label }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    if (copied) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  }

  return (
    <Button
      variant="ghost"
      size={label ? 'sm' : 'icon'}
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      className={cn(
        'relative gap-1.5',
        copied && 'text-emerald-400 hover:text-emerald-400',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            {label && <span>Copied!</span>}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            {label && <span>{label}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}
