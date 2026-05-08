import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateImage } from '@/lib/image-gen/index'
import { withConcurrency } from '@/lib/utils'
import type { UserSettings, ImageProvider } from '@/types/database'

const MAX_CONCURRENCY = 5

// POST /api/sessions/[sessionId]/generate-images
// Triggers image generation for all (or pending) shotlist rows in the session.
// Returns immediately with { message: 'started', total: N } and runs generation in background.
export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('generation_sessions')
      .select('id, status')
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch user settings for image provider config
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'User settings not found. Please configure your image provider.' }, { status: 422 })
    }

    const provider: ImageProvider = settings.image_provider ?? 'higgsfield'

    // Validate that the selected provider has an API key
    const providerKeyMap: Record<ImageProvider, string | null> = {
      higgsfield: settings.higgsfield_api_key,
      kieai: settings.kieai_api_key,
      wavespeed: settings.wavespeed_api_key,
    }
    if (!providerKeyMap[provider]) {
      return NextResponse.json(
        { error: `${provider} API key is not configured in settings` },
        { status: 422 }
      )
    }

    // Fetch all shotlist rows for this session
    const { data: shotlistRows, error: rowsError } = await supabase
      .from('shotlist_rows')
      .select('id, image_prompt, scene_number, shot_number')
      .eq('session_id', params.sessionId)
      .eq('user_id', user.id)
      .order('row_order', { ascending: true })

    if (rowsError) {
      return NextResponse.json({ error: rowsError.message }, { status: 500 })
    }

    if (!shotlistRows || shotlistRows.length === 0) {
      return NextResponse.json({ error: 'No shotlist rows found. Generate a shotlist first.' }, { status: 422 })
    }

    const total = shotlistRows.length

    // Create generated_images rows (status: 'pending') for each row if not already present
    for (const row of shotlistRows) {
      const { data: existing } = await supabase
        .from('generated_images')
        .select('id')
        .eq('shotlist_row_id', row.id)
        .eq('session_id', params.sessionId)
        .maybeSingle()

      if (!existing) {
        await supabase.from('generated_images').insert({
          session_id: params.sessionId,
          shotlist_row_id: row.id,
          user_id: user.id,
          status: 'pending',
          image_prompt: row.image_prompt ?? `Scene ${row.scene_number}, Shot ${row.shot_number}`,
          provider,
          generation: 1,
        })
      }
    }

    // Update session status to generating_images
    await supabase
      .from('generation_sessions')
      .update({ status: 'generating_images', error_message: null })
      .eq('id', params.sessionId)

    // Run generation asynchronously — do NOT await
    ;(async () => {
      try {
        // Re-fetch the generated_images rows to get their IDs
        const { data: imageRows } = await supabase
          .from('generated_images')
          .select('id, shotlist_row_id, image_prompt, generation')
          .eq('session_id', params.sessionId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        const rows = imageRows ?? []

        const tasks = rows.map((imageRow) => async () => {
          // Mark as generating
          await supabase
            .from('generated_images')
            .update({ status: 'generating' })
            .eq('id', imageRow.id)

          try {
            // Generate the image via the selected provider
            const { imageUrl } = await generateImage({
              prompt: imageRow.image_prompt,
              provider,
              settings: settings as UserSettings,
            })

            // Fetch the image bytes from the returned URL
            const imageResponse = await fetch(imageUrl)
            if (!imageResponse.ok) {
              throw new Error(`Failed to fetch generated image: HTTP ${imageResponse.status}`)
            }
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

            // Upload to Supabase Storage: generated-images/{userId}/{sessionId}/{rowId}/gen{N}.png
            const storagePath = `${user.id}/${params.sessionId}/${imageRow.shotlist_row_id}/gen${imageRow.generation}.png`

            const { error: uploadError } = await supabase.storage
              .from('generated-images')
              .upload(storagePath, imageBuffer, {
                contentType: 'image/png',
                upsert: true,
              })

            if (uploadError) {
              throw new Error(`Storage upload failed: ${uploadError.message}`)
            }

            // Mark as complete with storage path
            await supabase
              .from('generated_images')
              .update({ status: 'complete', storage_path: storagePath, error_message: null })
              .eq('id', imageRow.id)
          } catch (genErr) {
            const errMsg = genErr instanceof Error ? genErr.message : String(genErr)
            console.error('[generate-images] error for row', imageRow.id, genErr)
            await supabase
              .from('generated_images')
              .update({ status: 'error', error_message: errMsg })
              .eq('id', imageRow.id)
          }
        })

        await withConcurrency(tasks, MAX_CONCURRENCY)

        // Update session status to complete
        await supabase
          .from('generation_sessions')
          .update({ status: 'complete' })
          .eq('id', params.sessionId)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error during image generation'
        console.error('[generate-images] fatal background error', err)
        await supabase
          .from('generation_sessions')
          .update({ status: 'error', error_message: message })
          .eq('id', params.sessionId)
      }
    })()

    return NextResponse.json({ message: 'started', total }, { status: 202 })
  } catch (err) {
    console.error('[POST /api/sessions/[sessionId]/generate-images] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
