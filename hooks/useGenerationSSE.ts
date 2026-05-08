'use client'
import { useRef, useState, useCallback, useEffect } from 'react'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

interface SSEOptions {
  onProgress: (percent: number, message: string, stage: string) => void
  onComplete: (data: Record<string, unknown>) => void
  onError: (message: string) => void
}

interface UseGenerationSSEReturn {
  connect: (url: string, body: object, options: SSEOptions) => void
  disconnect: () => void
  isConnected: boolean
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * SSE hook that uses fetch + ReadableStream instead of EventSource so that
 * we can send a POST body (required for generation endpoints).
 *
 * Expected SSE frame format (WHATWG text/event-stream):
 *   data: {"type":"progress","percent":42,"message":"...","stage":"..."}\n\n
 *   data: {"type":"complete",...}\n\n
 *   data: {"type":"error","message":"..."}\n\n
 *   data: {"type":"heartbeat"}\n\n
 *
 * Multi-line data fields (multiple `data:` lines per frame) are concatenated
 * before JSON.parse, matching the SSE spec.
 */
export function useGenerationSSE(): UseGenerationSSEReturn {
  const [isConnected, setIsConnected] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  // Keep a ref to the latest options so the async loop always uses the
  // current callbacks without needing to be recreated.
  const optionsRef = useRef<SSEOptions | null>(null)

  const disconnect = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    optionsRef.current = null
    setIsConnected(false)
  }, [])

  const connect = useCallback(
    (url: string, body: object, options: SSEOptions) => {
      // Tear down any existing connection before opening a new one
      abortControllerRef.current?.abort()

      const controller = new AbortController()
      abortControllerRef.current = controller
      optionsRef.current = options

      setIsConnected(true)

      void (async () => {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'text/event-stream',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          })

          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`
            try {
              const errBody = await response.json()
              if (errBody?.error) errorMessage = String(errBody.error)
            } catch {
              // ignore JSON parse failure on error body
            }
            options.onError(errorMessage)
            setIsConnected(false)
            return
          }

          if (!response.body) {
            options.onError('Response body is null')
            setIsConnected(false)
            return
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              // Flush any remaining partial frame
              if (buffer.trim()) {
                dispatchFrame(buffer, options)
              }
              break
            }

            buffer += decoder.decode(value, { stream: true })

            // SSE frames are delimited by a blank line (\n\n)
            const frames = buffer.split('\n\n')
            // The last element may be an incomplete frame — keep it
            buffer = frames.pop() ?? ''

            for (const frame of frames) {
              if (frame.trim()) {
                dispatchFrame(frame, options)
              }
            }
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            // Intentional disconnect — no callback needed
            return
          }
          const message =
            err instanceof Error ? err.message : 'Unknown SSE error'
          optionsRef.current?.onError(message)
        } finally {
          setIsConnected(false)
        }
      })()
    },
    [] // stable — no external deps
  )

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
    }
  }, [])

  return { connect, disconnect, isConnected }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Parse a single SSE frame into a plain object.
 * Handles multi-line `data:` fields per the spec.
 */
function parseSSEFrame(frame: string): Record<string, unknown> | null {
  const lines = frame.split('\n')
  let dataAccumulator = ''

  for (const line of lines) {
    if (line.startsWith('data:')) {
      // Spec: a single space after the colon is stripped
      dataAccumulator += line.slice(line[5] === ' ' ? 6 : 5).trimEnd()
    }
    // Ignore event:, id:, retry: lines for now
  }

  if (!dataAccumulator) return null

  try {
    return JSON.parse(dataAccumulator) as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Route a parsed SSE frame to the correct option callback.
 */
function dispatchFrame(rawFrame: string, options: SSEOptions): void {
  const parsed = parseSSEFrame(rawFrame)
  if (!parsed) return

  const type = parsed.type as string | undefined

  switch (type) {
    case 'progress':
      options.onProgress(
        Number(parsed.percent ?? 0),
        String(parsed.message ?? ''),
        String(parsed.stage ?? '')
      )
      break
    case 'complete':
      options.onComplete(parsed)
      break
    case 'error':
      options.onError(String(parsed.message ?? 'Generation error'))
      break
    case 'heartbeat':
      // Keep-alive ping — no action required
      break
    default:
      // Unknown event type — silently ignore
      break
  }
}
