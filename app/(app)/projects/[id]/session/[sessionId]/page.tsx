'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { StepIndicator } from '@/components/generation/StepIndicator'
import { InstructionForm } from '@/components/generation/InstructionForm'
import { GenerationProgress } from '@/components/generation/GenerationProgress'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useProject } from '@/hooks/useProjects'
import { useSession, useUpdateSession } from '@/hooks/useSession'
import { useFiles } from '@/hooks/useFiles'
import { useGenerationSSE } from '@/hooks/useGenerationSSE'
import { useGenerationStore } from '@/stores/generationStore'

type PageView = 'form' | 'loading'

export default function SessionInstructPage() {
  const { id: projectId, sessionId } = useParams<{ id: string; sessionId: string }>()
  const router = useRouter()

  const { data: project } = useProject(projectId)
  const { data: session, isLoading: sessionLoading } = useSession(sessionId)
  const { data: files = [] } = useFiles(projectId)
  const updateSession = useUpdateSession()
  const { connect, disconnect, isConnected: _isConnected } = useGenerationSSE()

  const [view, setView] = useState<PageView>('form')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const selectedFileIds = useGenerationStore((s) => s.selectedFileIds)
  const instructions = useGenerationStore((s) => s.instructions)
  const generationPercent = useGenerationStore((s) => s.generationPercent)
  const generationMessage = useGenerationStore((s) => s.generationMessage)
  const startGeneration = useGenerationStore((s) => s.startGeneration)
  const updateProgress = useGenerationStore((s) => s.updateProgress)
  const stopGeneration = useGenerationStore((s) => s.stopGeneration)
  const setSelectedFiles = useGenerationStore((s) => s.setSelectedFiles)
  const setInstructions = useGenerationStore((s) => s.setInstructions)

  // Pre-populate from session on first load
  useEffect(() => {
    if (!session) return
    if (session.instructions && !instructions) {
      setInstructions(session.instructions)
    }
    if (session.selected_file_ids?.length && !selectedFileIds.length) {
      setSelectedFiles(session.selected_file_ids)
    }
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if session already has progress
  useEffect(() => {
    if (!session) return
    if (['script_ready', 'generating_shotlist', 'shotlist_ready', 'generating_images', 'complete'].includes(session.status)) {
      const dest = session.status === 'script_ready' || session.status === 'generating_shotlist'
        ? 'script'
        : session.status === 'shotlist_ready'
        ? 'shotlist'
        : 'images'
      router.replace(`/projects/${projectId}/session/${sessionId}/${dest}`)
    }
  }, [session, projectId, sessionId, router])

  const handleGenerateScript = useCallback(async () => {
    setErrorMsg(null)
    setView('loading')
    startGeneration('generating_script')

    try {
      await updateSession.mutateAsync({
        id: sessionId,
        instructions: instructions ?? undefined,
        selected_file_ids: selectedFileIds,
      })
    } catch { /* non-fatal */ }

    connect(
      `/api/sessions/${sessionId}/generate-script`,
      { instructions, selected_file_ids: selectedFileIds },
      {
        onProgress(percent, message, stage) {
          updateProgress(percent, message, stage)
        },
        onComplete() {
          stopGeneration()
          router.push(`/projects/${projectId}/session/${sessionId}/script`)
        },
        onError(msg) {
          stopGeneration()
          setErrorMsg(msg)
          setView('form')
        },
      }
    )
  }, [connect, instructions, selectedFileIds, sessionId, projectId, startGeneration, stopGeneration, updateProgress, updateSession, router])

  const handleCancelGeneration = () => {
    disconnect()
    stopGeneration()
    setView('form')
  }

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: project?.name ?? '…', href: `/projects/${projectId}` },
    { label: session?.name ?? 'New Session' },
  ]

  if (sessionLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-3xl mx-auto w-full">
      <Breadcrumbs items={breadcrumbs} />
      <StepIndicator currentStep={1} />

      {view === 'loading' ? (
        <GenerationProgress
          percent={generationPercent}
          message={generationMessage}
          onCancel={handleCancelGeneration}
        />
      ) : (
        <>
          {errorMsg && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMsg}
            </div>
          )}
          <InstructionForm
            projectId={projectId}
            files={files}
            selectedFileIds={selectedFileIds}
            instructions={instructions}
            onFileSelect={setSelectedFiles}
            onInstructionsChange={setInstructions}
            onGenerate={handleGenerateScript}
          />
        </>
      )}
    </div>
  )
}
