import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// In-memory cache
let cachedModels: MappedModel[] | null = null
let cacheTimestamp = 0

interface MappedModel {
  id: string
  name: string
  context_length: number
  pricing: {
    prompt: string
    completion: string
  }
}

interface OpenRouterRawModel {
  id: string
  name: string
  context_length?: number
  pricing?: {
    prompt?: string
    completion?: string
  }
  architecture?: {
    modality?: string
    tokenizer?: string
  }
  description?: string
}

// GET /api/openrouter/models
// Returns the list of text-capable models available via the user's OpenRouter account.
// Results are cached in-memory for 5 minutes.
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch user's OpenRouter API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('openrouter_api_key')
      .eq('user_id', user.id)
      .maybeSingle()

    if (settingsError) {
      console.error('[GET /api/openrouter/models] settings error', settingsError)
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    if (!settings?.openrouter_api_key) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured in settings' },
        { status: 422 }
      )
    }

    // Return from cache if still fresh
    const now = Date.now()
    if (cachedModels && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json({ data: cachedModels, error: null })
    }

    // Fetch from OpenRouter
    const response = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${settings.openrouter_api_key}`,
        'HTTP-Referer': 'https://storyboardgenerator.app',
        'X-Title': 'StoryboardGenerator',
      },
      // Prevent Next.js from caching the fetch result beyond our own TTL
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return NextResponse.json(
        { error: `OpenRouter API error ${response.status}: ${errorBody}` },
        { status: response.status >= 500 ? 502 : response.status }
      )
    }

    const raw = await response.json()
    const allModels: OpenRouterRawModel[] = raw?.data ?? []

    // Filter to text-capable models only (modality includes "text->text")
    const textModels = allModels.filter((model) => {
      const modality = model.architecture?.modality ?? ''
      // Accept models whose output modality includes text
      return (
        modality.includes('text') ||
        modality === '' // include models with no modality specified
      )
    })

    // Map to the shape the frontend expects
    const mapped: MappedModel[] = textModels.map((model) => ({
      id: model.id,
      name: model.name,
      context_length: model.context_length ?? 0,
      pricing: {
        prompt: model.pricing?.prompt ?? '0',
        completion: model.pricing?.completion ?? '0',
      },
    }))

    // Update in-memory cache
    cachedModels = mapped
    cacheTimestamp = now

    return NextResponse.json({ data: mapped, error: null })
  } catch (err) {
    console.error('[GET /api/openrouter/models] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
