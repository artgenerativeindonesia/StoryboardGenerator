import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enum schemas — mirrors types/database.ts
// ---------------------------------------------------------------------------

export const shotTypeSchema = z.enum([
  'ECU',  // Extreme Close-Up
  'CU',   // Close-Up
  'MCU',  // Medium Close-Up
  'MS',   // Medium Shot
  'MWS',  // Medium Wide Shot
  'WS',   // Wide Shot
  'EWS',  // Extreme Wide Shot
])

export const shotAngleSchema = z.enum([
  'Eye level',
  'Low angle',
  'High angle',
  'Dutch tilt',
  "Bird's eye",
  "Worm's eye",
])

export const viewLevelSchema = z.enum([
  'Ground',
  'Eye level',
  'Elevated',
  'Aerial',
])

export const lensPropertySchema = z.enum([
  '14mm',
  '24mm',
  '35mm',
  '50mm',
  '85mm',
  '135mm',
])

// ---------------------------------------------------------------------------
// Full ShotlistRow schema
// ---------------------------------------------------------------------------

export const shotlistRowSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  user_id: z.string().uuid(),
  scene_number: z
    .string()
    .min(1, 'Scene number is required')
    .max(20, 'Scene number too long'),
  shot_number: z
    .string()
    .min(1, 'Shot number is required')
    .max(20, 'Shot number too long'),
  composition: z.string().max(500).nullable().optional(),
  shot_type: shotTypeSchema.nullable().optional(),
  shot_angle: shotAngleSchema.nullable().optional(),
  view_level: viewLevelSchema.nullable().optional(),
  lens_properties: lensPropertySchema.nullable().optional(),
  style: z.string().max(200).nullable().optional(),
  mood: z.string().max(200).nullable().optional(),
  scene_description: z.string().max(2_000).nullable().optional(),
  image_prompt: z.string().max(2_000).nullable().optional(),
  row_order: z.number().int().min(0),
  created_at: z.string(),
  updated_at: z.string(),
})

export type ShotlistRowValidated = z.infer<typeof shotlistRowSchema>

// ---------------------------------------------------------------------------
// Update schema (partial — only the editable fields)
// ---------------------------------------------------------------------------

export const updateShotlistRowSchema = shotlistRowSchema
  .pick({
    scene_number: true,
    shot_number: true,
    composition: true,
    shot_type: true,
    shot_angle: true,
    view_level: true,
    lens_properties: true,
    style: true,
    mood: true,
    scene_description: true,
    image_prompt: true,
    row_order: true,
  })
  .partial()
  .extend({
    /** Row ID is always required for updates. */
    id: z.string().uuid(),
  })

export type UpdateShotlistRowInput = z.infer<typeof updateShotlistRowSchema>

// ---------------------------------------------------------------------------
// Batch update
// ---------------------------------------------------------------------------

export const batchUpdateShotlistSchema = z.object({
  rows: z
    .array(updateShotlistRowSchema)
    .min(1, 'At least one row must be provided'),
})

export type BatchUpdateShotlistInput = z.infer<typeof batchUpdateShotlistSchema>

// ---------------------------------------------------------------------------
// Reorder
// ---------------------------------------------------------------------------

export const reorderShotlistSchema = z.object({
  ordered_ids: z
    .array(z.string().uuid())
    .min(1, 'ordered_ids must not be empty'),
})

export type ReorderShotlistInput = z.infer<typeof reorderShotlistSchema>
