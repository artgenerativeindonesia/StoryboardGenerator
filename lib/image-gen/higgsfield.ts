const HIGGSFIELD_BASE = 'https://api.higgsfield.ai/v1'
const DEFAULT_MODEL = 'cinematic-v1'
const POLL_INTERVAL_MS = 2_000
const POLL_TIMEOUT_MS = 120_000

interface HiggsfieldGenerationResult {
  imageUrl: string
  jobId?: string
}

interface HiggsfieldResponse {
  /** Returned immediately when the image is ready (synchronous path). */
  url?: string
  image_url?: string
  /** Returned when the generation is asynchronous — poll with this ID. */
  id?: string
  job_id?: string
  status?: 'pending' | 'processing' | 'completed' | 'failed' | string
  /** Output array used by some Higgsfield response shapes. */
  outputs?: Array<{ url: string }>
  error?: string
}

/**
 * Poll a Higgsfield job until it completes or the timeout is reached.
 */
async function pollJob(
  jobId: string,
  apiKey: string
): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

    const res = await fetch(`${HIGGSFIELD_BASE}/generations/${jobId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Higgsfield poll error ${res.status}: ${body}`)
    }

    const data: HiggsfieldResponse = await res.json()

    if (data.status === 'failed') {
      throw new Error(`Higgsfield job ${jobId} failed: ${data.error ?? 'unknown error'}`)
    }

    if (data.status === 'completed' || data.status === 'done') {
      const url =
        data.url ??
        data.image_url ??
        data.outputs?.[0]?.url
      if (url) return url
      throw new Error(`Higgsfield job ${jobId} completed but no image URL returned`)
    }
  }

  throw new Error(`Higgsfield job ${jobId} timed out after ${POLL_TIMEOUT_MS / 1000}s`)
}

/**
 * Generate a 16:9 cinematic image via the Higgsfield text-to-image API.
 *
 * Handles both synchronous (immediate URL) and asynchronous (job polling)
 * response patterns.
 */
export async function generateImage(params: {
  prompt: string
  apiKey: string
  model?: string
  width?: number
  height?: number
}): Promise<HiggsfieldGenerationResult> {
  const {
    prompt,
    apiKey,
    model = DEFAULT_MODEL,
    width = 1024,
    height = 576,
  } = params

  const response = await fetch(`${HIGGSFIELD_BASE}/generations/text-to-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model,
      width,
      height,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Higgsfield API error ${response.status}: ${body}`)
  }

  const data: HiggsfieldResponse = await response.json()

  // ── Synchronous response ─────────────────────────────────────────────────
  const immediateUrl =
    data.url ??
    data.image_url ??
    data.outputs?.[0]?.url

  if (immediateUrl) {
    return {
      imageUrl: immediateUrl,
      jobId: data.id ?? data.job_id,
    }
  }

  // ── Asynchronous / polling response ─────────────────────────────────────
  const jobId = data.id ?? data.job_id
  if (jobId) {
    const imageUrl = await pollJob(jobId, apiKey)
    return { imageUrl, jobId }
  }

  throw new Error('Higgsfield returned an unexpected response shape (no URL or job ID)')
}
