import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
]

// POST /api/files
// Uploads a file (PDF or text) to Supabase Storage and inserts a row in the files table.
// Expects multipart/form-data with fields: projectId (string), file (File)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Parse multipart form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const projectId = formData.get('projectId') as string | null
    const file = formData.get('file') as File | null

    // Validate required fields
    if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds the 50 MB size limit' }, { status: 400 })
    }

    // Validate MIME type
    const mimeType = file.type || 'application/octet-stream'
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Only PDF and text files are allowed' },
        { status: 400 }
      )
    }

    // Verify the project belongs to this user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId.trim())
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Generate a safe storage path
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${user.id}/${projectId.trim()}/${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('project-files')
      .upload(storagePath, file, { contentType: mimeType, upsert: false })

    if (storageError) {
      console.error('[POST /api/files] storage upload error', storageError)
      return NextResponse.json({ error: `Storage upload failed: ${storageError.message}` }, { status: 500 })
    }

    // Insert file record into the database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        project_id: projectId.trim(),
        user_id: user.id,
        name: file.name,
        original_name: file.name,
        size_bytes: file.size,
        mime_type: mimeType,
        storage_path: storageData.path,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[POST /api/files] db insert error', dbError)
      // Best-effort cleanup of the orphaned storage object
      await supabase.storage.from('project-files').remove([storagePath])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ data: fileRecord, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/files] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
