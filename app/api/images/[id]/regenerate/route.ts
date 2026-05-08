import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateImage } from '@/lib/image-gen/index'
import type { UserSettings, ImageProvider } from '@/types/database'

const SIGNED_URL_EXPIRY = 3600 // 1 hour

// POST /api/images/[id]/regenerate
// Regenerates a single image, optionally with an overridden prompt.
// Body: { prompt?: string }
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Parse optional body
    let customPrompt: string | undefined
    try {
      const body = await request.json()
      if (typeof body?.prompt === 'string' && body.prompt.trim().length > 0) {
        customPrompt = body.prompt.trim()
      }
    } catch {
      // No body or invalid JSON — use existing prompt
    }

    // Fetch the image row and verify ownership
    const { data: imageRow, error: fetchError } = await supabase
      .from('generated_images')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !imageRow) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Fetch user settings for provider config
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'User settings not found. Please configure your image provider.' }, { status: 422 })
    }

    const provider: ImageProvider = (imageRow.provider as ImageProvider) ?? settings.image_provider ?? 'higgsfield'

    // Validate provider API key
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

    // Determine the prompt to use
    const promptToUse = customPrompt ?? imageRow.image_prompt
    if (!promptToUse) {
      return NextResponse.json({ error: 'No image prompt available for this image' }, { status: 422 })
    }

    const nextGeneration = (imageRow.generation ?? 1) + 1

    // Update prompt (if overridden) and mark as generating
    await supabase
      .from('generated_images')
      .update({
        status: 'generating',
        image_prompt: promptToUse,
        generation: nextGeneration,
        error_message: null,
      })
      .eq('id', params.id)

    // Generate the image
    let imageUrl: string
    try {
      const result = await generateImage({
        prompt: promptToUse,
        provider,
        settings: settings as UserSettings,
      })
      imageUrl = result.imageUrl
    } catch (genErr) {
      const errMsg = genErr instanceof Error ? genErr.message : String(genErr)
      await supabase
        .from('generated_images')
        .update({ status: 'error', error_message: errMsg })
        .eq('id', params.id)
      return NextResponse.json({ error: `Image generation failed: ${errMsg}` }, { status: 502 })
    }

    // Fetch the image bytes from the returned URL
    let imageBuffer: Buffer
    try {
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch generated image: HTTP ${imageResponse.status}`)
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    } catch (fetchErr) {
      const errMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
      await supabase
        .from('generated_images')
        .update({ status: 'error', error_message: errMsg })
        .eq('id', params.id)
      return NextResponse.json({ error: `Failed to retrieve generated image: ${errMsg}` }, { status: 502 })
    }

    // Upload to Supabase Storage
    const storagePath = `${user.id}/${imageRow.session_id}/${imageRow.shotlist_row_id}/gen${nextGeneration}.png`

    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      await supabase
        .from('generated_images')
        .update({ status: 'error', error_message: uploadError.message })
        .eq('id', params.id)
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Update row with new storage path and complete status
    const { data: updatedRow, error: updateError } = await supabase
      .from('generated_images')
      .update({
        status: 'complete',
        storage_path: storagePath,
        error_message: null,
        provider,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError || !updatedRow) {
      console.error('[POST /api/images/[id]/regenerate] update error', updateError)
      return NextResponse.json({ error: 'Failed to update image record' }, { status: 500 })
    }

    // Generate a signed URL for the newly uploaded image
    let signedUrl: string | null = null
    try {
      const { data: signedData } = await supabase.storage
        .from('generated-images')
        .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)
      signedUrl = signedData?.signedUrl ?? null
    } catch {
      // Non-fatal — client can request separately
    }

    return NextResponse.json({
      data: { ...updatedRow, imageUrl: signedUrl },
      error: null,
    })
  } catch (err) {
    console.error('[POST /api/images/[id]/regenerate] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
