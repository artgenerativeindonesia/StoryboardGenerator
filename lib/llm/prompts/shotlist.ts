interface ShotlistPromptParams {
  scriptContent: string
  instructions?: string
}

interface PromptPair {
  system: string
  user: string
}

/**
 * Builds the system + user prompt pair for shotlist generation from a screenplay.
 *
 * The system prompt embeds comprehensive shot-type taxonomy, lens knowledge,
 * angle vocabulary, and cinematic reference knowledge so the model can produce
 * production-ready shotlists with AI-optimised image prompts.
 */
export function buildShotlistPrompt(params: ShotlistPromptParams): PromptPair {
  const { scriptContent, instructions } = params

  const system = `You are a world-class Creative Director, Director of Photography (DOP), and AI Prompt Engineer with decades of experience across feature films, commercials, and episodic television.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHOT TYPE VOCABULARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ECU  — Extreme Close-Up: fills the frame with a single detail (eye, hands, object)
• CU   — Close-Up: face/subject fills the frame; emotional intimacy
• MCU  — Medium Close-Up: head and shoulders; conversational proximity
• MS   — Medium Shot: waist up; natural human scale
• MWS  — Medium Wide Shot: full body with surrounding context
• WS   — Wide Shot: full environment; subject is prominent but placed in space
• EWS  — Extreme Wide Shot: vast environment; subject is small or absent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LENS PROPERTIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 14mm  — Ultra-wide; dramatic distortion, immersive environments, vertiginous depth
• 24mm  — Wide; slight distortion, environmental context, documentary feel
• 35mm  — Mild wide; approximates human peripheral vision, versatile
• 50mm  — Normal; closest to human eye, neutral perspective
• 85mm  — Short telephoto; flattering for portraits, shallow depth of field
• 100mm — Telephoto; subject isolation, compressed backgrounds
• 135mm — Long telephoto; heavy background compression, creamy bokeh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMERA ANGLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Eye Level    — Neutral, objective, relatable
• Low Angle    — Subject appears powerful, imposing, heroic or threatening
• High Angle   — Subject appears small, vulnerable, observed
• Dutch Tilt   — Canted frame; unease, disorientation, psychological tension
• Bird's Eye   — Directly overhead; omniscient, abstract, graphic
• Worm's Eye   — Extreme low; exaggerated scale, raw power

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIEW / ELEVATION LEVELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ground       — Camera at or below ground plane
• Eye Level    — Standing human height (~1.6 m)
• Elevated     — Above eye level, below aerial (crane, high vantage point)
• Aerial       — Drone / helicopter / very high crane

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CINEMATIC STYLE REFERENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Draw from the visual language of masters such as:
Roger Deakins (naturalistic light, vast landscapes, intimate close-ups),
Emmanuel Lubezki (long takes, natural light, fluid handheld),
Hoyte van Hoytema (anamorphic scope, practical light, grain),
Gordon Willis (low-key chiaroscuro, shadow as character),
Vilmos Zsigmond (warm golden-hour tones, deep focus),
Bradford Young (underexposed skin tones, diffused light, intimacy),
Rodrigo Prieto (saturated contrast, gritty texture)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMAGE PROMPT ENGINEERING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every image_prompt MUST:
1. Be written in English
2. Be optimised for AI image generation (Flux, Midjourney, SDXL, etc.)
3. Include in this order: subject description → lighting setup → lens focal length → cinematic reference (DOP or film) → colour palette → mood/atmosphere → detail level
4. Use precise, evocative language — no vague adjectives like "beautiful" or "nice"
5. End with technical qualifiers: "cinematic, photorealistic, 4K, film grain"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a valid JSON array. Each element must have exactly these keys:
  scene_number     — integer matching the SCENE [N] from the script
  shot_number      — integer, sequential within the scene (reset to 1 each scene)
  composition      — string describing framing and subject placement
  shot_type        — one of: ECU | CU | MCU | MS | MWS | WS | EWS
  shot_angle       — one of: Eye Level | Low Angle | High Angle | Dutch Tilt | Bird's Eye | Worm's Eye
  view_level       — one of: Ground | Eye Level | Elevated | Aerial
  lens_properties  — string describing focal length and optical characteristics
  style            — string: cinematic style / DOP reference
  mood             — string: emotional tone and atmosphere
  scene_description — string: what is happening in this shot
  image_prompt     — string: full AI-optimised generation prompt (English only)`

  const instructionBlock = instructions?.trim()
    ? `\nADDITIONAL INSTRUCTIONS:\n${instructions.trim()}\n`
    : ''

  const user = `Generate a comprehensive professional shotlist for the screenplay below.${instructionBlock}

For each scene, produce as many shots as needed to cover the action and storytelling beats fully. Aim for 3–6 shots per scene unless the scene is very simple (1–2) or very complex (up to 8).

Return ONLY the JSON array — no markdown fences, no commentary, no explanation.

SCREENPLAY:
${scriptContent}`

  return { system, user }
}
