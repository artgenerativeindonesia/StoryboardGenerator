import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { streamOpenRouter } from '@/lib/llm/openrouter'
import { buildScriptPrompt } from '@/lib/llm/prompts/script'
import { extractTextFromArrayBuffer } from '@/lib/pdf/extract'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

// POST /api/sessions/[sessionId]/generate-script
// Streams script generation progress via SSE (text/event-stream).
// Each event is a JSON object: data: {...}\n\n
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

  // Fetch user settings for API key + model
  const { data: settings } = await supabase
    .from('user_settings')
    .select('openrouter_api_key, openrouter_model')
    .eq('user_id', user.id)
    .single()

  if (!settings?.openrouter_api_key) {
    return NextResponse.json({ error: 'OpenRouter API key not configured in settings' }, { status: 422 })
  }

  // Determine which file IDs to use (from body or session)
  let bodyFileIds: string[] | undefined
  try {
    const body = await request.json()
    if (Array.isArray(body?.selected_file_ids)) {
      bodyFileIds = body.selected_file_ids.filter((id: unknown): id is string => typeof id === 'string')
    }
  } catch {
    // No body or invalid JSON — use session defaults
  }

  const selectedFileIds: string[] = bodyFileIds ?? session.selected_file_ids ?? []

  // Set up SSE stream
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const sendEvent = async (data: object) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
    } catch {
      // Writer may have already been closed if the client disconnected
    }
  }

  // Run background generation — do NOT await; return the stream immediately
  ;(async () => {
    try {
      await sendEvent({ type: 'progress', stage: 'init', percent: 5, message: 'Initializing...' })

      // Update session status
      await supabase
        .from('generation_sessions')
        .update({ status: 'generating_script', error_message: null })
        .eq('id', params.sessionId)

      // Download and extract text from each selected file
      let combinedText = ''
      if (selectedFileIds.length > 0) {
        await sendEvent({ type: 'progress', stage: 'parsing', percent: 10, message: 'Loading files...' })

        const { data: files } = await supabase
          .from('files')
          .select('id, name, storage_path, mime_type')
          .in('id', selectedFileIds)
          .eq('user_id', user.id)

        const fileList = files ?? []

        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i]
          const progressPercent = 10 + Math.round((i / fileList.length) * 10)
          await sendEvent({
            type: 'progress',
            stage: 'parsing',
            percent: progressPercent,
            message: `Parsing file: ${file.name}`,
          })

          const { data: blob, error: downloadError } = await supabase.storage
            .from('project-files')
            .download(file.storage_path)

          if (downloadError || !blob) {
            console.error('[generate-script] Failed to download file', file.id, downloadError)
            continue
          }

          const arrayBuffer = await blob.arrayBuffer()

          if (file.mime_type === 'application/pdf') {
            const text = await extractTextFromArrayBuffer(arrayBuffer)
            combinedText += `\n\n--- ${file.name} ---\n\n${text}`
          } else {
            // Plain text / markdown / csv
            const text = new TextDecoder().decode(arrayBuffer)
            combinedText += `\n\n--- ${file.name} ---\n\n${text}`
          }
        }
      }

      await sendEvent({ type: 'progress', stage: 'parsing', percent: 20, message: 'Parsing PDF content...' })

      if (!combinedText.trim()) {
        combinedText = '[No source files provided — write an original screenplay based on the instructions.]'
      }

      // Build prompt
      await sendEvent({
        type: 'progress',
        stage: 'analyzing',
        percent: 40,
        message: 'Analyzing document structure...',
      })

      const { system, user: userPrompt } = buildScriptPrompt({
        pdfText: combinedText.trim(),
        instructions: session.instructions ?? undefined,
      })

      // Stream from OpenRouter, accumulating full content and updating percent 40→80
      let fullContent = ''
      let chunkCount = 0
      // We don't know total tokens ahead of time, so we use a heuristic ramp
      const ESTIMATED_CHUNKS = 200

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

        // Ramp from 40 to 80 as chunks arrive
        const streamPercent = Math.min(80, 40 + Math.round((chunkCount / ESTIMATED_CHUNKS) * 40))
        if (chunkCount % 10 === 0) {
          await sendEvent({
            type: 'progress',
            stage: 'generating',
            percent: streamPercent,
            message: 'Generating script...',
          })
        }
      }

      await sendEvent({ type: 'progress', stage: 'finalizing', percent: 95, message: 'Finalizing script...' })

      // Upsert into scripts table
      const { data: scriptRow, error: scriptError } = await supabase
        .from('scripts')
        .upsert(
          {
            session_id: params.sessionId,
            user_id: user.id,
            content: fullContent,
            llm_model: settings.openrouter_model ?? 'openai/gpt-4o',
          },
          { onConflict: 'session_id' }
        )
        .select()
        .single()

      if (scriptError) {
        throw new Error(`Failed to save script: ${scriptError.message}`)
      }

      // Update session status to script_ready
      await supabase
        .from('generation_sessions')
        .update({ status: 'script_ready' })
        .eq('id', params.sessionId)

      await sendEvent({
        type: 'complete',
        stage: 'done',
        percent: 100,
        message: 'Script generated successfully',
        scriptId: scriptRow.id,
        content: fullContent,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error during script generation'
      console.error('[generate-script] background error', err)

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
