'use client'

import { useState } from 'react'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ImageProvider, UserSettings } from '@/types/database'

const PROVIDERS: { id: ImageProvider; name: string; description: string }[] = [
  {
    id: 'higgsfield',
    name: 'Higgsfield AI',
    description: 'Cinematic quality image generation',
  },
  {
    id: 'kieai',
    name: 'kie.ai',
    description: 'Fast creative image generation',
  },
  {
    id: 'wavespeed',
    name: 'wavespeed.ai',
    description: 'FLUX-powered image generation',
  },
]

interface ImageGenSettingsFormProps {
  initialSettings?: Partial<UserSettings>
  onSave: (data: Partial<UserSettings>) => Promise<void>
  isSaving?: boolean
}

export default function ImageGenSettingsForm({
  initialSettings,
  onSave,
  isSaving,
}: ImageGenSettingsFormProps) {
  const [provider, setProvider] = useState<ImageProvider>(
    (initialSettings?.image_provider as ImageProvider) ?? 'higgsfield'
  )
  const [higgsKey, setHighsKey] = useState(initialSettings?.higgsfield_api_key ?? '')
  const [kieKey, setKieKey] = useState(initialSettings?.kieai_api_key ?? '')
  const [wavespeedKey, setWavespeedKey] = useState(initialSettings?.wavespeed_api_key ?? '')
  const [showKeys, setShowKeys] = useState(false)

  const keyMap: Record<ImageProvider, { value: string; setter: (v: string) => void; placeholder: string }> = {
    higgsfield: { value: higgsKey, setter: setHighsKey, placeholder: 'hf-…' },
    kieai: { value: kieKey, setter: setKieKey, placeholder: 'kie-…' },
    wavespeed: { value: wavespeedKey, setter: setWavespeedKey, placeholder: 'ws-…' },
  }

  const current = keyMap[provider]

  const handleSave = async () => {
    await onSave({
      image_provider: provider,
      higgsfield_api_key: higgsKey || null,
      kieai_api_key: kieKey || null,
      wavespeed_api_key: wavespeedKey || null,
    })
  }

  const handleClear = async () => {
    setHighsKey('')
    setKieKey('')
    setWavespeedKey('')
    await onSave({
      image_provider: provider,
      higgsfield_api_key: null,
      kieai_api_key: null,
      wavespeed_api_key: null,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Provider selector */}
      <div className="flex flex-col gap-2">
        <Label className="text-white/70 text-sm">Image Provider</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all',
                provider === p.id
                  ? 'border-[#7C3AED] bg-[#1E1033]'
                  : 'border-[#2A2A2A] bg-[#111111] hover:border-[#3A3A3A]'
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg',
                  provider === p.id ? 'bg-[#7C3AED]/30' : 'bg-white/5'
                )}>
                  <Sparkles className={cn(
                    'h-3.5 w-3.5',
                    provider === p.id ? 'text-[#7C3AED]' : 'text-white/30'
                  )} />
                </div>
                <span className={cn(
                  'text-sm font-medium',
                  provider === p.id ? 'text-white' : 'text-white/60'
                )}>
                  {p.name}
                </span>
              </div>
              <p className="text-xs text-white/30 pl-0.5">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* API Key for selected provider */}
      <div className="flex flex-col gap-2">
        <Label className="text-white/70 text-sm">
          API Key — {PROVIDERS.find((p) => p.id === provider)?.name}
        </Label>
        <div className="relative">
          <Input
            type={showKeys ? 'text' : 'password'}
            value={current.value}
            onChange={(e) => current.setter(e.target.value)}
            placeholder={current.placeholder}
            className="pr-10 bg-[#111111] border-[#2A2A2A] text-white placeholder:text-white/25 font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShowKeys(!showKeys)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
        >
          {isSaving ? 'Saving…' : 'Save Settings'}
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={isSaving}
          className="border-[#2A2A2A] text-white/50 hover:text-white hover:bg-white/5"
        >
          Clear All Keys
        </Button>
      </div>
    </div>
  )
}
