import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/llm/openrouter'
import { buildShotlistEditPrompt } from '@/lib/llm/prompts/shotlistEdit'

// POST /api/sessions/[sessionId]/shotlist/ai-edit
// Body: { instruction: string }
export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { instruction } = body ?? {}
    if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
      return NextResponse.json({ error: 'instruction is required' }, { status: 400 })
    }

    // Verify session ownership
    const { data: session } = await supabase
      .from('generation_sessions')
      .select('id')
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .single()
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    // Fetch current shotlist rows
    const { data: rows } = await supabase
      .from('shotlist_rows')
      .select('*')
      .eq('session_id', params.sessionId)
      .eq('user_id', user.id)
      .order('row_order', { ascending: true })
    if (!rows?.length) return NextResponse.json({ error: 'No shotlist rows found' }, { status: 404 })

    // Fetch user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('openrouter_api_key, openrouter_model')
      .eq('user_id', user.id)
      .single()
    if (!settings?.openrouter_api_key) {
      return NextResponse.json({ error: 'OpenRouter API key not configured in Settings' }, { status: 422 })
    }

    const { system, user: userPrompt } = buildShotlistEditPrompt({
      currentRows: rows,
      editInstruction: instruction.trim(),
    })

    const rawResponse = await callOpenRouter({
      apiKey: settings.openrouter_api_key,
      model: settings.openrouter_model ?? 'openai/gpt-4o',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
    })

    let updatedRows: Record<string, unknown>[]
    try {
      const cleaned = rawResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      updatedRows = JSON.parse(cleaned)
      if (!Array.isArray(updatedRows)) throw new Error('Not an array')
    } catch {
      return NextResponse.json({ error: 'LLM returned invalid JSON for shotlist' }, { status: 502 })
    }

    // Upsert the updated rows, enforcing ownership
    const rowsToUpsert = updatedRows.map((r, i) => ({
      ...r,
      session_id: params.sessionId,
      user_id: user.id,
      row_order: typeof r.row_order === 'number' ? r.row_order : i,
    }))

    const { data: upserted, error: upsertError } = await supabase
      .from('shotlist_rows')
      .upsert(rowsToUpsert, { onConflict: 'id' })
      .select()

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ data: upserted ?? [], error: null })
  } catch (err) {
    console.error('[POST shotlist/ai-edit]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
