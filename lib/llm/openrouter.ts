const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterOptions {
  apiKey: string
  model: string
  messages: OpenRouterMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length?: number
  pricing?: {
    prompt: string
    completion: string
  }
}

/**
 * Non-streaming call to OpenRouter. Returns the full content string from the
 * first choice of the chat completion response.
 */
export async function callOpenRouter(options: OpenRouterOptions): Promise<string> {
  const { apiKey, model, messages, temperature = 0.7, maxTokens } = options

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://storyboardgenerator.app',
      'X-Title': 'StoryboardGenerator',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      ...(maxTokens !== undefined && { max_tokens: maxTokens }),
      stream: false,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `OpenRouter API error ${response.status}: ${errorBody}`
    )
  }

  const data = await response.json()
  const content: string = data?.choices?.[0]?.message?.content ?? ''
  return content
}

/**
 * Streaming call to OpenRouter. Returns a ReadableStream that yields raw text
 * chunks extracted from the SSE delta.content fields.
 */
export async function streamOpenRouter(
  options: OpenRouterOptions
): Promise<ReadableStream<string>> {
  const { apiKey, model, messages, temperature = 0.7, maxTokens } = options

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://storyboardgenerator.app',
      'X-Title': 'StoryboardGenerator',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      ...(maxTokens !== undefined && { max_tokens: maxTokens }),
      stream: true,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `OpenRouter API error ${response.status}: ${errorBody}`
    )
  }

  if (!response.body) {
    throw new Error('OpenRouter returned an empty response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream<string>({
    async pull(controller) {
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // Flush any remaining buffered data
          if (buffer.trim()) {
            processSSEBuffer(buffer, controller)
          }
          controller.close()
          return
        }

        buffer += decoder.decode(value, { stream: true })

        // SSE events are separated by double newlines
        const parts = buffer.split('\n\n')
        // The last part may be an incomplete event — keep it in the buffer
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          processSSEBuffer(part, controller)
        }
      }
    },
    cancel() {
      reader.cancel()
    },
  })
}

/**
 * Parse a single SSE event block and enqueue any delta text content.
 */
function processSSEBuffer(
  raw: string,
  controller: ReadableStreamDefaultController<string>
): void {
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) continue

    const jsonStr = trimmed.slice('data:'.length).trim()
    if (jsonStr === '[DONE]') return

    try {
      const parsed = JSON.parse(jsonStr)
      const delta: string | undefined =
        parsed?.choices?.[0]?.delta?.content
      if (delta) {
        controller.enqueue(delta)
      }
    } catch {
      // Malformed JSON in an SSE chunk — skip silently
    }
  }
}

/**
 * Fetch the list of models available through the authenticated OpenRouter account.
 */
export async function fetchOpenRouterModels(
  apiKey: string
): Promise<OpenRouterModel[]> {
  const response = await fetch(`${OPENROUTER_BASE}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://storyboardgenerator.app',
      'X-Title': 'StoryboardGenerator',
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `OpenRouter models fetch error ${response.status}: ${errorBody}`
    )
  }

  const data = await response.json()
  return (data?.data ?? []) as OpenRouterModel[]
}
