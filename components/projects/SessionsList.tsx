'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import SessionCard from '@/components/sessions/SessionCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSessions, useCreateSession } from '@/hooks/useSession'

interface SessionsListProps {
  projectId: string
}

export default function SessionsList({ projectId }: SessionsListProps) {
  const router = useRouter()
  const { data: sessions, isLoading } = useSessions(projectId)
  const createSession = useCreateSession()
  const [isCreating, setIsCreating] = useState(false)

  const handleNewSession = async () => {
    setIsCreating(true)
    try {
      const session = await createSession.mutateAsync({
        project_id: projectId,
        name: `Session ${(sessions?.length ?? 0) + 1}`,
        selected_file_ids: [],
      })
      router.push(`/projects/${projectId}/session/${session.id}`)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={handleNewSession}
        disabled={isCreating}
        className="w-full gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
      >
        <Plus className="h-4 w-4" />
        {isCreating ? 'Creating…' : 'New Session'}
      </Button>

      {!sessions || sessions.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No sessions yet"
          description="Create a new session to start generating your storyboard."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
