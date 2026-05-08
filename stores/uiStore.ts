'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  projectsView: 'grid' | 'list'
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setProjectsView: (view: 'grid' | 'list') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      projectsView: 'grid',

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setProjectsView: (view) => set({ projectsView: view }),
    }),
    {
      name: 'sbg-ui',
    }
  )
)
