'use client'

import { motion } from 'framer-motion'
import { Play, FileText, CheckSquare, Square, UploadCloud } from 'lucide-react'
import type { ProjectFile } from '@/types/database'

interface InstructionFormProps {
  projectId: string
  files: ProjectFile[]
  selectedFileIds: string[]
  instructions: string
  onFileSelect: (ids: string[]) => void
  onInstructionsChange: (text: string) => void
  onGenerate: () => void
  isLoading?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function InstructionForm({
  projectId: _projectId,
  files,
  selectedFileIds,
  instructions,
  onFileSelect,
  onInstructionsChange,
  onGenerate,
  isLoading = false,
}: InstructionFormProps) {
  const toggleFile = (id: string) => {
    if (selectedFileIds.includes(id)) {
      onFileSelect(selectedFileIds.filter((f) => f !== id))
    } else {
      onFileSelect([...selectedFileIds, id])
    }
  }

  const toggleAll = () => {
    if (selectedFileIds.length === files.length) {
      onFileSelect([])
    } else {
      onFileSelect(files.map((f) => f.id))
    }
  }

  const canGenerate = selectedFileIds.length > 0 && !isLoading

  if (files.length === 0) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center py-20 gap-4 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
          <UploadCloud className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-foreground font-semibold text-lg">No files available</p>
          <p className="text-muted-foreground text-sm mt-1">
            Upload PDF files to this project first, then return here to generate a script.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 max-w-2xl mx-auto w-full"
    >
      {/* Section 1 — File Selection */}
      <motion.section variants={itemVariants} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Select Files
          </h2>
          {files.length > 1 && (
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >
              {selectedFileIds.length === files.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {files.map((file) => {
            const selected = selectedFileIds.includes(file.id)
            return (
              <motion.button
                key={file.id}
                type="button"
                onClick={() => toggleFile(file.id)}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className={`
                  flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left
                  transition-colors duration-150 cursor-pointer
                  ${
                    selected
                      ? 'bg-accent/10 border-accent/40 ring-1 ring-accent/20'
                      : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#202020]'
                  }
                `}
              >
                <div className="flex-none text-accent">
                  {selected ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <FileText className="flex-none w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.original_name}</p>
                </div>
                <span className="flex-none text-xs text-muted-foreground">
                  {formatBytes(file.size_bytes)}
                </span>
              </motion.button>
            )
          })}
        </div>

        {selectedFileIds.length > 0 && (
          <p className="text-xs text-muted-foreground pl-1">
            {selectedFileIds.length} of {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </motion.section>

      {/* Section 2 — Instructions */}
      <motion.section variants={itemVariants} className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-0.5">
            Instructions
            <span className="ml-2 text-xs font-normal text-muted-foreground normal-case tracking-normal">
              (optional)
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Leave blank to use the default Hollywood screenwriter framework
          </p>
        </div>

        <textarea
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="Describe any specific requirements, tone, style, or focus areas..."
          rows={5}
          className={`
            w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3
            text-sm text-foreground placeholder:text-muted-foreground/60
            resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50
            transition-colors duration-150 leading-relaxed
          `}
        />
      </motion.section>

      {/* Generate Button */}
      <motion.div variants={itemVariants}>
        <motion.button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          whileHover={canGenerate ? { scale: 1.01 } : {}}
          whileTap={canGenerate ? { scale: 0.98 } : {}}
          className={`
            w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
            text-base font-semibold transition-all duration-200
            ${
              canGenerate
                ? 'bg-accent hover:bg-accent/90 text-white cursor-pointer shadow-lg shadow-accent/20'
                : 'bg-[#1A1A1A] border border-[#2A2A2A] text-muted-foreground cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Starting generation...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Generate Script!</span>
            </>
          )}
        </motion.button>

        {!canGenerate && !isLoading && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Select at least one file to continue
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
