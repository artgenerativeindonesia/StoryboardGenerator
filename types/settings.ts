/* ─────────────────────────────────────────────────────────────────────────────
 * Settings types — shapes for the settings form, OpenRouter model catalogue,
 * and per-provider configuration objects.
 * ───────────────────────────────────────────────────────────────────────────── */

import type { ImageProvider } from './database'

/* ─── OpenRouter ─────────────────────────────────────────────────────────── */

/**
 * Pricing information for a single OpenRouter model.
 * All values are USD cost per 1 000 tokens, represented as decimal strings
 * to avoid floating-point precision issues (as returned by the API).
 */
export interface OpenRouterModelPricing {
  /** USD per 1 000 prompt (input) tokens. */
  prompt: string
  /** USD per 1 000 completion (output) tokens. */
  completion: string
  /** USD per image input token, if the model supports vision. */
  image?: string
}

/**
 * Architecture metadata for an OpenRouter model.
 */
export interface OpenRouterModelArchitecture {
  /** E.g. "text->text", "text+image->text". */
  modality: string
  /** E.g. "GPT", "Llama3", "Claude". */
  tokenizer: string
  /** Instruction format (e.g. "ChatML", "Alpaca"). */
  instruct_type?: string
}

/**
 * A single model entry from the OpenRouter `/models` endpoint.
 */
export interface OpenRouterModel {
  /** Fully qualified model ID, e.g. "openai/gpt-4o". */
  id: string
  /** Human-readable name. */
  name: string
  /** Maximum context window in tokens. */
  context_length: number
  pricing: OpenRouterModelPricing
  /** Model description / capability summary. */
  description?: string
  architecture?: OpenRouterModelArchitecture
  /** Top provider for this model (may differ from the model's own namespace). */
  top_provider?: {
    context_length: number
    max_completion_tokens: number | null
    is_moderated: boolean
  }
  /** Whether the model supports image inputs. */
  supportsVision?: boolean
}

/* ─── Image Provider Configuration ──────────────────────────────────────── */

/**
 * Runtime configuration block for a single image-generation provider.
 * Drives the provider-selection UI and validation logic in the settings form.
 */
export interface ImageProviderConfig {
  /** Identifier matching the `ImageProvider` union. */
  id: ImageProvider
  /** Display name shown in the UI. */
  label: string
  /** Short description (capabilities, style, etc.). */
  description: string
  /** URL of the provider's public website. */
  docsUrl: string
  /** Whether this provider has an MCP server integration available. */
  supportsMcp: boolean
  /** The form field name for the API key (maps to `UserSettings`). */
  apiKeyField: keyof SettingsFormValues
  /** The form field name for the model (maps to `UserSettings`). */
  modelField: keyof SettingsFormValues
  /** Placeholder text shown inside the API key input. */
  apiKeyPlaceholder: string
  /** List of supported model IDs for this provider (may be empty if dynamic). */
  supportedModels: string[]
}

/**
 * Static provider config map — import and spread into a select wherever needed.
 */
export const IMAGE_PROVIDER_CONFIGS: Record<ImageProvider, ImageProviderConfig> =
  {
    higgsfield: {
      id: 'higgsfield',
      label: 'Higgsfield AI',
      description:
        'Cinematic video/image generation with strong directorial control.',
      docsUrl: 'https://higgsfield.ai/docs',
      supportsMcp: true,
      apiKeyField: 'higgsfield_api_key',
      modelField: 'higgsfield_model',
      apiKeyPlaceholder: 'hf-…',
      supportedModels: ['higgsfield-v1', 'higgsfield-v1-fast'],
    },
    kieai: {
      id: 'kieai',
      label: 'Kie AI',
      description: 'Fast, high-quality image generation optimised for stills.',
      docsUrl: 'https://kie.ai/docs',
      supportsMcp: false,
      apiKeyField: 'kieai_api_key',
      modelField: 'kieai_model',
      apiKeyPlaceholder: 'kie-…',
      supportedModels: ['kie-xl', 'kie-xl-fast'],
    },
    wavespeed: {
      id: 'wavespeed',
      label: 'Wavespeed AI',
      description: 'Ultra-fast inference for FLUX-family image models.',
      docsUrl: 'https://wavespeed.ai/docs',
      supportsMcp: false,
      apiKeyField: 'wavespeed_api_key',
      modelField: 'wavespeed_model',
      apiKeyPlaceholder: 'ws-…',
      supportedModels: [
        'wavespeed/flux-dev',
        'wavespeed/flux-schnell',
        'wavespeed/flux-dev-fp8',
      ],
    },
  }

/* ─── Settings Form Values ───────────────────────────────────────────────── */

/**
 * Shape of the react-hook-form values for the Settings page.
 * All fields are optional strings so unset keys render empty inputs.
 */
export interface SettingsFormValues {
  /* ── LLM ──────────────────────────────────────────────────────────────── */
  openrouter_api_key: string
  openrouter_model: string

  /* ── Image generation ────────────────────────────────────────────────── */
  image_provider: ImageProvider

  /* Higgsfield */
  higgsfield_api_key: string
  higgsfield_model: string
  use_higgsfield_mcp: boolean

  /* Kie AI */
  kieai_api_key: string
  kieai_model: string

  /* Wavespeed */
  wavespeed_api_key: string
  wavespeed_model: string

  /* ── UI preferences ──────────────────────────────────────────────────── */
  ui_projects_view: 'grid' | 'list'
}

/**
 * Default / blank initial values for the settings form.
 * Used as the `defaultValues` argument to `useForm`.
 */
export const DEFAULT_SETTINGS_FORM_VALUES: SettingsFormValues = {
  openrouter_api_key: '',
  openrouter_model: 'openai/gpt-4o',
  image_provider: 'higgsfield',
  higgsfield_api_key: '',
  higgsfield_model: 'higgsfield-v1',
  use_higgsfield_mcp: false,
  kieai_api_key: '',
  kieai_model: 'kie-xl',
  wavespeed_api_key: '',
  wavespeed_model: 'wavespeed/flux-dev',
  ui_projects_view: 'grid',
}

/* ─── Validation Helpers ─────────────────────────────────────────────────── */

/**
 * Returns true if the provided string looks like a plausible API key
 * (non-empty, at least 8 chars, no leading/trailing whitespace).
 */
export function isValidApiKey(value: string | null | undefined): boolean {
  if (!value) return false
  const trimmed = value.trim()
  return trimmed.length >= 8 && trimmed === value
}

/**
 * Returns the display label for an `ImageProvider` value.
 */
export function getProviderLabel(provider: ImageProvider): string {
  return IMAGE_PROVIDER_CONFIGS[provider]?.label ?? provider
}
