'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Film } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ─── Google Icon (inline SVG) ───────────────────────────────────────────── */

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-4 w-4', className)}
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function LoginCard() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/30">
              <Film className="h-7 w-7 text-[#7C3AED]" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-white tracking-tight mb-1">
              StoryboardGenerator
            </h1>
            <p className="text-sm text-[#6B7280]">
              Sign in to continue
            </p>
          </div>

          {/* Google Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3 border-[#2A2A2A] hover:bg-[#242424] hover:border-[#3A3A3A]"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-[#6B7280] border-t-white inline-block"
              />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Redirecting…' : 'Masuk dengan Google'}
          </Button>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center text-xs text-red-400"
            >
              {error}
            </motion.p>
          )}

          {/* Disclaimer */}
          <p className="mt-6 text-center text-[11px] text-[#4B5563] leading-relaxed">
            Internal tool — not publicly available
          </p>
        </div>
      </motion.div>
    </div>
  )
}
