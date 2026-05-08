'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GenerationState {
  // Step 1 state (persisted)
  selectedFileIds: string[]
  instructions: string
  sessionId: string | null

  // Live generation progress (NOT persisted)
  isGenerating: boolean
  generationStage: string
  generationPercent: number
  generationMessage: string

  // Script (persisted)
  scriptContent: string
  scriptId: string | null
  scriptDirty: boolean

  // Shotlist dirty flag (NOT fully persisted due to size)
  shotlistDirty: boolean

  // Actions
  setSelectedFiles: (ids: string[]) => void
  setInstructions: (text: string) => void
  setSessionId: (id: string | null) => void
  startGeneration: (stage?: string) => void
  updateProgress: (percent: number, message: string, stage?: string) => void
  stopGeneration: () => void
  setScriptContent: (content: string, id?: string) => void
  markScriptDirty: (dirty: boolean) => void
  markShotlistDirty: (dirty: boolean) => void
  resetSession: () => void
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set) => ({
      // ── Persisted defaults ──────────────────────────────────────────────
      selectedFileIds: [],
      instructions: '',
      sessionId: null,

      // ── Non-persisted live progress state ──────────────────────────────
      isGenerating: false,
      generationStage: '',
      generationPercent: 0,
      generationMessage: '',

      // ── Script (persisted) ──────────────────────────────────────────────
      scriptContent: '',
      scriptId: null,
      scriptDirty: false,

      // ── Shotlist dirty flag ─────────────────────────────────────────────
      shotlistDirty: false,

      // ── Actions ─────────────────────────────────────────────────────────

      setSelectedFiles: (ids) => set({ selectedFileIds: ids }),

      setInstructions: (text) => set({ instructions: text }),

      setSessionId: (id) => set({ sessionId: id }),

      startGeneration: (stage = 'initializing') =>
        set({
          isGenerating: true,
          generationStage: stage,
          generationPercent: 0,
          generationMessage: '',
        }),

      updateProgress: (percent, message, stage) =>
        set((state) => ({
          generationPercent: percent,
          generationMessage: message,
          generationStage: stage !== undefined ? stage : state.generationStage,
        })),

      stopGeneration: () =>
        set({
          isGenerating: false,
          generationStage: '',
          generationPercent: 0,
          generationMessage: '',
        }),

      setScriptContent: (content, id) =>
        set((state) => ({
          scriptContent: content,
          scriptId: id !== undefined ? id : state.scriptId,
        })),

      markScriptDirty: (dirty) => set({ scriptDirty: dirty }),

      markShotlistDirty: (dirty) => set({ shotlistDirty: dirty }),

      resetSession: () =>
        set({
          selectedFileIds: [],
          instructions: '',
          sessionId: null,
          isGenerating: false,
          generationStage: '',
          generationPercent: 0,
          generationMessage: '',
          scriptContent: '',
          scriptId: null,
          scriptDirty: false,
          shotlistDirty: false,
        }),
    }),
    {
      name: 'sbg-generation',
      // Only persist the fields that are safe / small enough for localStorage
      partialize: (state) => ({
        selectedFileIds: state.selectedFileIds,
        instructions: state.instructions,
        sessionId: state.sessionId,
        scriptContent: state.scriptContent,
        scriptId: state.scriptId,
      }),
    }
  )
)
