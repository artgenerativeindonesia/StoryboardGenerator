'use client'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import type { Project } from '@/types/database'
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types/api'

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (showArchived?: boolean) =>
    [...projectKeys.lists(), { showArchived }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchProjects(showArchived?: boolean): Promise<Project[]> {
  const params = new URLSearchParams()
  if (showArchived !== undefined) {
    params.set('archived', String(showArchived))
  }
  const qs = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`/api/projects${qs}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to fetch projects (${res.status})`)
  }
  const json = await res.json()
  // Handle both array and { data: [...] } envelope shapes
  return Array.isArray(json) ? json : (json.data ?? [])
}

async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to fetch project (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

async function createProject(input: CreateProjectRequest): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to create project (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

async function updateProject(
  id: string,
  input: UpdateProjectRequest
): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to update project (${res.status})`)
  }
  const json = await res.json()
  return json.data ?? json
}

async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Failed to delete project (${res.status})`)
  }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useProjects(showArchived?: boolean): UseQueryResult<Project[]> {
  return useQuery({
    queryKey: projectKeys.list(showArchived),
    queryFn: () => fetchProjects(showArchived),
  })
}

export function useProject(id: string): UseQueryResult<Project> {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  })
}

export function useCreateProject(): UseMutationResult<
  Project,
  Error,
  CreateProjectRequest
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useUpdateProject(): UseMutationResult<
  Project,
  Error,
  { id: string } & UpdateProjectRequest
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }) => updateProject(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(projectKeys.detail(updated.id), updated)
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useDeleteProject(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useArchiveProject(): UseMutationResult<
  Project,
  Error,
  { id: string; archived: boolean }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, archived }) =>
      updateProject(id, { is_archived: archived }),
    onSuccess: (updated) => {
      queryClient.setQueryData(projectKeys.detail(updated.id), updated)
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}
