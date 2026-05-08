import type { ImageProvider, UserSettings } from '@/types/database'

import { generateImage as generateHiggsfield } from './higgsfield'
import { generateImage as generateKieAI } from './kieai'
import { generateImage as generateWavespeed } from './wavespeed'

/* ─── Provider Display Names ────────────────────────────────────────────── */

/**
 * Human-readable display names for each supported image-generation provider.
 */
export const PROVIDER_NAMES: Record<ImageProvider, string> = {
  higgsfield: 'Higgsfield AI',
  kieai: 'kie.ai',
  wavespeed: 'wavespeed.ai',
}

/* ─── Provider Router ───────────────────────────────────────────────────── */

/**
 * Route an image-generation request to the correct provider back-end based
 * on the `provider` field in the request params.
 *
 * Reads API keys and optional model overrides from the supplied `UserSettings`.
 *
 * @throws {Error} When the provider's API key is not configured.
 * @throws {Error} When an unsupported provider is requested.
 */
export async function generateImage(params: {
  prompt: string
  provider: ImageProvider
  settings: UserSettings
}): Promise<{ imageUrl: string }> {
  const { prompt, provider, settings } = params

  switch (provider) {
    case 'higgsfield': {
      const apiKey = settings.higgsfield_api_key
      if (!apiKey) {
        throw new Error('Higgsfield API key is not configured in user settings.')
      }
      const result = await generateHiggsfield({
        prompt,
        apiKey,
        model: settings.higgsfield_model ?? undefined,
      })
      return { imageUrl: result.imageUrl }
    }

    case 'kieai': {
      const apiKey = settings.kieai_api_key
      if (!apiKey) {
        throw new Error('kie.ai API key is not configured in user settings.')
      }
      const result = await generateKieAI({
        prompt,
        apiKey,
        model: settings.kieai_model ?? undefined,
      })
      return { imageUrl: result.imageUrl }
    }

    case 'wavespeed': {
      const apiKey = settings.wavespeed_api_key
      if (!apiKey) {
        throw new Error('wavespeed.ai API key is not configured in user settings.')
      }
      const result = await generateWavespeed({
        prompt,
        apiKey,
        model: settings.wavespeed_model ?? undefined,
      })
      return { imageUrl: result.imageUrl }
    }

    default: {
      // Exhaustiveness guard — TypeScript will flag unhandled variants at compile time.
      const _exhaustive: never = provider
      throw new Error(`Unsupported image provider: ${_exhaustive}`)
    }
  }
}
