'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { AppShell } from '@/components/layout/AppShell'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get current session on mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })

    // Keep user state in sync with auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <AppShell user={user}>{children}</AppShell>
}
