import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/projects/[id]/sessions
// Returns all generation sessions for the given project, ordered newest first.
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: sessions, error } = await supabase
      .from('generation_sessions')
      .select('*')
      .eq('project_id', params.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/projects/[id]/sessions]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: sessions ?? [], error: null })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
