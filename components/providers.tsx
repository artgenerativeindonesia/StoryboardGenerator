'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'

/* ─── QueryClient factory ────────────────────────────────────────────────── */
/**
 * Create a new QueryClient per component mount (i.e. per browser session).
 * This avoids sharing state between users during SSR and ensures a fresh
 * client is created on every component mount in tests.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds — avoids redundant refetches
        // when navigating back to a page that was recently loaded.
        staleTime: 60 * 1000,
        // Keep unused data in the cache for 5 minutes after all observers unmount.
        gcTime: 5 * 60 * 1000,
        // Only retry once on failure to avoid hammering the server on auth errors.
        retry: 1,
        // Don't refetch on window focus in development to reduce noise.
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      },
      mutations: {
        // Surface mutation errors rather than swallowing them silently.
        throwOnError: false,
      },
    },
  })
}

// Singleton for the browser — avoids re-creating the client on every render
// while still creating a fresh one per SSR request.
let browserQueryClient: QueryClient | undefined

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always make a new client (no singleton)
    return makeQueryClient()
  }

  // Browser: reuse the existing client, or create one if it doesn't exist yet.
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

/* ─── Providers component ────────────────────────────────────────────────── */
interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  /**
   * useState ensures the QueryClient is created once per render tree and
   * is stable across re-renders. Using a lazy initializer avoids the
   * singleton pattern for SSR while still being efficient on the client.
   */
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        // Force dark theme — the app is dark-only; this prevents the flash
        // of the system default theme on first load.
        forcedTheme="dark"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>

      {/* React Query devtools are only bundled in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
