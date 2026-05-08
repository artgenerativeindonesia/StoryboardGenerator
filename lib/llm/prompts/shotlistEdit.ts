interface ShotlistEditPromptParams {
  currentRows: object[]
  editInstruction: string
}

interface PromptPair {
  system: string
  user: string
}

/**
 * Builds the system + user prompt pair for AI-assisted shotlist editing.
 *
 * The model applies the requested changes while leaving every unaffected row
 * intact and returns the complete updated JSON array.
 */
export function buildShotlistEditPrompt(params: ShotlistEditPromptParams): PromptPair {
  const { currentRows, editInstruction } = params

  const system = `You are an expert shotlist editor with deep knowledge of cinematography, shot composition, and professional production workflows.

Your role is to apply targeted changes to an existing shotlist with surgical precision:
- Apply ONLY the changes described in the editing instruction
- Preserve every row that is NOT addressed by the instruction — do not alter, reorder, or improve rows that are out of scope
- Maintain consistent JSON structure throughout: every row must retain the same keys as the input
- Do NOT renumber scenes or shots unless the instruction explicitly asks for renumbering
- Do NOT add commentary, explanations, or markdown formatting to your response

Return the COMPLETE updated JSON array — not a diff, not a partial list, but the entire shotlist with changes applied.

The JSON array elements must preserve these keys (add only if an existing row already has them):
  scene_number, shot_number, composition, shot_type, shot_angle, view_level,
  lens_properties, style, mood, scene_description, image_prompt`

  const user = `Apply the following editing instruction to the shotlist below, then return the complete updated JSON array.

EDITING INSTRUCTION:
${editInstruction.trim()}

---

CURRENT SHOTLIST (JSON array):
${JSON.stringify(currentRows, null, 2)}

---

Return ONLY the complete updated JSON array with no markdown fences, preamble, or commentary.`

  return { system, user }
}
