'use client'

import { useState } from 'react'
import { Eye, EyeOff, Zap, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ModelSelector from '@/components/settings/ModelSelector'

interface LLMSettingsFormProps {
  initialApiKey?: string
  initialModel?: string
  onSave: (data: { apiKey: string; model: string }) => Promise<void>
  isSaving?: boolean
}

type TestStatus = 'idle' | 'testing' | 'ok' | 'error'

export default function LLMSettingsForm({
  initialApiKey = '',
  initialModel = 'openai/gpt-4o',
  onSave,
  isSaving,
}: LLMSettingsFormProps) {
  const [apiKey, setApiKey] = useState(initialApiKey)
  const [model, setModel] = useState(initialModel)
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [selectorOpen, setSelectorOpen] = useState(false)

  const handleTest = async () => {
    if (!apiKey) return
    setTestStatus('testing')
    try {
      const res = await fetch('/api/openrouter/models', {
        headers: { 'x-api-key-override': apiKey },
      })
      setTestStatus(res.ok ? 'ok' : 'error')
    } catch {
      setTestStatus('error')
    }
    setTimeout(() => setTestStatus('idle'), 4000)
  }

  const handleSave = async () => {
    await onSave({ apiKey, model })
  }

  const handleClear = async () => {
    setApiKey('')
    setModel('openai/gpt-4o')
    await onSave({ apiKey: '', model: 'openai/gpt-4o' })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* API Key */}
      <div className="flex flex-col gap-2">
        <Label className="text-white/70 text-sm">OpenRouter API Key</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-…"
              className="pr-10 bg-[#111111] border-[#2A2A2A] text-white placeholder:text-white/25 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button
            variant="outline"
            size="default"
            onClick={handleTest}
            disabled={!apiKey || testStatus === 'testing'}
            className="gap-2 border-[#2A2A2A] text-white/60 hover:text-white hover:bg-white/5 shrink-0"
          >
            {testStatus === 'testing' ? (
              <Zap className="h-4 w-4 animate-pulse" />
            ) : testStatus === 'ok' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : testStatus === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-400" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {testStatus === 'testing' ? 'Testing…' : testStatus === 'ok' ? 'Connected' : testStatus === 'error' ? 'Failed' : 'Test'}
          </Button>
        </div>
        <p className="text-xs text-white/30">
          Get your key at{' '}
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7C3AED] hover:underline"
          >
            openrouter.ai
          </a>
        </p>
      </div>

      {/* Model */}
      <div className="flex flex-col gap-2">
        <Label className="text-white/70 text-sm">Model</Label>
        <button
          onClick={() => setSelectorOpen(true)}
          className="flex items-center justify-between w-full rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2.5 text-sm text-left hover:border-[#3A3A3A] transition-colors"
        >
          <span className="font-mono text-white/80">{model || 'Select a model…'}</span>
          <ChevronDown className="h-4 w-4 text-white/30" />
        </button>
      </div>

      <ModelSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        apiKey={apiKey}
        currentModel={model}
        onSelect={setModel}
      />

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
          Clear
        </Button>
      </div>
    </div>
  )
}
