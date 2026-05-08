'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Breadcrumbs, type BreadcrumbsProps } from '@/components/layout/Breadcrumbs'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface AppShellProps extends BreadcrumbsProps {
  children: React.ReactNode
  user?: User | null
  /** Hide breadcrumbs (e.g. on the projects list page). */
  hideBreadcrumbs?: boolean
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function AppShell({
  children,
  user,
  projectName,
  sessionName,
  hideBreadcrumbs = false,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Close mobile sidebar on route change (escape key)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0A0A0A]">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar user={user} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar (mobile hamburger + breadcrumbs) */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#1F1F1F] bg-[#0A0A0A]/90 px-4 backdrop-blur-sm">
          {/* Hamburger – mobile only */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className={cn(
              'lg:hidden flex h-8 w-8 items-center justify-center rounded-lg',
              'text-[#6B7280] hover:text-white hover:bg-[#1A1A1A]',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
            )}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Breadcrumbs */}
          {!hideBreadcrumbs && (
            <Breadcrumbs
              projectName={projectName}
              sessionName={sessionName}
            />
          )}
        </header>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
