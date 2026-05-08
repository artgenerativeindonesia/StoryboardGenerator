import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/llm/openrouter'
import { buildScriptEditPrompt } from '@/lib/llm/prompts/scriptEdit'

// POST /api/sessions/[sessionId]/script/ai-edit
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

    // Fetch current script
    const { data: script } = await supabase
      .from('scripts')
      .select('content')
      .eq('session_id', params.sessionId)
      .eq('user_id', user.id)
      .single()
    if (!script) return NextResponse.json({ error: 'Script not found' }, { status: 404 })

    // Fetch user settings for API key + model
    const { data: settings } = await supabase
      .from('user_settings')
      .select('openrouter_api_key, openrouter_model')
      .eq('user_id', user.id)
      .single()
    if (!settings?.openrouter_api_key) {
      return NextResponse.json({ error: 'OpenRouter API key not configured in Settings' }, { status: 422 })
    }

    const { system, user: userPrompt } = buildScriptEditPrompt({
      currentScript: script.content,
      editInstruction: instruction.trim(),
    })

    const updatedContent = await callOpenRouter({
      apiKey: settings.openrouter_api_key,
      model: settings.openrouter_model ?? 'openai/gpt-4o',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
    })

    const { data: updated, error: updateError } = await supabase
      .from('scripts')
      .update({ content: updatedContent })
      .eq('session_id', params.sessionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to save updated script' }, { status: 500 })
    }

    return NextResponse.json({ data: updated, error: null })
  } catch (err) {
    console.error('[POST script/ai-edit]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
