/* ─────────────────────────────────────────────────────────────────────────────
 * Generation workflow types — extends core database types with draft/in-flight
 * shapes used during the multi-stage AI generation pipeline.
 * ───────────────────────────────────────────────────────────────────────────── */

import type { ShotlistRow } from './database'
import type { SSEEvent } from './api'

/* ─── Shotlist Draft ─────────────────────────────────────────────────────── */

/**
 * A shotlist row that may not yet have a persisted identity.
 * Used while streaming the LLM response before rows are saved to Supabase.
 */
export type ShotlistRowDraft = Omit<
  ShotlistRow,
  'id' | 'user_id' | 'created_at' | 'updated_at'
> & {
  /** Undefined until the row is saved to the database. */
  id?: string
}

/* ─── Generation Pipeline Stages ────────────────────────────────────────── */

/**
 * All discrete stages in the end-to-end storyboard generation pipeline,
 * in execution order.
 */
export type GenerationStage =
  | 'idle'
  | 'uploading'
  | 'extracting_text'
  | 'generating_script'
  | 'parsing_script'
  | 'generating_shotlist'
  | 'parsing_shotlist'
  | 'generating_images'
  | 'uploading_images'
  | 'finalizing'
  | 'complete'
  | 'error'

/**
 * Human-readable label for each pipeline stage — used in progress UIs.
 */
export const GENERATION_STAGE_LABELS: Record<GenerationStage, string> = {
  idle: 'Idle',
  uploading: 'Uploading files…',
  extracting_text: 'Extracting text…',
  generating_script: 'Generating script…',
  parsing_script: 'Parsing script…',
  generating_shotlist: 'Generating shot list…',
  parsing_shotlist: 'Parsing shot list…',
  generating_images: 'Generating images…',
  uploading_images: 'Uploading images…',
  finalizing: 'Finalizing…',
  complete: 'Complete',
  error: 'Error',
}

/**
 * Approximate progress percentage for each stage (used when the server does
 * not provide a precise `percent` value in the SSE stream).
 */
export const GENERATION_STAGE_PERCENT: Record<GenerationStage, number> = {
  idle: 0,
  uploading: 5,
  extracting_text: 10,
  generating_script: 25,
  parsing_script: 35,
  generating_shotlist: 50,
  parsing_shotlist: 60,
  generating_images: 80,
  uploading_images: 90,
  finalizing: 95,
  complete: 100,
  error: 0,
}

/* ─── SSE Event Subtypes ─────────────────────────────────────────────────── */

/**
 * Payload for a `progress` SSE event.
 */
export interface SSEProgressData {
  step: number
  totalSteps: number
  /** Current stage of the pipeline. */
  stage: GenerationStage
}

/**
 * Progress event — emitted at each meaningful pipeline checkpoint.
 */
export interface SSEProgressEvent extends SSEEvent<SSEProgressData> {
  type: 'progress'
  stage: GenerationStage
}

/**
 * Payload for the script-complete event.
 */
export interface SSEScriptCompleteData {
  session_id: string
  script_id: string
  /** Truncated preview of the generated script (first ~500 chars). */
  preview: string
}

/**
 * Payload for the shotlist-complete event.
 */
export interface SSEShotlistCompleteData {
  session_id: string
  row_count: number
}

/**
 * Payload for the images-complete event.
 */
export interface SSEImagesCompleteData {
  session_id: string
  generated_count: number
  failed_count: number
}

/**
 * Completion event — emitted once when the full pipeline finishes.
 */
export interface SSECompleteEvent<
  T =
    | SSEScriptCompleteData
    | SSEShotlistCompleteData
    | SSEImagesCompleteData
    | Record<string, unknown>,
> extends SSEEvent<T> {
  type: 'complete'
  stage: GenerationStage
}

/**
 * Error event — emitted if a stage fails unrecoverably.
 */
export interface SSEErrorEvent
  extends SSEEvent<{ code?: string; retryable?: boolean }> {
  type: 'error'
  stage: GenerationStage
}

/* ─── Client-side Generation State ──────────────────────────────────────── */

/**
 * Snapshot of the generation pipeline as tracked on the client.
 * Managed by the generation Zustand store or a React context.
 */
export interface GenerationState {
  sessionId: string | null
  stage: GenerationStage
  percent: number
  message: string
  isRunning: boolean
  hasError: boolean
  errorMessage: string | null
  /** ISO timestamp when generation started (null if not started). */
  startedAt: string | null
  /** ISO timestamp when generation finished (null if still running). */
  completedAt: string | null
}

/**
 * Initial / reset value for `GenerationState`.
 */
export const INITIAL_GENERATION_STATE: GenerationState = {
  sessionId: null,
  stage: 'idle',
  percent: 0,
  message: '',
  isRunning: false,
  hasError: false,
  errorMessage: null,
  startedAt: null,
  completedAt: null,
}

/* ─── Image Generation Job ───────────────────────────────────────────────── */

/**
 * In-memory representation of a single image generation job
 * while the client polls or receives updates via SSE.
 */
export interface ImageGenerationJob {
  shotlistRowId: string
  /** Prompt sent to the provider. */
  prompt: string
  /** External job ID returned by the provider (null until the job is submitted). */
  providerJobId: string | null
  status: 'queued' | 'submitted' | 'complete' | 'error'
  /** Public URL of the generated image (null until complete). */
  imageUrl: string | null
  errorMessage: string | null
  /** Number of times this job has been attempted. */
  attempts: number
}
