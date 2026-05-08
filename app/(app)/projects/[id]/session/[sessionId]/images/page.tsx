'use client'

import { useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { StepIndicator } from '@/components/generation/StepIndicator'
import ImageGallery from '@/components/generation/ImageGallery'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useProject } from '@/hooks/useProjects'
import { useSession } from '@/hooks/useSession'
import { useImages } from '@/hooks/useImages'
import { useShotlist } from '@/hooks/useShotlist'

export default function ImagesPage() {
  const { id: projectId, sessionId } = useParams<{ id: string; sessionId: string }>()
  const router = useRouter()

  const { data: project } = useProject(projectId)
  const { data: session, isLoading: sessionLoading } = useSession(sessionId)
  const { images, isLoading: imagesLoading } = useImages(sessionId)
  const { data: shotlistRows } = useShotlist(sessionId)

  // Guard
  useEffect(() => {
    if (!session) return
    if (
      session.status === 'draft' ||
      session.status === 'script_ready' ||
      session.status === 'shotlist_ready'
    ) {
      router.replace(`/projects/${projectId}/session/${sessionId}/shotlist`)
    }
  }, [session, projectId, sessionId, router])

  const handleRegenerate = useCallback(
    async (imageId: string, prompt?: string) => {
      await fetch(`/api/images/${imageId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
    },
    []
  )

  const handleDownloadAll = useCallback(async () => {
    const res = await fetch('/api/export/images-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `images-${sessionId}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }, [sessionId])

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: project?.name ?? '…', href: `/projects/${projectId}` },
    { label: 'Images' },
  ]

  if (sessionLoading || imagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-screen-2xl mx-auto w-full">
      <Breadcrumbs items={breadcrumbs} />

      <StepIndicator currentStep={6} />

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/projects/${projectId}/session/${sessionId}/shotlist`)}
          className="gap-2 text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shotlist
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadAll}
          className="gap-2 border-white/20 text-white/70 hover:text-white hover:bg-white/5"
        >
          <Download className="h-4 w-4" />
          Download All (ZIP)
        </Button>
      </div>

      <ImageGallery
        sessionId={sessionId}
        images={images}
        shotlistRows={shotlistRows ?? []}
        onRegenerateImage={handleRegenerate}
        onDownloadAll={handleDownloadAll}
        onSaveAll={() => {}}
      />
    </div>
  )
}
