'use client'

import { motion } from 'framer-motion'
import { Download, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ImageCard } from '@/components/generation/ImageCard'
import type { GeneratedImage, ShotlistRow } from '@/types/database'

interface ImageGalleryProps {
  sessionId: string
  images: (GeneratedImage & { imageUrl?: string })[]
  shotlistRows: ShotlistRow[]
  onRegenerateImage: (imageId: string, prompt?: string) => Promise<void>
  onDownloadAll: () => void
  onSaveAll: () => void
  isSavingAll?: boolean
}

export default function ImageGallery({
  images,
  shotlistRows,
  onRegenerateImage,
  onDownloadAll,
  onSaveAll,
  isSavingAll,
}: ImageGalleryProps) {
  const complete = images.filter((img) => img.status === 'complete').length
  const total = images.length
  const percent = total > 0 ? Math.round((complete / total) * 100) : 0

  const rowMap = Object.fromEntries(shotlistRows.map((r) => [r.id, r]))

  const handleDownloadImage = async (img: GeneratedImage & { imageUrl?: string }) => {
    if (!img.imageUrl) return
    try {
      const res = await fetch(img.imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const row = rowMap[img.shotlist_row_id]
      a.download = `scene${row?.scene_number ?? 'X'}_shot${row?.shot_number ?? 'X'}.jpg`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silent fail
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top stats bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-5 py-3">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Images generated</span>
            <span className="text-white font-medium">{complete} / {total}</span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadAll}
            disabled={complete === 0}
            className="gap-2 border-white/20 text-white/70 hover:text-white hover:bg-white/5"
          >
            <Download className="h-4 w-4" />
            Download ZIP
          </Button>
          <Button
            size="sm"
            onClick={onSaveAll}
            disabled={isSavingAll || complete === 0}
            className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          >
            <Save className="h-4 w-4" />
            {isSavingAll ? 'Saving…' : 'Save All'}
          </Button>
        </div>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((img, idx) => {
          const row = rowMap[img.shotlist_row_id]
          return (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <ImageCard
                image={img}
                sceneNumber={row?.scene_number ?? `${idx + 1}`}
                shotNumber={row?.shot_number ?? `${idx + 1}A`}
                onRegenerate={(prompt?: string) => onRegenerateImage(img.id, prompt)}
                onDownload={() => handleDownloadImage(img)}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
