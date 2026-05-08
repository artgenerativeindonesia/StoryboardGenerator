import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/projects/[id]
// Returns a single project, verifying that it belongs to the current user.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        file_count:files(count),
        session_count:generation_sessions(count)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const mapped = {
      ...project,
      file_count: (project.file_count as unknown as { count: number }[])?.[0]?.count ?? 0,
      session_count: (project.session_count as unknown as { count: number }[])?.[0]?.count ?? 0,
    }

    return NextResponse.json({ data: mapped, error: null })
  } catch (err) {
    console.error('[GET /api/projects/[id]] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/projects/[id]
// Updates name, description, and/or is_archived on a project the user owns.
// Body: { name?: string, description?: string, is_archived?: boolean }
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, description, is_archived } = body ?? {}

    // Build only the fields that were explicitly provided
    const updates: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Project name cannot be empty' }, { status: 400 })
      }
      if (name.trim().length > 100) {
        return NextResponse.json({ error: 'Project name must be 100 characters or fewer' }, { status: 400 })
      }
      updates.name = name.trim()
    }

    if (description !== undefined) {
      updates.description = typeof description === 'string' && description.trim().length > 0
        ? description.trim()
        : null
    }

    if (is_archived !== undefined) {
      if (typeof is_archived !== 'boolean') {
        return NextResponse.json({ error: 'is_archived must be a boolean' }, { status: 400 })
      }
      updates.is_archived = is_archived
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({ data: project, error: null })
  } catch (err) {
    console.error('[PATCH /api/projects/[id]] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/projects/[id]
// Deletes a project owned by the current user. Cascades to files and sessions via the DB.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify ownership before deletion
    const { data: existing, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('[DELETE /api/projects/[id]]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { id: params.id }, error: null })
  } catch (err) {
    console.error('[DELETE /api/projects/[id]] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
