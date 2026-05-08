import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/sessions/[sessionId]
// Returns the full session with derived counts: script exists, shotlist row count, image count.
export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: session, error } = await supabase
      .from('generation_sessions')
      .select(`
        *,
        script:scripts(id),
        shotlist_count:shotlist_rows(count),
        image_count:generated_images(count)
      `)
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const mapped = {
      ...session,
      has_script: Array.isArray(session.script) && session.script.length > 0,
      script_id: Array.isArray(session.script) && session.script.length > 0
        ? (session.script[0] as { id: string }).id
        : null,
      shotlist_count: (session.shotlist_count as unknown as { count: number }[])?.[0]?.count ?? 0,
      image_count: (session.image_count as unknown as { count: number }[])?.[0]?.count ?? 0,
      // Remove the raw join fields from the response
      script: undefined,
    }

    return NextResponse.json({ data: mapped, error: null })
  } catch (err) {
    console.error('[GET /api/sessions/[sessionId]] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/sessions/[sessionId]
// Updates mutable fields on a session: instructions, name, status, selected_file_ids.
export async function PATCH(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, instructions, status, selected_file_ids } = body ?? {}

    const updates: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
      }
      updates.name = name.trim()
    }

    if (instructions !== undefined) {
      updates.instructions = typeof instructions === 'string' && instructions.trim().length > 0
        ? instructions.trim()
        : null
    }

    if (status !== undefined) {
      const validStatuses = [
        'draft', 'generating_script', 'script_ready',
        'generating_shotlist', 'shotlist_ready',
        'generating_images', 'complete', 'error',
      ]
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
      }
      updates.status = status
    }

    if (selected_file_ids !== undefined) {
      if (!Array.isArray(selected_file_ids)) {
        return NextResponse.json({ error: 'selected_file_ids must be an array' }, { status: 400 })
      }
      updates.selected_file_ids = selected_file_ids.filter(
        (id): id is string => typeof id === 'string'
      )
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: session, error } = await supabase
      .from('generation_sessions')
      .update(updates)
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({ data: session, error: null })
  } catch (err) {
    console.error('[PATCH /api/sessions/[sessionId]] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
