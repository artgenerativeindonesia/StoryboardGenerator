import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/sessions
// Creates a new generation session for a project the user owns.
// Body: { projectId: string, name?: string, instructions?: string, selectedFileIds?: string[] }
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { project_id, name, instructions, selected_file_ids } = body ?? {}

    // Validate required fields
    if (!project_id || typeof project_id !== 'string' || project_id.trim().length === 0) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
    }

    // Verify the project belongs to this user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id.trim())
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Sanitize optional fields
    const sessionName = typeof name === 'string' && name.trim().length > 0
      ? name.trim()
      : 'New Session'

    const sessionInstructions = typeof instructions === 'string' && instructions.trim().length > 0
      ? instructions.trim()
      : null

    const fileIds = Array.isArray(selected_file_ids)
      ? selected_file_ids.filter((id): id is string => typeof id === 'string')
      : []

    const { data: session, error } = await supabase
      .from('generation_sessions')
      .insert({
        project_id: project_id.trim(),
        user_id: user.id,
        name: sessionName,
        instructions: sessionInstructions,
        selected_file_ids: fileIds,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/sessions]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: session, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/sessions] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
