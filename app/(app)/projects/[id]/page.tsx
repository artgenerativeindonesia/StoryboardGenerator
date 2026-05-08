'use client'

import { useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { FileUploadZone } from '@/components/files/FileUploadZone'
import { FileList } from '@/components/files/FileList'
import SessionsList from '@/components/projects/SessionsList'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useProject } from '@/hooks/useProjects'
import { useFiles, useUploadFile, useDeleteFile } from '@/hooks/useFiles'
import type { ProjectFile } from '@/types/database'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: project, isLoading: projectLoading } = useProject(id)
  const { data: files = [], isLoading: filesLoading } = useFiles(id)
  const uploadFile = useUploadFile()
  const deleteFile = useDeleteFile()

  const handleUploadComplete = useCallback(
    async (file: File) => {
      await uploadFile.mutateAsync({ projectId: id, file })
    },
    [id, uploadFile]
  )

  const handleDeleteFile = useCallback(
    (file: ProjectFile) => {
      deleteFile.mutate({ id: file.id, projectId: id })
    },
    [id, deleteFile]
  )

  if (projectLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-white/60">
        <FolderOpen className="h-12 w-12 opacity-30" />
        <p className="text-lg">Project not found.</p>
        <Button variant="outline" asChild>
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    )
  }

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: project.name },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-screen-2xl mx-auto w-full">
      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/projects')}
          className="gap-2 text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Projects
        </Button>
      </div>

      <Breadcrumbs items={breadcrumbs} />

      {/* ── Project Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {project.name}
        </h1>
        {project.description && (
          <p className="text-white/50 text-sm">{project.description}</p>
        )}
      </div>

      {/* ── Two-column content ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Files section */}
        <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">Source Files</h2>
          <FileUploadZone
            projectId={id}
            onUploadComplete={handleUploadComplete}
          />
          <FileList
            files={files}
            isLoading={filesLoading}
            onDelete={handleDeleteFile}
          />
        </section>

        {/* Sessions section */}
        <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">Sessions</h2>
          <SessionsList projectId={id} />
        </section>
      </div>
    </div>
  )
}
