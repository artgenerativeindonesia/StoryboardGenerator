import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE /api/files/[id]
// Verifies ownership, removes the file from Supabase Storage, then deletes the DB row.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch the file record to verify ownership and get the storage path
    const { data: fileRecord, error: fetchError } = await supabase
      .from('files')
      .select('id, user_id, storage_path')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from Supabase Storage first
    const { error: storageError } = await supabase.storage
      .from('project-files')
      .remove([fileRecord.storage_path])

    if (storageError) {
      // Log but continue — we still want to remove the DB row so it doesn't become
      // a dangling reference. The orphaned storage object can be cleaned up later.
      console.error('[DELETE /api/files/[id]] storage removal error', storageError)
    }

    // Delete the DB row
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('[DELETE /api/files/[id]] db delete error', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ data: { id: params.id }, error: null })
  } catch (err) {
    console.error('[DELETE /api/files/[id]] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
