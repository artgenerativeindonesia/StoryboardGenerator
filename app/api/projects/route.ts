import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/projects
// Returns all projects for the current user, optionally filtered by is_archived.
// Includes file_count and session_count as subquery aggregates.
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const archivedParam = searchParams.get('is_archived')
    // Default to non-archived projects
    const isArchived = archivedParam === 'true'

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        file_count:files(count),
        session_count:generation_sessions(count)
      `)
      .eq('user_id', user.id)
      .eq('is_archived', isArchived)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[GET /api/projects]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Flatten the count subqueries from [{count: N}] to just N
    const mapped = (projects ?? []).map((p) => ({
      ...p,
      file_count: (p.file_count as unknown as { count: number }[])?.[0]?.count ?? 0,
      session_count: (p.session_count as unknown as { count: number }[])?.[0]?.count ?? 0,
    }))

    return NextResponse.json({ data: mapped, error: null })
  } catch (err) {
    console.error('[GET /api/projects] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects
// Creates a new project for the current user.
// Body: { name: string, description?: string }
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, description } = body ?? {}

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Project name must be 100 characters or fewer' }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/projects]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: project, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/projects] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
