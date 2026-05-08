/* ─────────────────────────────────────────────────────────────────────────────
 * API types — request bodies, response envelopes, and SSE event shapes used
 * across Next.js route handlers and client-side data hooks.
 * ───────────────────────────────────────────────────────────────────────────── */

import type {
  ImageProvider,
  SessionStatus,
  ShotAngle,
  ShotType,
  ViewLevel,
  LensProperty,
} from './database'

/* ─── Generic Response Envelope ─────────────────────────────────────────── */

/**
 * Standard wrapper returned by every JSON route handler.
 * Exactly one of `data` or `error` will be non-null.
 */
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
}

/**
 * Paginated list response.
 */
export interface ApiListResponse<T = unknown> {
  data: T[]
  error: string | null
  total: number
  page: number
  pageSize: number
}

/* ─── Projects ───────────────────────────────────────────────────────────── */

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  is_archived?: boolean
}

/* ─── Project Files ──────────────────────────────────────────────────────── */

export interface UploadFileResponse {
  id: string
  name: string
  original_name: string
  size_bytes: number
  mime_type: string
  storage_path: string
  created_at: string
}

export interface DeleteFileRequest {
  file_id: string
}

/* ─── Generation Sessions ────────────────────────────────────────────────── */

export interface CreateSessionRequest {
  project_id: string
  name: string
  instructions?: string
  selected_file_ids: string[]
}

export interface UpdateSessionRequest {
  name?: string
  instructions?: string
  selected_file_ids?: string[]
  status?: SessionStatus
  error_message?: string | null
}

/* ─── Script Generation ──────────────────────────────────────────────────── */

export interface GenerateScriptRequest {
  session_id: string
}

export interface UpdateScriptRequest {
  content: string
}

/* ─── Shotlist Generation ────────────────────────────────────────────────── */

export interface GenerateShotlistRequest {
  session_id: string
}

export interface UpdateShotlistRowRequest {
  scene_number?: string
  shot_number?: string
  composition?: string | null
  shot_type?: ShotType | null
  shot_angle?: ShotAngle | null
  view_level?: ViewLevel | null
  lens_properties?: LensProperty | null
  style?: string | null
  mood?: string | null
  scene_description?: string | null
  image_prompt?: string | null
  row_order?: number
}

export interface ReorderShotlistRequest {
  /** Ordered array of shotlist row IDs reflecting the new display order. */
  ordered_ids: string[]
}

/* ─── Image Generation ───────────────────────────────────────────────────── */

export interface GenerateImagesRequest {
  session_id: string
  /** When provided, only regenerates this specific row. */
  shotlist_row_id?: string
}

export interface RegenerateImageRequest {
  shotlist_row_id: string
  /** Override the stored prompt for this regeneration only. */
  image_prompt?: string
}

/* ─── Settings ───────────────────────────────────────────────────────────── */

export interface UpdateSettingsRequest {
  openrouter_api_key?: string | null
  openrouter_model?: string
  image_provider?: ImageProvider
  higgsfield_api_key?: string | null
  higgsfield_model?: string | null
  kieai_api_key?: string | null
  kieai_model?: string | null
  wavespeed_api_key?: string | null
  wavespeed_model?: string | null
  use_higgsfield_mcp?: boolean
  ui_projects_view?: 'grid' | 'list'
}

/* ─── SSE Events ─────────────────────────────────────────────────────────── */

/**
 * All event types emitted over a Server-Sent Events stream during generation.
 */
export type SSEEventType =
  | 'progress'
  | 'complete'
  | 'error'
  | 'heartbeat'

/**
 * Generic SSE event shape. Specific subtypes narrow `data`.
 */
export interface SSEEvent<T = unknown> {
  /** Discriminant for the event kind. */
  type: SSEEventType
  /** Current pipeline stage label. */
  stage: string
  /** Overall completion percentage (0–100). */
  percent: number
  /** Human-readable status message. */
  message: string
  /** Arbitrary payload; shape depends on `type` and `stage`. */
  data?: T
}

/**
 * Progress event — emitted at each meaningful pipeline step.
 */
export interface SSEProgressEvent extends SSEEvent<{ step: number; totalSteps: number }> {
  type: 'progress'
}

/**
 * Completion event — emitted once after the entire pipeline finishes.
 */
export interface SSECompleteEvent<T = unknown> extends SSEEvent<T> {
  type: 'complete'
}

/**
 * Error event — emitted if the pipeline cannot continue.
 */
export interface SSEErrorEvent extends SSEEvent<{ code?: string }> {
  type: 'error'
  percent: number
}

/**
 * Heartbeat event — keeps the HTTP connection alive during long pauses.
 */
export interface SSEHeartbeatEvent extends SSEEvent<never> {
  type: 'heartbeat'
}

/* ─── OpenRouter API ─────────────────────────────────────────────────────── */

export interface OpenRouterModelPricing {
  /** Cost in USD per 1 000 prompt tokens. */
  prompt: string
  /** Cost in USD per 1 000 completion tokens. */
  completion: string
}

export interface OpenRouterModelListResponse {
  data: Array<{
    id: string
    name: string
    context_length: number
    pricing: OpenRouterModelPricing
    description?: string
    architecture?: {
      modality: string
      tokenizer: string
    }
  }>
}
