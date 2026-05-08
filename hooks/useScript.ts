'use client'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { useRef, useCallback } from 'react'
import type { Script } from '@/types/database'
import type { UpdateScriptRequest } from '@/types/api'

// ---------------------------------------------------------------------------
// Local input type
// ---------------------------------------------------------------------------

export interface UpdateScriptInput extends UpdateScriptRequest {
  sessionId: string
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const scriptKeys = {
  all: ['scripts'] as const,
  detail: (sessionId: string) => [...scriptKeys.all, sessionId] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchScript(sessionId: string): Promise<Script> {
  const res = await fetch(`/api/sessions/${sessionId}/script`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to fetch script (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

async function saveScript(input: UpdateScriptInput): Promise<Script> {
  const { sessionId, content } = input
  const res = await fetch(`/api/sessions/${sessionId}/script`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to save script (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useScript(sessionId: string): UseQueryResult<Script> {
  return useQuery({
    queryKey: scriptKeys.detail(sessionId),
    queryFn: () => fetchScript(sessionId),
    enabled: Boolean(sessionId),
  })
}

const DEBOUNCE_MS = 1_500

/**
 * Script save mutation with a built-in debounce so that rapid keystrokes
 * don't flood the API. Use `debouncedMutate` from an `onChange` handler.
 *
 * ```ts
 * const { debouncedMutate, isPending } = useUpdateScript()
 * debouncedMutate({ sessionId, content })
 * ```
 */
export function useUpdateScript(): UseMutationResult<
  Script,
  Error,
  UpdateScriptInput
> & {
  debouncedMutate: (input: UpdateScriptInput) => void
} {
  const queryClient = useQueryClient()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mutation = useMutation({
    mutationFn: saveScript,
    onSuccess: (updated) => {
      queryClient.setQueryData(scriptKeys.detail(updated.session_id), updated)
    },
  })

  const debouncedMutate = useCallback(
    (input: UpdateScriptInput) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        mutation.mutate(input)
      }, DEBOUNCE_MS)
    },
    [mutation]
  )

  return { ...mutation, debouncedMutate }
}
