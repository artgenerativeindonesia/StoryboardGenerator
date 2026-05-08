'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GeneratedImage } from '@/types/database'

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const imageKeys = {
  all: ['images'] as const,
  list: (sessionId: string) => [...imageKeys.all, sessionId] as const,
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function fetchImages(sessionId: string): Promise<GeneratedImage[]> {
  const res = await fetch(`/api/sessions/${sessionId}/images`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to fetch images (${res.status})`)
  }
  const json = await res.json()
  return Array.isArray(json) ? json : (json.data ?? [])
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseImagesReturn {
  images: GeneratedImage[]
  isLoading: boolean
  completedCount: number
  totalCount: number
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Loads generated images for a session and keeps them live via Supabase
 * Realtime postgres_changes subscriptions so new / updated rows appear
 * without a manual refetch.
 */
export function useImages(sessionId: string): UseImagesReturn {
  const queryClient = useQueryClient()

  const { data: images = [], isLoading } = useQuery({
    queryKey: imageKeys.list(sessionId),
    queryFn: () => fetchImages(sessionId),
    enabled: Boolean(sessionId),
  })

  // ── Realtime subscription ──────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`images:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'generated_images',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          queryClient.setQueryData<GeneratedImage[]>(
            imageKeys.list(sessionId),
            (prev = []) => {
              const { eventType, new: newRow, old: oldRow } = payload

              if (eventType === 'INSERT') {
                // Avoid duplicates
                const exists = prev.some((img) => img.id === (newRow as GeneratedImage).id)
                return exists ? prev : [...prev, newRow as GeneratedImage]
              }

              if (eventType === 'UPDATE') {
                return prev.map((img) =>
                  img.id === (newRow as GeneratedImage).id
                    ? (newRow as GeneratedImage)
                    : img
                )
              }

              if (eventType === 'DELETE') {
                return prev.filter(
                  (img) => img.id !== (oldRow as Partial<GeneratedImage>).id
                )
              }

              return prev
            }
          )
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [sessionId, queryClient])

  const completedCount = images.filter((img) => img.status === 'complete').length
  const totalCount = images.length

  return { images, isLoading, completedCount, totalCount }
}
