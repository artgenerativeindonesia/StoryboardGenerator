import { jsPDF } from 'jspdf'
import type { ShotlistRow } from '@/types/database'

interface ShotlistPDFParams {
  rows: ShotlistRow[]
  projectName: string
  sessionName: string
}

export async function generateShotlistPDF({
  rows,
  projectName,
  sessionName,
}: ShotlistPDFParams): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 10
  const tableTop = 30
  const rowH = 8

  // Columns (width in mm)
  const cols = [
    { label: 'Scene', key: 'scene_number', w: 14 },
    { label: 'Shot', key: 'shot_number', w: 14 },
    { label: 'Type', key: 'shot_type', w: 16 },
    { label: 'Angle', key: 'shot_angle', w: 25 },
    { label: 'Lens', key: 'lens_properties', w: 16 },
    { label: 'Composition', key: 'composition', w: 38 },
    { label: 'Style', key: 'style', w: 32 },
    { label: 'Mood', key: 'mood', w: 24 },
    { label: 'Description', key: 'scene_description', w: 78 },
  ] as const

  const totalW = cols.reduce((s, c) => s + c.w, 0)

  const drawHeader = (page: number) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50, 50, 50)
    doc.text(`${projectName} — Shotlist`, margin, 10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text(sessionName, margin, 16)
    doc.text(`Page ${page}`, pageW - margin, 10, { align: 'right' })

    // Column headers
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, tableTop - rowH, totalW, rowH, 'F')

    let x = margin
    for (const col of cols) {
      doc.text(col.label, x + 1, tableTop - 2)
      x += col.w
    }

    // Bottom border of header
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, tableTop, margin + totalW, tableTop)
  }

  let y = tableTop
  let pageNum = 1
  drawHeader(pageNum)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)

  rows.forEach((row, idx) => {
    if (y + rowH > pageH - margin) {
      doc.addPage()
      pageNum++
      y = tableTop
      drawHeader(pageNum)
    }

    // Alternating row background
    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 252)
      doc.rect(margin, y, totalW, rowH, 'F')
    }

    doc.setTextColor(30, 30, 30)
    let x = margin

    for (const col of cols) {
      const val = String((row as unknown as Record<string, unknown>)[col.key] ?? '')
      const truncated = val.length > 60 ? val.slice(0, 57) + '…' : val
      doc.text(truncated, x + 1, y + 5, { maxWidth: col.w - 2 })
      x += col.w
    }

    // Row bottom border
    doc.setDrawColor(230, 230, 230)
    doc.line(margin, y + rowH, margin + totalW, y + rowH)
    y += rowH
  })

  // Appendix: full image prompts
  if (rows.some((r) => r.image_prompt)) {
    doc.addPage()
    pageNum++
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    doc.text('Image Prompts', margin, 20)

    let py = 30
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    for (const row of rows) {
      if (!row.image_prompt) continue
      if (py > pageH - 20) {
        doc.addPage()
        pageNum++
        py = 20
      }
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 60, 60)
      doc.text(`Scene ${row.scene_number} / Shot ${row.shot_number}`, margin, py)
      py += 5
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      const wrapped = doc.splitTextToSize(row.image_prompt, pageW - margin * 2) as string[]
      for (const line of wrapped) {
        if (py > pageH - 15) { doc.addPage(); pageNum++; py = 20 }
        doc.text(line, margin, py)
        py += 4.5
      }
      py += 4
    }
  }

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
