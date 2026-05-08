import pdfParse from 'pdf-parse'

/**
 * Cleans raw extracted PDF text by collapsing excessive whitespace and blank lines.
 */
function cleanText(raw: string): string {
  return raw
    // Normalise Windows-style line endings
    .replace(/\r\n/g, '\n')
    // Collapse runs of spaces/tabs to a single space
    .replace(/[ \t]+/g, ' ')
    // Collapse more than two consecutive newlines into two
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace on each line
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim()
}

/**
 * Extract plain text from a PDF supplied as a Node.js Buffer.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  return cleanText(data.text)
}

/**
 * Extract plain text from a PDF supplied as an ArrayBuffer (e.g. from a File upload).
 */
export async function extractTextFromArrayBuffer(
  arrayBuffer: ArrayBuffer
): Promise<string> {
  const buffer = Buffer.from(arrayBuffer)
  return extractTextFromPDF(buffer)
}
