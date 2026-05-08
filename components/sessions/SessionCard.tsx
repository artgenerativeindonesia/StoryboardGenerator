'use client'

import { useRouter } from 'next/navigation'
import { MoreHorizontal, Trash2, Clock, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'
import type { GenerationSession, SessionStatus } from '@/types/database'

interface SessionCardProps {
  session: GenerationSession
  projectId: string
  onDelete?: (id: string) => void
}

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: {
    label: 'Draft',
    color: 'text-white/40 bg-white/5 border-white/10',
    icon: <Clock className="h-3 w-3" />,
  },
  generating_script: {
    label: 'Generating Script',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  script_ready: {
    label: 'Script Ready',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    icon: <FileText className="h-3 w-3" />,
  },
  generating_shotlist: {
    label: 'Generating Shotlist',
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  shotlist_ready: {
    label: 'Shotlist Ready',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  generating_images: {
    label: 'Generating Images',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  complete: {
    label: 'Complete',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  error: {
    label: 'Error',
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
    icon: <AlertCircle className="h-3 w-3" />,
  },
}

function getSessionPath(session: GenerationSession, projectId: string): string {
  const base = `/projects/${projectId}/session/${session.id}`
  switch (session.status) {
    case 'draft':
      return base
    case 'generating_script':
    case 'script_ready':
      return `${base}/script`
    case 'generating_shotlist':
    case 'shotlist_ready':
      return `${base}/shotlist`
    case 'generating_images':
    case 'complete':
    case 'error':
      return `${base}/images`
    default:
      return base
  }
}

export default function SessionCard({ session, projectId, onDelete }: SessionCardProps) {
  const router = useRouter()
  const statusConfig = STATUS_CONFIG[session.status]

  const handleClick = () => {
    router.push(getSessionPath(session, projectId))
  }

  return (
    <div
      onClick={handleClick}
      className="group flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 cursor-pointer hover:border-[#3A3A3A] hover:bg-[#242424] transition-all"
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm font-medium text-white truncate">{session.name}</span>
        <span className="text-xs text-white/40">{formatDate(session.created_at)}</span>
      </div>

      <div className="flex items-center gap-2 ml-4 shrink-0">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>

        {onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(session.id)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
