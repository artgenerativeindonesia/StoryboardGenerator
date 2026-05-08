'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { StepIndicator } from '@/components/generation/StepIndicator'
import { ScriptEditor } from '@/components/generation/ScriptEditor'
import { ScriptAIEditPanel } from '@/components/generation/ScriptAIEditPanel'
import { GenerationProgress } from '@/components/generation/GenerationProgress'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useProject } from '@/hooks/useProjects'
import { useSession } from '@/hooks/useSession'
import { useScript, useUpdateScript } from '@/hooks/useScript'
import { useGenerationSSE } from '@/hooks/useGenerationSSE'
import { useGenerationStore } from '@/stores/generationStore'

type PageView = 'editor' | 'generating'

export default function ScriptPage() {
  const { id: projectId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()
  const router = useRouter()

  const { data: project } = useProject(projectId)
  const { data: session, isLoading: sessionLoading } = useSession(sessionId)
  const { data: script, isLoading: scriptLoading } = useScript(sessionId)
  const updateScript = useUpdateScript()
  const { connect, disconnect, isConnected } = useGenerationSSE()

  const [view, setView] = useState<PageView>('editor')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isAIEditing, setIsAIEditing] = useState(false)

  const generationPercent = useGenerationStore((s) => s.generationPercent)
  const generationMessage = useGenerationStore((s) => s.generationMessage)
  const generationStage = useGenerationStore((s) => s.generationStage)
  const startGeneration = useGenerationStore((s) => s.startGeneration)
  const updateProgress = useGenerationStore((s) => s.updateProgress)
  const stopGeneration = useGenerationStore((s) => s.stopGeneration)

  // Guard: redirect back to step 1 if no script exists yet
  useEffect(() => {
    if (!session) return
    if (session.status === 'draft' || session.status === 'generating_script') {
      router.replace(`/projects/${projectId}/session/${sessionId}`)
    }
  }, [session, projectId, sessionId, router])

  const handleContentChange = useCallback(
    (content: string) => {
      updateScript.debouncedMutate({ sessionId, content })
    },
    [sessionId, updateScript]
  )

  const handleAIEdit = useCallback(
    async (instruction: string) => {
      setIsAIEditing(true)
      try {
        await fetch(`/api/sessions/${sessionId}/script/ai-edit`, {
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
      const res = await fetch(`/api/sessions/${sessionId}/export/script-pdf`, {
        method: 'POST',
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `script-${sessionId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Silently fail — download is optional
    }
  }, [sessionId])

  const handleGenerateShotlist = useCallback(() => {
    setErrorMsg(null)
    setView('generating')
    startGeneration('generating_shotlist')

    connect(
      `/api/sessions/${sessionId}/generate-shotlist`,
      {},
      {
        onProgress(percent, message, stage) {
          updateProgress(percent, message, stage)
        },
        onComplete() {
          stopGeneration()
          router.push(`/projects/${projectId}/session/${sessionId}/shotlist`)
        },
        onError(msg) {
          stopGeneration()
          setErrorMsg(msg)
          setView('editor')
        },
      }
    )
  }, [
    connect,
    projectId,
    sessionId,
    startGeneration,
    stopGeneration,
    updateProgress,
    router,
  ])

  function handleCancelGeneration() {
    disconnect()
    stopGeneration()
    setView('editor')
  }

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: project?.name ?? '…', href: `/projects/${projectId}` },
    { label: 'Script' },
  ]

  if (sessionLoading || scriptLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-screen-xl mx-auto w-full">
      <Breadcrumbs items={breadcrumbs} />

      <StepIndicator currentStep={3} />

      {/* ── Action bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/projects/${projectId}`)}
          className="gap-2 text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Button>

        {view === 'editor' && (
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
              onClick={handleGenerateShotlist}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5"
            >
              Generate Shotlist!
            </Button>
          </div>
        )}
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {view === 'generating' ? (
        <GenerationProgress
          percent={generationPercent}
          message={generationMessage}
          stage={generationStage}
          isConnected={isConnected}
          onCancel={handleCancelGeneration}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ScriptEditor
            sessionId={sessionId}
            initialContent={script?.content ?? ''}
            onContentChange={handleContentChange}
          />
          <ScriptAIEditPanel
            onSubmit={handleAIEdit}
            isLoading={isAIEditing}
          />
        </div>
      )}
    </div>
  )
}
