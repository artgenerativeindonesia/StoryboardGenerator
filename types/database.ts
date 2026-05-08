/* ─────────────────────────────────────────────────────────────────────────────
 * Database types — mirrors every Supabase table used by StoryboardGenerator.
 * Keep in sync with the database schema (migrations/schema.sql).
 * ───────────────────────────────────────────────────────────────────────────── */

/* ─── Project ────────────────────────────────────────────────────────────── */

export type ProjectStatus = 'active' | 'archived'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

/* ─── Project File ───────────────────────────────────────────────────────── */

export interface ProjectFile {
  id: string
  project_id: string
  user_id: string
  /** Display name (may differ from the original uploaded name). */
  name: string
  /** Original file name as uploaded by the user. */
  original_name: string
  size_bytes: number
  mime_type: string
  /** Path in the Supabase Storage bucket. */
  storage_path: string
  created_at: string
}

/* ─── Generation Session ─────────────────────────────────────────────────── */

export type SessionStatus =
  | 'draft'
  | 'generating_script'
  | 'script_ready'
  | 'generating_shotlist'
  | 'shotlist_ready'
  | 'generating_images'
  | 'complete'
  | 'error'

export interface GenerationSession {
  id: string
  project_id: string
  user_id: string
  name: string
  status: SessionStatus
  /** Optional free-text instructions that guide the LLM. */
  instructions: string | null
  /** IDs of ProjectFile rows selected for this session. */
  selected_file_ids: string[]
  error_message: string | null
  created_at: string
  updated_at: string
}

/* ─── Script ─────────────────────────────────────────────────────────────── */

export interface Script {
  id: string
  session_id: string
  user_id: string
  /** Raw markdown / plain-text content from the LLM. */
  content: string
  /** Server-rendered HTML version (may be null if not yet converted). */
  content_html: string | null
  /** OpenRouter model identifier used for generation. */
  llm_model: string | null
  created_at: string
  updated_at: string
}

/* ─── Shot Types & Enumerations ──────────────────────────────────────────── */

/** Standard cinematographic shot sizes. */
export type ShotType =
  | 'ECU'   // Extreme Close-Up
  | 'CU'    // Close-Up
  | 'MCU'   // Medium Close-Up
  | 'MS'    // Medium Shot
  | 'MWS'   // Medium Wide Shot
  | 'WS'    // Wide Shot
  | 'EWS'   // Extreme Wide Shot

/** Camera angle relative to the subject. */
export type ShotAngle =
  | 'Eye level'
  | 'Low angle'
  | 'High angle'
  | 'Dutch tilt'
  | "Bird's eye"
  | "Worm's eye"

/** Camera elevation / perspective layer. */
export type ViewLevel =
  | 'Ground'
  | 'Eye level'
  | 'Elevated'
  | 'Aerial'

/** Lens focal length used for the shot. */
export type LensProperty =
  | '14mm'
  | '24mm'
  | '35mm'
  | '50mm'
  | '85mm'
  | '135mm'

/** Supported image-generation provider back-ends. */
export type ImageProvider = 'higgsfield' | 'kieai' | 'wavespeed'

/** Lifecycle status for a single generated image. */
export type ImageStatus = 'pending' | 'generating' | 'complete' | 'error'

/* ─── Shotlist Row ───────────────────────────────────────────────────────── */

export interface ShotlistRow {
  id: string
  session_id: string
  user_id: string
  /** Scene identifier (e.g. "1", "2A"). */
  scene_number: string
  /** Shot identifier within the scene (e.g. "1", "2"). */
  shot_number: string
  /** Short compositional description (framing notes). */
  composition: string | null
  shot_type: ShotType | null
  shot_angle: ShotAngle | null
  view_level: ViewLevel | null
  lens_properties: LensProperty | null
  /** Visual style keywords (e.g. "cinematic", "noir"). */
  style: string | null
  /** Emotional mood of the shot. */
  mood: string | null
  /** Narrative description of what happens in the scene. */
  scene_description: string | null
  /** Prompt sent to the image-generation model. */
  image_prompt: string | null
  /** 0-based display order within the session. */
  row_order: number
  created_at: string
  updated_at: string
}

/* ─── Generated Image ────────────────────────────────────────────────────── */

export interface GeneratedImage {
  id: string
  session_id: string
  shotlist_row_id: string
  user_id: string
  status: ImageStatus
  /** The exact prompt that was sent to the provider. */
  image_prompt: string
  /** Path in Supabase Storage (null while generating or on error). */
  storage_path: string | null
  provider: string | null
  /** Job / request ID returned by the external provider API. */
  provider_job_id: string | null
  error_message: string | null
  /** Iteration counter — incremented each time the image is regenerated. */
  generation: number
  created_at: string
  updated_at: string
}

/* ─── User Settings ──────────────────────────────────────────────────────── */

export interface UserSettings {
  id: string
  user_id: string
  openrouter_api_key: string | null
  openrouter_model: string
  image_provider: ImageProvider
  higgsfield_api_key: string | null
  higgsfield_model: string | null
  kieai_api_key: string | null
  kieai_model: string | null
  wavespeed_api_key: string | null
  wavespeed_model: string | null
  /** When true, Higgsfield images are generated via the MCP server. */
  use_higgsfield_mcp: boolean
  ui_projects_view: 'grid' | 'list'
  created_at: string
  updated_at: string
}
