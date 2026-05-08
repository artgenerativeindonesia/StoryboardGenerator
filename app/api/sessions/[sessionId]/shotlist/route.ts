import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/sessions/[sessionId]/shotlist
// Returns all shotlist_rows for the session, ordered by row_order.
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

    const { data: rows, error } = await supabase
      .from('shotlist_rows')
      .select('*')
      .eq('session_id', params.sessionId)
      .eq('user_id', user.id)
      .order('row_order', { ascending: true })

    if (error) {
      console.error('[GET /api/sessions/[sessionId]/shotlist]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: rows ?? [], error: null })
  } catch (err) {
    console.error('[GET /api/sessions/[sessionId]/shotlist] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/sessions/[sessionId]/shotlist
// Upserts an array of shotlist rows for the session.
// Body: { rows: ShotlistRow[] }
// Each row must include an `id` for upsert to work; rows without an id are inserted fresh.
export async function PATCH(
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

    const body = await request.json()
    const { rows } = body ?? {}

    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'rows must be an array' }, { status: 400 })
    }

    if (rows.length === 0) {
      return NextResponse.json({ data: [], error: null })
    }

    // Enforce session_id and user_id on every row to prevent cross-session writes
    const rowsToUpsert = rows.map((row: Record<string, unknown>, index: number) => ({
      ...row,
      session_id: params.sessionId,
      user_id: user.id,
      // Ensure row_order defaults to its array position if not provided
      row_order: typeof row.row_order === 'number' ? row.row_order : index,
    }))

    const { data: upserted, error } = await supabase
      .from('shotlist_rows')
      .upsert(rowsToUpsert, { onConflict: 'id' })
      .select()

    if (error) {
      console.error('[PATCH /api/sessions/[sessionId]/shotlist]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: upserted ?? [], error: null })
  } catch (err) {
    console.error('[PATCH /api/sessions/[sessionId]/shotlist] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
