import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import jsPDF from 'jspdf'

// POST /api/export/script
// Generates and returns a PDF export of the script for the given session.
// Body: { sessionId: string }
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { sessionId } = body ?? {}

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('generation_sessions')
      .select('id, name')
      .eq('id', sessionId.trim())
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch the script
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('content')
      .eq('session_id', sessionId.trim())
      .eq('user_id', user.id)
      .single()

    if (scriptError || !script) {
      return NextResponse.json({ error: 'Script not found for this session' }, { status: 404 })
    }

    // Build PDF using jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const PAGE_WIDTH = doc.internal.pageSize.getWidth()
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight()
    const MARGIN = 20
    const LINE_HEIGHT = 6
    const MAX_LINE_WIDTH = PAGE_WIDTH - MARGIN * 2
    let cursorY = MARGIN

    // Title
    doc.setFont('Courier', 'bold')
    doc.setFontSize(16)
    doc.text(session.name, PAGE_WIDTH / 2, cursorY, { align: 'center' })
    cursorY += LINE_HEIGHT * 2

    // Divider line
    doc.setLineWidth(0.3)
    doc.line(MARGIN, cursorY, PAGE_WIDTH - MARGIN, cursorY)
    cursorY += LINE_HEIGHT

    // Script body — Courier is the standard screenplay font
    doc.setFont('Courier', 'normal')
    doc.setFontSize(11)

    const lines = script.content.split('\n')

    for (const rawLine of lines) {
      // Let jsPDF split long lines at word boundaries
      const wrappedLines = doc.splitTextToSize(rawLine || ' ', MAX_LINE_WIDTH) as string[]

      for (const wl of wrappedLines) {
        if (cursorY + LINE_HEIGHT > PAGE_HEIGHT - MARGIN) {
          doc.addPage()
          cursorY = MARGIN
        }
        doc.text(wl, MARGIN, cursorY)
        cursorY += LINE_HEIGHT
      }
    }

    // Output as ArrayBuffer and convert to Buffer for the response
    const pdfArrayBuffer = doc.output('arraybuffer')
    const pdfBuffer = Buffer.from(pdfArrayBuffer)

    const safeFileName = session.name.replace(/[^a-zA-Z0-9_-]/g, '_')

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFileName}_script.pdf"`,
        'Content-Length': String(pdfBuffer.byteLength),
      },
    })
  } catch (err) {
    console.error('[POST /api/export/script] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
