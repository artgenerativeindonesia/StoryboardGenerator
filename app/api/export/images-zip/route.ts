import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import JSZip from 'jszip'

// POST /api/export/images-zip
// Downloads all complete generated images for a session and bundles them as a ZIP.
// Body: { sessionId: string }
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { sessionId } = body ?? {}

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('generation_sessions')
      .select('id, name')
      .eq('id', sessionId.trim())
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch all complete generated images with their associated shotlist info
    const { data: images, error: imagesError } = await supabase
      .from('generated_images')
      .select(`
        id,
        storage_path,
        shotlist_row_id,
        generation,
        shotlist_rows (
          scene_number,
          shot_number,
          row_order
        )
      `)
      .eq('session_id', sessionId.trim())
      .eq('user_id', user.id)
      .eq('status', 'complete')
      .not('storage_path', 'is', null)
      .order('created_at', { ascending: true })

    if (imagesError) {
      console.error('[POST /api/export/images-zip] images fetch error', imagesError)
      return NextResponse.json({ error: imagesError.message }, { status: 500 })
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No complete images found for this session' }, { status: 404 })
    }

    // Build the ZIP archive
    const zip = new JSZip()
    const folder = zip.folder(session.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'storyboard')!

    // Download each image from Supabase Storage and add to ZIP
    let addedCount = 0
    for (const img of images) {
      if (!img.storage_path) continue

      try {
        const { data: blob, error: downloadError } = await supabase.storage
          .from('generated-images')
          .download(img.storage_path)

        if (downloadError || !blob) {
          console.warn('[POST /api/export/images-zip] failed to download', img.id, downloadError?.message)
          continue
        }

        const imageBuffer = Buffer.from(await blob.arrayBuffer())

        // Build a meaningful filename from shotlist metadata
        const shotlistRow = Array.isArray(img.shotlist_rows)
          ? img.shotlist_rows[0]
          : (img.shotlist_rows as { scene_number?: string; shot_number?: string; row_order?: number } | null)

        const sceneNum = shotlistRow?.scene_number ?? String(addedCount + 1)
        const shotNum = shotlistRow?.shot_number ?? '1'
        const fileName = `scene${sceneNum.padStart(3, '0')}_shot${shotNum.padStart(2, '0')}_gen${img.generation}.png`

        folder.file(fileName, imageBuffer)
        addedCount++
      } catch (downloadErr) {
        console.warn('[POST /api/export/images-zip] error downloading image', img.id, downloadErr)
      }
    }

    if (addedCount === 0) {
      return NextResponse.json({ error: 'Failed to download any images for export' }, { status: 500 })
    }

    // Generate the ZIP as an ArrayBuffer (compatible with the Web Response BodyInit type)
    const zipArrayBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    })

    const safeSessionName = session.name.replace(/[^a-zA-Z0-9_-]/g, '_')

    return new Response(zipArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeSessionName}_images.zip"`,
        'Content-Length': String(zipArrayBuffer.byteLength),
      },
    })
  } catch (err) {
    console.error('[POST /api/export/images-zip] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
