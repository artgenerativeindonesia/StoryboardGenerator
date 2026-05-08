'use client'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import type { GenerationSession } from '@/types/database'
import type {
  CreateSessionRequest,
  UpdateSessionRequest,
} from '@/types/api'

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (projectId: string) => [...sessionKeys.lists(), projectId] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchSessions(projectId: string): Promise<GenerationSession[]> {
  const res = await fetch(`/api/projects/${projectId}/sessions`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to fetch sessions (${res.status})`)
  }
  const json = await res.json()
  return Array.isArray(json) ? json : (json.data ?? [])
}

async function fetchSession(sessionId: string): Promise<GenerationSession> {
  const res = await fetch(`/api/sessions/${sessionId}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to fetch session (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

async function createSession(
  input: CreateSessionRequest
): Promise<GenerationSession> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to create session (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

async function updateSession(
  id: string,
  input: UpdateSessionRequest
): Promise<GenerationSession> {
  const res = await fetch(`/api/sessions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to update session (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useSessions(
  projectId: string
): UseQueryResult<GenerationSession[]> {
  return useQuery({
    queryKey: sessionKeys.list(projectId),
    queryFn: () => fetchSessions(projectId),
    enabled: Boolean(projectId),
  })
}

export function useSession(
  sessionId: string
): UseQueryResult<GenerationSession> {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => fetchSession(sessionId),
    enabled: Boolean(sessionId),
  })
}

export function useCreateSession(): UseMutationResult<
  GenerationSession,
  Error,
  CreateSessionRequest
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSession,
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKeys.detail(session.id), session)
      queryClient.invalidateQueries({
        queryKey: sessionKeys.list(session.project_id),
      })
    },
  })
}

export function useUpdateSession(): UseMutationResult<
  GenerationSession,
  Error,
  { id: string } & UpdateSessionRequest
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }) => updateSession(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(sessionKeys.detail(updated.id), updated)
      queryClient.invalidateQueries({
        queryKey: sessionKeys.list(updated.project_id),
      })
    },
  })
}
