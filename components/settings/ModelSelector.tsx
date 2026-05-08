'use client'

import { useState } from 'react'
import { Search, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useOpenRouterModels } from '@/hooks/useOpenRouterModels'

interface ModelSelectorProps {
  open: boolean
  onClose: () => void
  apiKey: string
  currentModel?: string
  onSelect: (modelId: string) => void
}

export default function ModelSelector({
  open,
  onClose,
  apiKey,
  currentModel,
  onSelect,
}: ModelSelectorProps) {
  const [search, setSearch] = useState('')
  const { models, isLoading } = useOpenRouterModels(apiKey)

  const filtered = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl bg-[#1A1A1A] border-[#2A2A2A] text-white p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-white">Select Model</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search models…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#111111] border-[#2A2A2A] text-white placeholder:text-white/30"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-80 divide-y divide-[#1F1F1F]">
          {isLoading ? (
            <div className="p-5 flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-5 text-sm text-white/40 text-center">No models found</p>
          ) : (
            filtered.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model.id)
                  onClose()
                }}
                className="w-full flex items-start gap-3 px-5 py-3 hover:bg-white/5 text-left transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{model.name}</span>
                    {model.id === currentModel && (
                      <Check className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-white/40 font-mono">{model.id}</span>
                    {model.context_length && (
                      <span className="text-xs text-white/30">
                        {(model.context_length / 1000).toFixed(0)}k ctx
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
