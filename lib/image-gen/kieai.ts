const KIEAI_BASE = 'https://api.kie.ai/v1'
const DEFAULT_MODEL = 'flux-pro'

interface KieAIImageData {
  url?: string
  b64_json?: string
}

interface KieAIResponse {
  /** OpenAI-compatible images array. */
  data?: KieAIImageData[]
  /** Some endpoints wrap the result here. */
  result?: {
    url?: string
    images?: KieAIImageData[]
  }
  error?: {
    message?: string
    code?: string | number
  }
}

/**
 * Generate an image via the kie.ai API (OpenAI-compatible format).
 *
 * kie.ai exposes an OpenAI-compatible `/v1/images/generations` endpoint,
 * so the request and response shapes mirror the OpenAI Images API.
 */
export async function generateImage(params: {
  prompt: string
  apiKey: string
  model?: string
}): Promise<{ imageUrl: string; jobId?: string }> {
  const { prompt, apiKey, model = DEFAULT_MODEL } = params

  const response = await fetch(`${KIEAI_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      // 16:9 cinematic aspect ratio
      size: '1024x576',
      response_format: 'url',
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`kie.ai API error ${response.status}: ${body}`)
  }

  const data: KieAIResponse = await response.json()

  if (data.error) {
    throw new Error(
      `kie.ai API error: ${data.error.message ?? JSON.stringify(data.error)}`
    )
  }

  // Standard OpenAI shape
  const firstImage = data.data?.[0]
  if (firstImage?.url) {
    return { imageUrl: firstImage.url }
  }

  // Alternate wrapper shape some endpoints use
  const resultUrl =
    data.result?.url ?? data.result?.images?.[0]?.url
  if (resultUrl) {
    return { imageUrl: resultUrl }
  }

  throw new Error('kie.ai returned an unexpected response shape (no image URL found)')
}
