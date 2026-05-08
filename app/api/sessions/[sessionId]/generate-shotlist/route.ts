import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { streamOpenRouter } from '@/lib/llm/openrouter'
import { buildShotlistPrompt } from '@/lib/llm/prompts/shotlist'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

// POST /api/sessions/[sessionId]/generate-shotlist
// Streams shotlist generation progress via SSE (text/event-stream).
// Requires an existing script for the session.
export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  // Auth check — must happen before we open the stream
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify session ownership
  const { data: session, error: sessionError } = await supabase
    .from('generation_sessions')
    .select('*')
    .eq('id', params.sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Fetch the script content — required before generating a shotlist
  const { data: scriptRow, error: scriptError } = await supabase
    .from('scripts')
    .select('id, content')
    .eq('session_id', params.sessionId)
    .eq('user_id', user.id)
    .single()

  if (scriptError || !scriptRow) {
    return NextResponse.json({ error: 'No script found for this session. Generate a script first.' }, { status: 422 })
  }

  // Fetch user settings for API key + model
  const { data: settings } = await supabase
    .from('user_settings')
    .select('openrouter_api_key, openrouter_model')
    .eq('user_id', user.id)
    .single()

  if (!settings?.openrouter_api_key) {
    return NextResponse.json({ error: 'OpenRouter API key not configured in settings' }, { status: 422 })
  }

  // Set up SSE stream
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const sendEvent = async (data: object) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
    } catch {
      // Writer may have already been closed if client disconnected
    }
  }

  // Run background generation — do NOT await; return the stream immediately
  ;(async () => {
    try {
      await sendEvent({ type: 'progress', stage: 'reading', percent: 5, message: 'Reading script...' })

      // Update session status
      await supabase
        .from('generation_sessions')
        .update({ status: 'generating_shotlist', error_message: null })
        .eq('id', params.sessionId)

      await sendEvent({ type: 'progress', stage: 'reading', percent: 15, message: 'Reading script...' })

      // Build shotlist prompt
      await sendEvent({
        type: 'progress',
        stage: 'planning',
        percent: 20,
        message: 'Planning visual sequences...',
      })

      const { system, user: userPrompt } = buildShotlistPrompt({
        scriptContent: scriptRow.content,
        instructions: session.instructions ?? undefined,
      })

      await sendEvent({
        type: 'progress',
        stage: 'planning',
        percent: 40,
        message: 'Planning visual sequences...',
      })

      // Stream from OpenRouter, accumulating full response, updating percent 40→85
      let fullContent = ''
      let chunkCount = 0
      const ESTIMATED_CHUNKS = 300

      const llmStream = await streamOpenRouter({
        apiKey: settings.openrouter_api_key,
        model: settings.openrouter_model ?? 'openai/gpt-4o',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      })

      const llmReader = llmStream.getReader()
      while (true) {
        const { done, value } = await llmReader.read()
        if (done) break
        fullContent += value
        chunkCount++

        // Ramp from 40 to 85 as chunks arrive
        const streamPercent = Math.min(85, 40 + Math.round((chunkCount / ESTIMATED_CHUNKS) * 45))
        if (chunkCount % 10 === 0) {
          await sendEvent({
            type: 'progress',
            stage: 'generating',
            percent: streamPercent,
            message: 'Generating shot details...',
          })
        }
      }

      await sendEvent({
        type: 'progress',
        stage: 'building',
        percent: 87,
        message: 'Building prompt library...',
      })

      // Parse JSON from LLM response — strip optional markdown fences
      let jsonText = fullContent.trim()
      // Remove ```json ... ``` or ``` ... ``` wrappers if present
      const fenceMatch = jsonText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
      if (fenceMatch) {
        jsonText = fenceMatch[1].trim()
      }

      let shotlistRows: Record<string, unknown>[]
      try {
        shotlistRows = JSON.parse(jsonText)
        if (!Array.isArray(shotlistRows)) {
          throw new Error('Expected a JSON array')
        }
      } catch (parseErr) {
        throw new Error(`Failed to parse shotlist JSON from LLM response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`)
      }

      await sendEvent({
        type: 'progress',
        stage: 'building',
        percent: 90,
        message: 'Building prompt library...',
      })

      // Delete all existing shotlist rows for this session (replace strategy)
      const { error: deleteError } = await supabase
        .from('shotlist_rows')
        .delete()
        .eq('session_id', params.sessionId)
        .eq('user_id', user.id)

      if (deleteError) {
        throw new Error(`Failed to clear existing shotlist: ${deleteError.message}`)
      }

      // Bulk insert new shotlist rows with row_order
      const rowsToInsert = shotlistRows.map((row, index) => ({
        session_id: params.sessionId,
        user_id: user.id,
        scene_number: String(row.scene_number ?? ''),
        shot_number: String(row.shot_number ?? ''),
        composition: row.composition ?? null,
        shot_type: row.shot_type ?? null,
        shot_angle: row.shot_angle ?? null,
        view_level: row.view_level ?? null,
        lens_properties: row.lens_properties ?? null,
        style: row.style ?? null,
        mood: row.mood ?? null,
        scene_description: row.scene_description ?? null,
        image_prompt: row.image_prompt ?? null,
        row_order: index,
      }))

      const { error: insertError } = await supabase
        .from('shotlist_rows')
        .insert(rowsToInsert)

      if (insertError) {
        throw new Error(`Failed to save shotlist rows: ${insertError.message}`)
      }

      await sendEvent({
        type: 'progress',
        stage: 'building',
        percent: 97,
        message: 'Building prompt library...',
      })

      // Update session status to shotlist_ready
      await supabase
        .from('generation_sessions')
        .update({ status: 'shotlist_ready' })
        .eq('id', params.sessionId)

      await sendEvent({
        type: 'complete',
        stage: 'done',
        percent: 100,
        message: `Shotlist generated: ${rowsToInsert.length} shots`,
        rowCount: rowsToInsert.length,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error during shotlist generation'
      console.error('[generate-shotlist] background error', err)

      await supabase
        .from('generation_sessions')
        .update({ status: 'error', error_message: message })
        .eq('id', params.sessionId)

      await sendEvent({ type: 'error', stage: 'error', percent: 0, message })
    } finally {
      try {
        await writer.close()
      } catch {
        // Already closed
      }
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
