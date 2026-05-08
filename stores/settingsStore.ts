'use client'

import { create } from 'zustand'
import type { UserSettings } from '@/types/database'

interface SettingsState {
  settings: UserSettings | null
  isLoaded: boolean
  setSettings: (settings: UserSettings | null) => void
  clearSettings: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoaded: false,
  setSettings: (settings) => set({ settings, isLoaded: true }),
  clearSettings: () => set({ settings: null, isLoaded: true }),
}))
