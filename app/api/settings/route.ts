import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Masks an API key so only the last 4 characters are visible.
 * E.g. "sk-abc123xyz" → "•••••••xyz"
 * Returns null if the key is null or empty.
 */
function maskApiKey(key: string | null | undefined): string | null {
  if (!key) return null
  if (key.length <= 4) return '••••'
  return '•'.repeat(key.length - 4) + key.slice(-4)
}

// GET /api/settings
// Returns the user's settings. API keys are masked (last 4 chars only).
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[GET /api/settings]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!settings) {
      // Return null — settings haven't been created yet
      return NextResponse.json({ data: null, error: null })
    }

    // Mask all API key fields before returning
    const masked = {
      ...settings,
      openrouter_api_key: maskApiKey(settings.openrouter_api_key),
      higgsfield_api_key: maskApiKey(settings.higgsfield_api_key),
      kieai_api_key: maskApiKey(settings.kieai_api_key),
      wavespeed_api_key: maskApiKey(settings.wavespeed_api_key),
    }

    return NextResponse.json({ data: masked, error: null })
  } catch (err) {
    console.error('[GET /api/settings] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/settings
// Upserts the user's settings.
// Empty strings for API key fields are stored as null.
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
    }

    // Helper: convert empty strings to null for API key fields
    const nullIfEmpty = (val: unknown): string | null => {
      if (val === null || val === undefined) return null
      if (typeof val === 'string') return val.trim() === '' ? null : val.trim()
      return null
    }

    // Build the upsert payload — only include fields that were provided in the request
    const payload: Record<string, unknown> = {
      user_id: user.id,
    }

    if ('openrouter_api_key' in body) payload.openrouter_api_key = nullIfEmpty(body.openrouter_api_key)
    if ('openrouter_model' in body) payload.openrouter_model = nullIfEmpty(body.openrouter_model)
    if ('image_provider' in body) {
      const validProviders = ['higgsfield', 'kieai', 'wavespeed']
      if (!validProviders.includes(body.image_provider)) {
        return NextResponse.json({ error: `Invalid image_provider: ${body.image_provider}` }, { status: 400 })
      }
      payload.image_provider = body.image_provider
    }
    if ('higgsfield_api_key' in body) payload.higgsfield_api_key = nullIfEmpty(body.higgsfield_api_key)
    if ('higgsfield_model' in body) payload.higgsfield_model = nullIfEmpty(body.higgsfield_model)
    if ('kieai_api_key' in body) payload.kieai_api_key = nullIfEmpty(body.kieai_api_key)
    if ('kieai_model' in body) payload.kieai_model = nullIfEmpty(body.kieai_model)
    if ('wavespeed_api_key' in body) payload.wavespeed_api_key = nullIfEmpty(body.wavespeed_api_key)
    if ('wavespeed_model' in body) payload.wavespeed_model = nullIfEmpty(body.wavespeed_model)
    if ('use_higgsfield_mcp' in body) {
      if (typeof body.use_higgsfield_mcp !== 'boolean') {
        return NextResponse.json({ error: 'use_higgsfield_mcp must be a boolean' }, { status: 400 })
      }
      payload.use_higgsfield_mcp = body.use_higgsfield_mcp
    }
    if ('ui_projects_view' in body) {
      const validViews = ['grid', 'list']
      if (!validViews.includes(body.ui_projects_view)) {
        return NextResponse.json({ error: `Invalid ui_projects_view: ${body.ui_projects_view}` }, { status: 400 })
      }
      payload.ui_projects_view = body.ui_projects_view
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('[PUT /api/settings]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return masked version of the saved settings
    const masked = {
      ...settings,
      openrouter_api_key: maskApiKey(settings.openrouter_api_key),
      higgsfield_api_key: maskApiKey(settings.higgsfield_api_key),
      kieai_api_key: maskApiKey(settings.kieai_api_key),
      wavespeed_api_key: maskApiKey(settings.wavespeed_api_key),
    }

    return NextResponse.json({ data: masked, error: null })
  } catch (err) {
    console.error('[PUT /api/settings] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
