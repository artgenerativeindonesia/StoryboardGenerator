'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  RefreshCw,
  Download,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react'
import type { GeneratedImage } from '@/types/database'

interface ImageCardProps {
  image: GeneratedImage & { imageUrl?: string }
  shotNumber: string
  sceneNumber: string
  onRegenerate: (prompt?: string) => Promise<void>
  onDownload: () => void
}

export function ImageCard({
  image,
  shotNumber,
  sceneNumber,
  onRegenerate,
  onDownload,
}: ImageCardProps) {
  const [promptDraft, setPromptDraft] = useState(image.image_prompt)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptDraft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }, [promptDraft])

  const handleRegenerate = useCallback(async () => {
    if (isRegenerating) return
    setIsRegenerating(true)
    try {
      await onRegenerate(promptDraft !== image.image_prompt ? promptDraft : undefined)
    } finally {
      setIsRegenerating(false)
    }
  }, [isRegenerating, onRegenerate, promptDraft, image.image_prompt])

  const isGenerating = image.status === 'generating' || isRegenerating
  const isPending = image.status === 'pending'
  const isComplete = image.status === 'complete' && image.imageUrl
  const isError = image.status === 'error'

  return (
    <motion.div
      layout
      className={`
        flex flex-col rounded-xl overflow-hidden border bg-[#1A1A1A]
        ${isError ? 'border-red-500/40' : 'border-[#2A2A2A]'}
      `}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#111111] border-b border-[#1F1F1F]">
        <span className="text-xs font-semibold text-accent">Shot {shotNumber}</span>
        <span className="text-xs text-muted-foreground">Scene {sceneNumber}</span>
      </div>

      {/* Image area */}
      <div className="relative bg-[#111111] aspect-video flex items-center justify-center overflow-hidden">
        {isComplete ? (
          <Image
            src={image.imageUrl!}
            alt={`Shot ${shotNumber} scene ${sceneNumber}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          /* Skeleton */
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#111111] animate-pulse" />
        )}

        {/* Status overlays */}
        {isPending && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
            <Clock className="w-6 h-6 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground/60">In queue...</span>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <span className="text-xs text-muted-foreground/80">Generating...</span>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 px-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-red-400 text-center line-clamp-2">
              {image.error_message ?? 'Generation failed'}
            </span>
          </div>
        )}

        {/* Thin progress bar at bottom when generating */}
        {isGenerating && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-accent rounded-full"
            initial={{ width: '10%' }}
            animate={{ width: '85%' }}
            transition={{ duration: 8, ease: 'easeOut' }}
          />
        )}
      </div>

      {/* Prompt section */}
      <div className="px-3 py-2 border-t border-[#1F1F1F] flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mt-0.5 shrink-0">
            Prompt
          </span>
          <button
            type="button"
            onClick={handleCopyPrompt}
            title="Copy prompt"
            className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
        <textarea
          value={promptDraft}
          onChange={(e) => setPromptDraft(e.target.value)}
          rows={3}
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-2 py-1.5
                     text-xs text-foreground placeholder:text-muted-foreground/50
                     resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50
                     transition-colors leading-relaxed"
          placeholder="Image prompt..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-[#1F1F1F]">
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isGenerating}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-1 justify-center
            transition-all duration-150
            ${
              isError
                ? 'bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20'
                : isGenerating
                  ? 'bg-[#1A1A1A] text-muted-foreground cursor-not-allowed border border-[#2A2A2A]'
                  : 'bg-[#1A1A1A] hover:bg-[#222222] text-foreground border border-[#2A2A2A] hover:border-accent/40'
            }
          `}
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
        </button>

        <button
          type="button"
          onClick={onDownload}
          disabled={!isComplete}
          title="Download image"
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-150 border
            ${
              isComplete
                ? 'bg-[#1A1A1A] hover:bg-[#222222] text-foreground border-[#2A2A2A] hover:border-accent/40'
                : 'bg-[#111111] text-muted-foreground/30 border-[#1F1F1F] cursor-not-allowed'
            }
          `}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      </div>
    </motion.div>
  )
}
