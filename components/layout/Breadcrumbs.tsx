'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  /** Human-readable project name to show instead of the raw project ID. */
  projectName?: string
  /** Human-readable session name, if needed. */
  sessionName?: string
  /** Override breadcrumb items directly (takes priority over auto-detection) */
  items?: BreadcrumbItem[]
  className?: string
}

interface Crumb {
  label: string
  href?: string
}

/* ─── Path → Label Map ───────────────────────────────────────────────────── */

const STATIC_LABELS: Record<string, string> = {
  projects: 'Projects',
  settings: 'Settings',
  script: 'Script',
  shotlist: 'Shotlist',
  images: 'Images',
  session: 'Session',
  login: 'Login',
}

/* ─── Build Crumbs ───────────────────────────────────────────────────────── */

function buildCrumbs(
  pathname: string,
  projectName?: string,
  sessionName?: string,
): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: Crumb[] = []
  let accumulated = ''

  // Try to detect where project id / session id sit by position
  // Route shape: /projects/[id]/session/[sid]/[tab]
  const projectsIdx = segments.indexOf('projects')
  const sessionIdx = segments.indexOf('session')

  const projectId =
    projectsIdx !== -1 ? segments[projectsIdx + 1] ?? null : null
  const sessionId =
    sessionIdx !== -1 ? segments[sessionIdx + 1] ?? null : null

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    accumulated += `/${seg}`

    let label: string

    // Resolve known positional IDs
    if (seg === projectId && i === projectsIdx + 1) {
      label = projectName ?? 'Project'
    } else if (seg === sessionId && i === sessionIdx + 1) {
      label = sessionName ?? 'Session'
    } else {
      label = STATIC_LABELS[seg] ?? seg
    }

    const isLast = i === segments.length - 1

    crumbs.push({
      label,
      href: isLast ? undefined : accumulated,
    })
  }

  return crumbs
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function Breadcrumbs({ projectName, sessionName, items, className }: BreadcrumbsProps) {
  const pathname = usePathname()
  const crumbs: Crumb[] = items ?? buildCrumbs(pathname, projectName, sessionName)

  if (crumbs.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm', className)}
    >
      {/* Home anchor */}
      <Link
        href="/projects"
        className="text-[#6B7280] hover:text-white transition-colors duration-150 flex items-center"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {crumbs.map((crumb, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="h-3.5 w-3.5 text-[#3A3A3A] shrink-0" aria-hidden />
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="text-[#6B7280] hover:text-white transition-colors duration-150 truncate max-w-[160px]"
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className="text-white font-medium truncate max-w-[160px]"
              aria-current="page"
            >
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
