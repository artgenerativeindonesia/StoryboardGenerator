'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LLMSettingsForm from '@/components/settings/LLMSettingsForm'
import ImageGenSettingsForm from '@/components/settings/ImageGenSettingsForm'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { formatDate } from '@/lib/utils'
import type { UserSettings } from '@/types/database'

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const [llmSaving, setLlmSaving] = useState(false)
  const [imgSaving, setImgSaving] = useState(false)

  const handleSaveLLM = async (data: { apiKey: string; model: string }) => {
    setLlmSaving(true)
    try {
      await updateSettings.mutateAsync({
        openrouter_api_key: data.apiKey || null,
        openrouter_model: data.model,
      })
    } finally {
      setLlmSaving(false)
    }
  }

  const handleSaveImageGen = async (data: Partial<UserSettings>) => {
    setImgSaving(true)
    try {
      await updateSettings.mutateAsync(data)
    } finally {
      setImgSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-2xl mx-auto w-full">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2 text-white/60 hover:text-white"
        >
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-white/40 mt-1">
          Configure your AI providers. Settings are saved per account.
        </p>
      </div>

      {/* LLM Settings */}
      <section className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/20">
              <Settings2 className="h-4 w-4 text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Language Model</h2>
              <p className="text-xs text-white/40">
                Used for script and shotlist generation
              </p>
            </div>
          </div>
          {settings?.updated_at && (
            <span className="text-xs text-white/25 shrink-0">
              Saved {formatDate(settings.updated_at)}
            </span>
          )}
        </div>

        <LLMSettingsForm
          initialApiKey={settings?.openrouter_api_key ?? ''}
          initialModel={settings?.openrouter_model ?? 'openai/gpt-4o'}
          onSave={handleSaveLLM}
          isSaving={llmSaving}
        />
      </section>

      {/* Image Gen Settings */}
      <section className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB]/20">
              <ImageIcon className="h-4 w-4 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Image Generation</h2>
              <p className="text-xs text-white/40">
                Used to generate storyboard images from prompts
              </p>
            </div>
          </div>
          {settings?.updated_at && (
            <span className="text-xs text-white/25 shrink-0">
              Saved {formatDate(settings.updated_at)}
            </span>
          )}
        </div>

        <ImageGenSettingsForm
          initialSettings={settings ?? undefined}
          onSave={handleSaveImageGen}
          isSaving={imgSaving}
        />
      </section>
    </div>
  )
}
