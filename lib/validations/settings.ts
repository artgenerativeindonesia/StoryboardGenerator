import { z } from 'zod'

// ---------------------------------------------------------------------------
// Helper — optional string that coerces empty string → null
// ---------------------------------------------------------------------------

/**
 * An optional string field where the empty string is treated as null
 * (common pattern in settings forms where clearing a field should unset it).
 */
const optionalStringField = z
  .string()
  .optional()
  .transform((v) => (v === '' || v === undefined ? null : v))

// ---------------------------------------------------------------------------
// Image providers
// ---------------------------------------------------------------------------

export const imageProviderSchema = z.enum(['higgsfield', 'kieai', 'wavespeed'])

// ---------------------------------------------------------------------------
// Settings form schema
// ---------------------------------------------------------------------------

export const settingsSchema = z.object({
  // ── OpenRouter ────────────────────────────────────────────────────────
  openrouter_api_key: optionalStringField,
  openrouter_model: z
    .string()
    .min(1, 'An OpenRouter model must be selected')
    .optional(),

  // ── Image provider selection ─────────────────────────────────────────
  image_provider: imageProviderSchema.optional(),

  // ── Higgsfield ───────────────────────────────────────────────────────
  higgsfield_api_key: optionalStringField,
  higgsfield_model: optionalStringField,
  use_higgsfield_mcp: z.boolean().optional(),

  // ── KIE.AI ───────────────────────────────────────────────────────────
  kieai_api_key: optionalStringField,
  kieai_model: optionalStringField,

  // ── Wavespeed ────────────────────────────────────────────────────────
  wavespeed_api_key: optionalStringField,
  wavespeed_model: optionalStringField,

  // ── UI preferences ───────────────────────────────────────────────────
  ui_projects_view: z.enum(['grid', 'list']).optional(),
})

export type SettingsInput = z.infer<typeof settingsSchema>

// ---------------------------------------------------------------------------
// Narrower schema used for the settings form (raw string values before
// transformation so react-hook-form can work with string fields).
// ---------------------------------------------------------------------------

export const settingsFormSchema = z.object({
  openrouter_api_key: z.string().optional().default(''),
  openrouter_model: z.string().optional().default(''),
  image_provider: imageProviderSchema.optional(),
  higgsfield_api_key: z.string().optional().default(''),
  higgsfield_model: z.string().optional().default(''),
  use_higgsfield_mcp: z.boolean().optional().default(false),
  kieai_api_key: z.string().optional().default(''),
  kieai_model: z.string().optional().default(''),
  wavespeed_api_key: z.string().optional().default(''),
  wavespeed_model: z.string().optional().default(''),
  ui_projects_view: z.enum(['grid', 'list']).optional().default('grid'),
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>
