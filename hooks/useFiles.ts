'use client'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { useState } from 'react'
import type { ProjectFile } from '@/types/database'
import type { UploadFileResponse } from '@/types/api'

// ---------------------------------------------------------------------------
// Local input types
// ---------------------------------------------------------------------------

export interface UploadFileInput {
  projectId: string
  file: File
  /** Optional per-byte progress callback (0–100). */
  onProgress?: (percent: number) => void
}

export interface DeleteFileInput {
  /** The file row id. */
  id: string
  /** Needed to invalidate the per-project file list. */
  projectId: string
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (projectId: string) => [...fileKeys.lists(), projectId] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (id: string) => [...fileKeys.details(), id] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchFiles(projectId: string): Promise<ProjectFile[]> {
  const res = await fetch(`/api/projects/${projectId}/files`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to fetch files (${res.status})`)
  }
  const json = await res.json()
  return Array.isArray(json) ? json : (json.data ?? [])
}

/**
 * Upload a file using XMLHttpRequest so we can track upload progress.
 * Returns the created ProjectFile row.
 */
async function uploadFile(input: UploadFileInput): Promise<UploadFileResponse> {
  const { projectId, file, onProgress } = input

  return new Promise<UploadFileResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText)
          resolve((parsed.data ?? parsed) as UploadFileResponse)
        } catch {
          reject(new Error('Invalid JSON response from upload endpoint'))
        }
      } else {
        try {
          const body = JSON.parse(xhr.responseText)
          reject(new Error(body?.error ?? `Upload failed (${xhr.status})`))
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`))
        }
      }
    })

    xhr.addEventListener('error', () =>
      reject(new Error('Network error during upload'))
    )
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

    xhr.open('POST', `/api/projects/${projectId}/files`)
    xhr.send(formData)
  })
}

async function deleteFile(id: string): Promise<void> {
  const res = await fetch(`/api/files/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to delete file (${res.status})`)
  }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useFiles(projectId: string): UseQueryResult<ProjectFile[]> {
  return useQuery({
    queryKey: fileKeys.list(projectId),
    queryFn: () => fetchFiles(projectId),
    enabled: Boolean(projectId),
  })
}

/**
 * Upload mutation that also exposes per-file upload progress via React state.
 *
 * ```ts
 * const { mutate, uploadProgress } = useUploadFile()
 * ```
 */
export function useUploadFile(): UseMutationResult<
  UploadFileResponse,
  Error,
  UploadFileInput
> & { uploadProgress: number } {
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: (input: UploadFileInput) =>
      uploadFile({
        ...input,
        onProgress: (pct) => {
          setUploadProgress(pct)
          input.onProgress?.(pct)
        },
      }),
    onMutate: () => {
      setUploadProgress(0)
    },
    onSuccess: (_file, { projectId }) => {
      setUploadProgress(100)
      queryClient.invalidateQueries({ queryKey: fileKeys.list(projectId) })
    },
    onError: () => {
      setUploadProgress(0)
    },
  })

  return { ...mutation, uploadProgress }
}

export function useDeleteFile(): UseMutationResult<
  void,
  Error,
  DeleteFileInput
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }) => deleteFile(id),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list(projectId) })
    },
  })
}
