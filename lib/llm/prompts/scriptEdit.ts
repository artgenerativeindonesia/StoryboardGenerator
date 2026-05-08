interface ScriptEditPromptParams {
  currentScript: string
  editInstruction: string
}

interface PromptPair {
  system: string
  user: string
}

/**
 * Builds the system + user prompt pair for AI-assisted screenplay editing.
 *
 * The model acts as a precise script editor: it applies only the requested
 * changes and returns the complete, updated screenplay without altering any
 * section that was not addressed by the instruction.
 */
export function buildScriptEditPrompt(params: ScriptEditPromptParams): PromptPair {
  const { currentScript, editInstruction } = params

  const system = `You are an expert script editor with deep knowledge of Hollywood screenplay format and storytelling craft.

Your role is to apply editorial changes to an existing screenplay with surgical precision:
- Apply ONLY the changes described in the editing instruction
- Do NOT alter, rewrite, or "improve" any section of the script that is not directly addressed by the instruction
- Preserve ALL existing scene numbers exactly as they appear — do not renumber, reorder, or remove scene headings unless the instruction explicitly requests it
- Maintain consistent industry-standard screenplay formatting throughout
- Return the COMPLETE updated screenplay — not a diff, not a summary, not excerpts

If the instruction is ambiguous, interpret it conservatively: make the minimal change that satisfies the request.`

  const user = `Apply the following editing instruction to the screenplay below, then return the complete updated screenplay.

EDITING INSTRUCTION:
${editInstruction.trim()}

---

CURRENT SCREENPLAY:
${currentScript}

---

Return only the complete updated screenplay with no additional commentary.`

  return { system, user }
}
