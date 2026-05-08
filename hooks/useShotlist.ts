'use client'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import type { ShotlistRow } from '@/types/database'
import type { UpdateShotlistRowRequest } from '@/types/api'

// ---------------------------------------------------------------------------
// Local input types
// ---------------------------------------------------------------------------

export interface ShotlistRowUpdate extends UpdateShotlistRowRequest {
  id: string
}

export interface BatchUpdateInput {
  sessionId: string
  rows: ShotlistRowUpdate[]
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const shotlistKeys = {
  all: ['shotlist'] as const,
  list: (sessionId: string) => [...shotlistKeys.all, sessionId] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchShotlist(sessionId: string): Promise<ShotlistRow[]> {
  const res = await fetch(`/api/sessions/${sessionId}/shotlist`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to fetch shotlist (${res.status})`)
  }
  const json = await res.json()
  return Array.isArray(json) ? json : (json.data ?? [])
}

async function batchUpdateRows(
  input: BatchUpdateInput
): Promise<ShotlistRow[]> {
  const { sessionId, rows } = input
  const res = await fetch(`/api/sessions/${sessionId}/shotlist`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      body?.error ?? `Failed to update shotlist rows (${res.status})`
    )
  }
  const json = await res.json()
  return Array.isArray(json) ? json : (json.data ?? [])
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useShotlist(
  sessionId: string
): UseQueryResult<ShotlistRow[]> {
  return useQuery({
    queryKey: shotlistKeys.list(sessionId),
    queryFn: () => fetchShotlist(sessionId),
    enabled: Boolean(sessionId),
  })
}

/**
 * Batch-update shotlist rows with optimistic UI: applies changes immediately
 * and rolls back on error.
 */
export function useUpdateShotlistRows(): UseMutationResult<
  ShotlistRow[],
  Error,
  BatchUpdateInput
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchUpdateRows,
    onMutate: async ({ sessionId, rows }) => {
      // Cancel any in-flight refetches to avoid overwriting our optimistic data
      await queryClient.cancelQueries({
        queryKey: shotlistKeys.list(sessionId),
      })

      const previous = queryClient.getQueryData<ShotlistRow[]>(
        shotlistKeys.list(sessionId)
      )

      if (previous) {
        const optimistic = previous.map((row) => {
          const patch = rows.find((r) => r.id === row.id)
          return patch ? { ...row, ...patch } : row
        })
        queryClient.setQueryData(shotlistKeys.list(sessionId), optimistic)
      }

      return { previous, sessionId }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined && context.sessionId) {
        queryClient.setQueryData(
          shotlistKeys.list(context.sessionId),
          context.previous
        )
      }
    },
    onSuccess: (updated, { sessionId }) => {
      // Replace optimistic data with the authoritative server response
      queryClient.setQueryData(shotlistKeys.list(sessionId), updated)
    },
  })
}
