'use client'
import { useQuery } from '@tanstack/react-query'
import type { OpenRouterModelPricing } from '@/types/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OpenRouterModel {
  id: string
  name: string
  context_length: number
  pricing: OpenRouterModelPricing
  description?: string
  architecture?: {
    modality: string
    tokenizer: string
  }
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const openRouterKeys = {
  all: ['openrouter'] as const,
  models: () => [...openRouterKeys.all, 'models'] as const,
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function fetchModels(): Promise<OpenRouterModel[]> {
  const res = await fetch('/api/openrouter/models')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      body?.error ?? `Failed to fetch OpenRouter models (${res.status})`
    )
  }
  const json = await res.json()
  // Route may return { data: [...] } or a raw array
  return Array.isArray(json) ? json : (json.data ?? [])
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseOpenRouterModelsReturn {
  models: OpenRouterModel[]
  isLoading: boolean
  error: Error | null
}

/**
 * Fetches the list of available OpenRouter models.
 * Only runs when `apiKey` is provided (truthy) to avoid hitting the API
 * before the user has entered their key.
 *
 * Results are cached for 5 minutes to avoid excessive network requests.
 */
export function useOpenRouterModels(
  apiKey?: string
): UseOpenRouterModelsReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: openRouterKeys.models(),
    queryFn: fetchModels,
    enabled: Boolean(apiKey),
    staleTime: 5 * 60 * 1_000, // 5 minutes
    retry: 2,
  })

  return {
    models: data ?? [],
    isLoading,
    error: error as Error | null,
  }
}
