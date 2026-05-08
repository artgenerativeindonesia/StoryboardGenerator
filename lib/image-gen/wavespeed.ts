const WAVESPEED_BASE = 'https://api.wavespeed.ai/api/v2'
const DEFAULT_MODEL = 'wavespeed/flux-dev'
const POLL_INTERVAL_MS = 2_000
const POLL_TIMEOUT_MS = 120_000

interface WavespeedSubmitResponse {
  /** Top-level request ID / job ID. */
  id?: string
  request_id?: string
  /** Status may be present immediately on submission. */
  status?: string
  /** Some providers return the output immediately. */
  outputs?: string[]
  data?: {
    id?: string
    status?: string
    outputs?: string[]
  }
  error?: string
}

interface WavespeedPollResponse {
  id?: string
  status?: 'pending' | 'processing' | 'completed' | 'succeeded' | 'failed' | string
  outputs?: string[]
  data?: {
    id?: string
    status?: string
    outputs?: string[]
  }
  error?: string
}

/**
 * Poll a wavespeed.ai job until it completes or the timeout expires.
 *
 * wavespeed uses a GET /api/v2/predictions/{id} endpoint for status polling.
 */
async function pollJob(
  jobId: string,
  apiKey: string
): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

    const res = await fetch(`${WAVESPEED_BASE}/predictions/${jobId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`wavespeed.ai poll error ${res.status}: ${body}`)
    }

    const data: WavespeedPollResponse = await res.json()

    // Unwrap nested data envelope if present
    const payload = data.data ?? data
    const status = payload.status ?? data.status

    if (status === 'failed') {
      throw new Error(
        `wavespeed.ai job ${jobId} failed: ${data.error ?? 'unknown error'}`
      )
    }

    if (status === 'completed' || status === 'succeeded') {
      const outputs = payload.outputs ?? data.outputs
      const url = Array.isArray(outputs) ? outputs[0] : undefined
      if (url) return url
      throw new Error(
        `wavespeed.ai job ${jobId} completed but no output URL returned`
      )
    }
  }

  throw new Error(
    `wavespeed.ai job ${jobId} timed out after ${POLL_TIMEOUT_MS / 1000}s`
  )
}

/**
 * Generate a 16:9 image via wavespeed.ai using the flux-dev model.
 *
 * wavespeed.ai is typically asynchronous: the initial POST returns a job ID
 * which is then polled until the image is ready.
 */
export async function generateImage(params: {
  prompt: string
  apiKey: string
  model?: string
}): Promise<{ imageUrl: string; jobId?: string }> {
  const { prompt, apiKey, model = DEFAULT_MODEL } = params

  // Build the endpoint from the model slug.
  // The canonical form is /api/v2/<provider>/<model-name>.
  const endpoint = model.includes('/')
    ? `${WAVESPEED_BASE}/${model}`
    : `${WAVESPEED_BASE}/${DEFAULT_MODEL}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        prompt,
        width: 1024,
        height: 576,
        num_inference_steps: 28,
        guidance_scale: 3.5,
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`wavespeed.ai API error ${response.status}: ${body}`)
  }

  const data: WavespeedSubmitResponse = await response.json()

  if (data.error) {
    throw new Error(`wavespeed.ai error: ${data.error}`)
  }

  // Unwrap nested data envelope
  const payload = data.data ?? data
  const jobId = payload.id ?? data.id ?? data.request_id

  // Check if result came back synchronously
  const immediateOutputs = payload.outputs ?? data.outputs
  if (Array.isArray(immediateOutputs) && immediateOutputs[0]) {
    return { imageUrl: immediateOutputs[0], jobId }
  }

  // Asynchronous path — poll for completion
  if (jobId) {
    const imageUrl = await pollJob(jobId, apiKey)
    return { imageUrl, jobId }
  }

  throw new Error(
    'wavespeed.ai returned an unexpected response shape (no job ID or immediate output)'
  )
}
