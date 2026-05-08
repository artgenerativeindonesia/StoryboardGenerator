import JSZip from 'jszip'

interface ZipImage {
  id: string
  sceneNumber: string
  shotNumber: string
  imageUrl: string
  prompt: string
}

interface ImageZipParams {
  images: ZipImage[]
  projectName: string
  sessionName: string
}

export async function createImagesZip({
  images,
  projectName,
  sessionName,
}: ImageZipParams): Promise<Buffer> {
  const zip = new JSZip()

  const folder = zip.folder(`${projectName}_${sessionName}`.replace(/[^a-zA-Z0-9_\-]/g, '_'))
  if (!folder) throw new Error('Failed to create zip folder')

  const promptLines: string[] = [
    `${projectName} — ${sessionName}`,
    '='.repeat(60),
    '',
  ]

  await Promise.all(
    images.map(async (img, idx) => {
      try {
        const res = await fetch(img.imageUrl)
        if (!res.ok) return
        const buffer = await res.arrayBuffer()

        const paddedScene = String(img.sceneNumber).padStart(3, '0')
        const paddedShot = String(img.shotNumber).padStart(2, '0')
        const filename = `scene${paddedScene}_shot${paddedShot}_${idx + 1}.jpg`

        folder.file(filename, buffer)

        promptLines.push(`[${filename}]`)
        promptLines.push(img.prompt)
        promptLines.push('')
      } catch {
        // Skip failed downloads
      }
    })
  )

  folder.file('prompts.txt', promptLines.join('\n'))

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  return content
}
