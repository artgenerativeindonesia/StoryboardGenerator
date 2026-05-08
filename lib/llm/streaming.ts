/**
 * Formats a plain object as a Server-Sent Events data line.
 *
 * @example
 * formatSSEEvent({ type: 'chunk', content: 'Hello' })
 * // => 'data: {"type":"chunk","content":"Hello"}\n\n'
 */
export function formatSSEEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

export interface SSEStream {
  /** The ReadableStream to pass as the Next.js route Response body. */
  stream: ReadableStream
  /** Enqueue a serialised SSE event onto the stream. */
  write: (event: object) => void
  /** Close the stream, signalling EOF to the client. */
  close: () => void
}

/**
 * Creates a simple SSE stream suitable for use as a Next.js App Router
 * `Response` body.
 *
 * @example
 * // In an API route:
 * const { stream, write, close } = createSSEStream()
 * write({ type: 'start' })
 * // ... push more events ...
 * close()
 * return new Response(stream, {
 *   headers: {
 *     'Content-Type': 'text/event-stream',
 *     'Cache-Control': 'no-cache',
 *     Connection: 'keep-alive',
 *   },
 * })
 */
export function createSSEStream(): SSEStream {
  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController<Uint8Array>

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c
    },
  })

  function write(event: object): void {
    const chunk = formatSSEEvent(event)
    controller.enqueue(encoder.encode(chunk))
  }

  function close(): void {
    controller.close()
  }

  return { stream, write, close }
}
