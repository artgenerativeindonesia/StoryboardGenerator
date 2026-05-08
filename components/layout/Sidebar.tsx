'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Film, FolderOpen, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

/* ─── Nav Items ──────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface SidebarProps {
  user?: User | null
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = (user?.user_metadata?.full_name ?? user?.email ?? '') as string
  const email = user?.email ?? ''

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'fixed inset-y-0 left-0 z-30',
        'flex w-60 flex-col',
        'bg-[#111111] border-r border-[#1F1F1F]',
      )}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1F1F1F]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/30 shrink-0">
          <Film className="h-4 w-4 text-[#7C3AED]" />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight leading-tight">
          StoryboardGenerator
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/projects'
              ? pathname === '/projects' || pathname.startsWith('/projects/')
              : pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'bg-[#7C3AED]/15 text-white'
                  : 'text-[#6B7280] hover:bg-[#1A1A1A] hover:text-white',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-[#7C3AED]' : 'text-current',
                )}
              />
              {label}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-[#7C3AED]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── User Footer ── */}
      <div className="border-t border-[#1F1F1F] p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          {/* Avatar */}
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#242424] border border-[#2A2A2A]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#6B7280]">
                {displayName.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-white leading-tight">
              {displayName || email}
            </p>
            {displayName && (
              <p className="truncate text-[10px] text-[#6B7280] leading-tight mt-0.5">
                {email}
              </p>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
              'text-[#6B7280] hover:text-white hover:bg-[#2A2A2A]',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
            )}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
