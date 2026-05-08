import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/sessions/[sessionId]/script
// Returns the script for a session, or null if not yet generated.
export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify session ownership first
    const { data: session } = await supabase
      .from('generation_sessions')
      .select('id')
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch the script (may not exist yet)
    const { data: script, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('session_id', params.sessionId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[GET /api/sessions/[sessionId]/script]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: script ?? null, error: null })
  } catch (err) {
    console.error('[GET /api/sessions/[sessionId]/script] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/sessions/[sessionId]/script
// Updates the script content.
// Body: { content: string }
export async function PATCH(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { content } = body ?? {}

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required and must be a non-empty string' }, { status: 400 })
    }

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

    // Update the script content
    const { data: script, error } = await supabase
      .from('scripts')
      .update({ content: content.trim() })
      .eq('session_id', params.sessionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !script) {
      console.error('[PATCH /api/sessions/[sessionId]/script]', error)
      return NextResponse.json({ error: 'Script not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({ data: script, error: null })
  } catch (err) {
    console.error('[PATCH /api/sessions/[sessionId]/script] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
