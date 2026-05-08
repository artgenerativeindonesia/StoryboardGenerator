'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, Loader2, Send } from 'lucide-react'

interface ScriptAIEditPanelProps {
  onSubmit: (instruction: string) => Promise<void>
  isLoading?: boolean
}

export function ScriptAIEditPanel({ onSubmit, isLoading = false }: ScriptAIEditPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [instruction, setInstruction] = useState('')

  const handleSubmit = async () => {
    const trimmed = instruction.trim()
    if (!trimmed || isLoading) return
    await onSubmit(trimmed)
    setInstruction('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] overflow-hidden">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-[#1A1A1A] transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">Edit with AI</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-[#1F1F1F]">
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you'd like to change..."
                rows={3}
                disabled={isLoading}
                className={`
                  w-full rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2.5
                  text-sm text-foreground placeholder:text-muted-foreground/60
                  resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50
                  transition-colors duration-150 leading-relaxed
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground/50">Ctrl+Enter to submit</p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!instruction.trim() || isLoading}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${
                      !instruction.trim() || isLoading
                        ? 'bg-[#1A1A1A] text-muted-foreground cursor-not-allowed border border-[#2A2A2A]'
                        : 'bg-accent hover:bg-accent/90 text-white cursor-pointer shadow-md shadow-accent/20'
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Edit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
