import { z } from 'zod'

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or fewer'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or fewer')
    .optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export const updateProjectSchema = createProjectSchema
  .partial()
  .extend({
    is_archived: z.boolean().optional(),
  })

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
