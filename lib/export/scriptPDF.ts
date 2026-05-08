import { jsPDF } from 'jspdf'

interface ScriptPDFParams {
  scriptContent: string
  projectName: string
  sessionName: string
}

export async function generateScriptPDF({
  scriptContent,
  projectName,
  sessionName,
}: ScriptPDFParams): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginLeft = 38.1  // 1.5 inches
  const marginRight = 25.4 // 1 inch
  const marginTop = 25.4
  const marginBottom = 25.4
  const contentWidth = pageW - marginLeft - marginRight
  const lineHeight = 6

  doc.setFont('Courier', 'normal')
  doc.setFontSize(12)

  let y = marginTop
  let pageNum = 1

  const addHeader = () => {
    doc.setFontSize(9)
    doc.setFont('Courier', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text(projectName, marginLeft, 15)
    doc.text(String(pageNum), pageW - marginRight, 15, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
  }

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageH - marginBottom) {
      doc.addPage()
      pageNum++
      y = marginTop
      addHeader()
    }
  }

  addHeader()

  // Title block
  doc.setFont('Courier', 'bold')
  doc.setFontSize(14)
  const title = `${projectName} — ${sessionName}`
  doc.text(title, pageW / 2, y, { align: 'center' })
  y += lineHeight * 2

  doc.setFont('Courier', 'normal')
  doc.setFontSize(12)

  const lines = scriptContent.split('\n')

  for (const raw of lines) {
    const line = raw.trimEnd()

    checkPageBreak(lineHeight)

    const isSceneHeader =
      line.match(/^SCENE\s+\d+/i) ||
      line.match(/^(INT\.|EXT\.|INT\/EXT\.)/i)

    const isFadeOut = line.match(/^FADE\s+OUT/i)

    if (isSceneHeader) {
      y += lineHeight * 0.5
      checkPageBreak(lineHeight * 1.5)
      doc.setFont('Courier', 'bold')
      const wrapped = doc.splitTextToSize(line.toUpperCase(), contentWidth) as string[]
      for (const w of wrapped) {
        checkPageBreak(lineHeight)
        doc.text(w, marginLeft, y)
        y += lineHeight
      }
      doc.setFont('Courier', 'normal')
    } else if (isFadeOut) {
      y += lineHeight
      checkPageBreak(lineHeight)
      doc.setFont('Courier', 'bold')
      doc.text(line.toUpperCase(), pageW - marginRight, y, { align: 'right' })
      doc.setFont('Courier', 'normal')
      y += lineHeight
    } else if (line.trim() === '') {
      y += lineHeight * 0.5
    } else {
      const wrapped = doc.splitTextToSize(line, contentWidth) as string[]
      for (const w of wrapped) {
        checkPageBreak(lineHeight)
        doc.text(w, marginLeft, y)
        y += lineHeight
      }
    }
  }

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
