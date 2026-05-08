import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SIGNED_URL_EXPIRY = 3600 // 1 hour

// GET /api/sessions/[sessionId]/images
// Returns all generated_images for a session, with signed storage URLs for complete images.
export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify session ownership
    const { data: session } = await supabase
      .from('generation_sessions')
      .select('id')
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch all generated images for the session
    const { data: images, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('session_id', params.sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[GET /api/sessions/[sessionId]/images]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const imageList = images ?? []

    // Generate signed URLs for images that have a storage path
    const imagesWithUrls = await Promise.all(
      imageList.map(async (img) => {
        if (!img.storage_path) {
          return { ...img, imageUrl: null }
        }

        try {
          const { data: signedData, error: signedError } = await supabase.storage
            .from('generated-images')
            .createSignedUrl(img.storage_path, SIGNED_URL_EXPIRY)

          if (signedError || !signedData?.signedUrl) {
            console.warn('[GET /api/sessions/[sessionId]/images] failed to sign URL for', img.id, signedError?.message)
            return { ...img, imageUrl: null }
          }

          return { ...img, imageUrl: signedData.signedUrl }
        } catch {
          return { ...img, imageUrl: null }
        }
      })
    )

    return NextResponse.json({ data: imagesWithUrls, error: null })
  } catch (err) {
    console.error('[GET /api/sessions/[sessionId]/images] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
