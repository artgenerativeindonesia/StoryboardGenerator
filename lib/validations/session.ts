import { z } from 'zod'

// ---------------------------------------------------------------------------
// Session name / instructions helpers
// ---------------------------------------------------------------------------

const sessionNameSchema = z
  .string()
  .min(1, 'Session name is required')
  .max(150, 'Session name must be 150 characters or fewer')

const instructionsSchema = z
  .string()
  .max(2_000, 'Instructions must be 2 000 characters or fewer')
  .optional()

const fileIdsSchema = z
  .array(z.string().uuid('Each file ID must be a valid UUID'))
  .min(1, 'At least one file must be selected')

// ---------------------------------------------------------------------------
// Create session
// ---------------------------------------------------------------------------

export const createSessionSchema = z.object({
  project_id: z.string().uuid('project_id must be a valid UUID'),
  name: sessionNameSchema,
  instructions: instructionsSchema,
  selected_file_ids: fileIdsSchema,
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>

// ---------------------------------------------------------------------------
// Update session
// ---------------------------------------------------------------------------

export const sessionStatusSchema = z.enum([
  'draft',
  'generating_script',
  'script_ready',
  'generating_shotlist',
  'shotlist_ready',
  'generating_images',
  'complete',
  'error',
])

export const updateSessionSchema = z.object({
  name: sessionNameSchema.optional(),
  instructions: instructionsSchema,
  selected_file_ids: fileIdsSchema.optional(),
  status: sessionStatusSchema.optional(),
  error_message: z.string().nullable().optional(),
})

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>

// ---------------------------------------------------------------------------
// Generate script request
// ---------------------------------------------------------------------------

export const generateScriptSchema = z.object({
  session_id: z.string().uuid('session_id must be a valid UUID'),
})

export type GenerateScriptInput = z.infer<typeof generateScriptSchema>

// ---------------------------------------------------------------------------
// Generate shotlist request
// ---------------------------------------------------------------------------

export const generateShotlistSchema = z.object({
  session_id: z.string().uuid('session_id must be a valid UUID'),
})

export type GenerateShotlistInput = z.infer<typeof generateShotlistSchema>

// ---------------------------------------------------------------------------
// Generate images request
// ---------------------------------------------------------------------------

export const generateImagesSchema = z.object({
  session_id: z.string().uuid('session_id must be a valid UUID'),
  /** When provided, only re-generates the specified shotlist row. */
  shotlist_row_id: z.string().uuid().optional(),
})

export type GenerateImagesInput = z.infer<typeof generateImagesSchema>
