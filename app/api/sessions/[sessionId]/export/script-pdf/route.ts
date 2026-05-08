import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateScriptPDF } from '@/lib/export/scriptPDF'

// POST /api/sessions/[sessionId]/export/script-pdf
export async function POST(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch session + project name
    const { data: session } = await supabase
      .from('generation_sessions')
      .select('id, name, project_id')
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .single()
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', session.project_id)
      .single()

    // Fetch script content
    const { data: script } = await supabase
      .from('scripts')
      .select('content')
      .eq('session_id', params.sessionId)
      .eq('user_id', user.id)
      .single()
    if (!script) return NextResponse.json({ error: 'Script not found' }, { status: 404 })

    const pdfBuffer = await generateScriptPDF({
      scriptContent: script.content,
      projectName: project?.name ?? 'Project',
      sessionName: session.name,
    })

    const safeFileName = session.name.replace(/[^a-zA-Z0-9_-]/g, '_')
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFileName}_script.pdf"`,
        'Content-Length': String(pdfBuffer.byteLength),
      },
    })
  } catch (err) {
    console.error('[POST export/script-pdf]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
