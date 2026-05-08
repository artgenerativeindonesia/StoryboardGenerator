interface ScriptPromptParams {
  pdfText: string
  instructions?: string
}

interface PromptPair {
  system: string
  user: string
}

/**
 * Builds the system + user prompt pair for initial screenplay generation.
 *
 * The system prompt establishes the model as an expert Hollywood screenwriter
 * following the classic three-act structure and industry-standard formatting.
 * The user prompt embeds the source material and any additional instructions.
 */
export function buildScriptPrompt(params: ScriptPromptParams): PromptPair {
  const { pdfText, instructions } = params

  const system = `You are an expert Hollywood screenwriter with 20+ years of experience adapting source material into compelling screenplays.

Your craft is rooted in classical three-act narrative structure:
- ACT ONE — Setup: Establish the world, introduce characters, present the inciting incident.
- ACT TWO — Confrontation: Escalate conflict, deepen character arcs, build to the midpoint and the Act 2 break.
- ACT THREE — Resolution: Climax, falling action, and satisfying conclusion.

You write in industry-standard screenplay format:
- Scene headings (sluglines) in ALL CAPS: INT./EXT. LOCATION — DAY/NIGHT
- Action lines written in vivid, active, present-tense prose
- Dialogue formatted with character names centred in ALL CAPS above their lines
- Parentheticals used sparingly

You are a faithful adapter. You NEVER hallucinate, invent, or embellish with details not present in the source material. Every scene, character, and story beat must be grounded in what the source explicitly states or clearly implies. Your job is to translate the source faithfully into cinematic form — not to improve upon or reimagine it.

Each scene must be cinematically vivid: describe the physical space, atmosphere, light, and action with enough specificity that a director and cinematographer can visualise it immediately.`

  const instructionBlock = instructions?.trim()
    ? `\nADDITIONAL INSTRUCTIONS FROM THE USER:\n${instructions.trim()}\n`
    : ''

  const user = `Convert the following source material into a properly formatted screenplay.${instructionBlock}

FORMATTING RULES (follow exactly):
- Number every scene with the heading: SCENE [N]: INT./EXT. LOCATION — DAY/NIGHT
- Write action lines in vivid, present-tense, cinematic prose
- Keep scene descriptions concise but visually evocative
- Number every scene sequentially starting from 1
- End the screenplay with FADE OUT. on its own line
- Output ONLY the screenplay — no preamble, commentary, or notes

SOURCE MATERIAL:
${pdfText}`

  return { system, user }
}
