import { createClient } from '@/lib/supabase/server'

const PROJECT_FILES_BUCKET = 'project-files'
const GENERATED_IMAGES_BUCKET = 'generated-images'

/**
 * Upload a PDF (or other allowed file) to the project-files bucket.
 * Storage path: {userId}/{projectId}/{timestamp}-{sanitizedFileName}
 */
export async function uploadFile(
  userId: string,
  projectId: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  const supabase = await createClient()

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${userId}/${projectId}/${timestamp}-${safeName}`

  const { error } = await supabase.storage
    .from(PROJECT_FILES_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Bucket is private — callers should use getSignedUrl for access.
  // Return the storage path as the public URL placeholder.
  const publicUrl = path

  return { path, publicUrl }
}

/**
 * Download a file from the project-files bucket and return its raw bytes.
 */
export async function downloadFile(path: string): Promise<ArrayBuffer> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(PROJECT_FILES_BUCKET)
    .download(path)

  if (error || !data) {
    throw new Error(`Failed to download file: ${error?.message ?? 'No data returned'}`)
  }

  return data.arrayBuffer()
}

/**
 * Delete a file from the project-files bucket.
 */
export async function deleteFile(path: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(PROJECT_FILES_BUCKET)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Upload a generated storyboard image to the generated-images bucket.
 * Storage path: {userId}/{sessionId}/{rowId}/gen{generation}.png
 * Returns the storage path.
 */
export async function uploadImage(
  userId: string,
  sessionId: string,
  rowId: string,
  imageData: Buffer,
  generation: number
): Promise<string> {
  const supabase = await createClient()

  const path = `${userId}/${sessionId}/${rowId}/gen${generation}.png`

  const { error } = await supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .upload(path, imageData, {
      contentType: 'image/png',
      upsert: true,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  return path
}

/**
 * Generate a short-lived signed URL for private bucket access.
 * Defaults to 1 hour (3600 seconds).
 */
export async function getSignedUrl(
  path: string,
  bucket: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? 'No URL returned'}`)
  }

  return data.signedUrl
}
