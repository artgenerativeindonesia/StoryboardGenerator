'use client'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import type { UserSettings } from '@/types/database'
import type { UpdateSettingsRequest } from '@/types/api'

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const settingsKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsKeys.all, 'me'] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchSettings(): Promise<UserSettings> {
  const res = await fetch('/api/settings')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to fetch settings (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

async function saveSettings(
  input: UpdateSettingsRequest
): Promise<UserSettings> {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to save settings (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useSettings(): UseQueryResult<UserSettings> {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: fetchSettings,
  })
}

export function useUpdateSettings(): UseMutationResult<
  UserSettings,
  Error,
  UpdateSettingsRequest
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(settingsKeys.detail(), updated)
    },
  })
}
