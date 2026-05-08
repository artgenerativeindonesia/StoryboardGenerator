'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { StepIndicator } from '@/components/generation/StepIndicator'
import { ShotlistTable } from '@/components/generation/ShotlistTable'
import { ShotlistAIEditPanel } from '@/components/generation/ShotlistAIEditPanel'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useProject } from '@/hooks/useProjects'
import { useSession } from '@/hooks/useSession'
import { useShotlist, useUpdateShotlistRows } from '@/hooks/useShotlist'
import type { ShotlistRow } from '@/types/database'

export default function ShotlistPage() {
  const { id: projectId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()
  const router = useRouter()

  const { data: project } = useProject(projectId)
  const { data: session, isLoading: sessionLoading } = useSession(sessionId)
  const { data: remoteRows = [], isLoading: shotlistLoading } = useShotlist(sessionId)
  const updateRows = useUpdateShotlistRows()

  const [localRows, setLocalRows] = useState<ShotlistRow[]>([])
  const [isStartingImages, setIsStartingImages] = useState(false)
  const [isAIEditing, setIsAIEditing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Sync remote rows into local state on load
  useEffect(() => {
    if (remoteRows.length > 0) {
      setLocalRows(remoteRows)
    }
  }, [remoteRows])

  // Guard: must be at shotlist_ready or later
  useEffect(() => {
    if (!session) return
    const allowedStatuses = [
      'shotlist_ready',
      'generating_images',
      'complete',
      'error',
    ]
    if (!allowedStatuses.includes(session.status)) {
      const dest =
        session.status === 'script_ready' || session.status === 'generating_shotlist'
          ? 'script'
          : ''
      router.replace(
        dest
          ? `/projects/${projectId}/session/${sessionId}/${dest}`
          : `/projects/${projectId}/session/${sessionId}`
      )
    }
  }, [session, projectId, sessionId, router])

  const handleRowsChange = useCallback(
    (rows: ShotlistRow[]) => {
      setLocalRows(rows)
      const updates = rows.map((r) => ({
        id: r.id,
        scene_number: r.scene_number,
        shot_number: r.shot_number,
        composition: r.composition ?? undefined,
        shot_type: r.shot_type ?? undefined,
        shot_angle: r.shot_angle ?? undefined,
        view_level: r.view_level ?? undefined,
        lens_properties: r.lens_properties ?? undefined,
        style: r.style ?? undefined,
        mood: r.mood ?? undefined,
        scene_description: r.scene_description ?? undefined,
        image_prompt: r.image_prompt ?? undefined,
        row_order: r.row_order,
      }))
      updateRows.mutate({ sessionId, rows: updates })
    },
    [sessionId, updateRows]
  )

  const handleAIEdit = useCallback(
    async (instruction: string) => {
      setIsAIEditing(true)
      try {
        await fetch(`/api/sessions/${sessionId}/shotlist/ai-edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instruction }),
        })
      } finally {
        setIsAIEditing(false)
      }
    },
    [sessionId]
  )

  const handleDownloadPDF = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/export/shotlist-pdf`, {
        method: 'POST',
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shotlist-${sessionId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Silently fail
    }
  }, [sessionId])

  const handleGenerateAllImages = useCallback(async () => {
    setErrorMsg(null)
    setIsStartingImages(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/generate-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Failed to start image generation (${res.status})`)
      }
      router.push(`/projects/${projectId}/session/${sessionId}/images`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to start image generation')
      setIsStartingImages(false)
    }
  }, [sessionId, projectId, router])

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: project?.name ?? '…', href: `/projects/${projectId}` },
    { label: 'Shotlist' },
  ]

  if (sessionLoading || shotlistLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-screen-xl mx-auto w-full">
      <Breadcrumbs items={breadcrumbs} />

      <StepIndicator currentStep={5} />

      {/* ── Action bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(`/projects/${projectId}/session/${sessionId}/script`)
          }
          className="gap-2 text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Script
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="gap-2 border-white/20 text-white/70 hover:text-white hover:bg-white/5"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateAllImages}
            disabled={isStartingImages}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5"
          >
            {isStartingImages ? 'Starting…' : 'Generate All Images!'}
          </Button>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <ShotlistTable
            sessionId={sessionId}
            rows={localRows}
            onChange={handleRowsChange}
            isSaving={updateRows.isPending}
          />
        </div>
        <ShotlistAIEditPanel
          onSubmit={handleAIEdit}
          isLoading={isAIEditing}
        />
      </div>
    </div>
  )
}
