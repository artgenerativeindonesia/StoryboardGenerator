'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { X } from 'lucide-react'

interface GenerationProgressProps {
  title?: string
  stages?: string[]
  currentStage?: string
  percent: number
  /** Alternative to currentStage — display message directly */
  message?: string
  stage?: string
  isConnected?: boolean
  onCancel?: () => void
}

/** Animated counter that tweens from old value to new value. */
function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(value)
  const rounded = useTransform(motionVal, (v) => Math.round(v))
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 0.6, ease: 'easeOut' })
    const unsub = rounded.on('change', (v) => setDisplay(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [value, motionVal, rounded])

  return <span>{display}</span>
}

function useElapsedTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!running) return
    startRef.current = Date.now()
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function GenerationProgress({
  title = 'Generating…',
  stages: _stages,
  currentStage,
  percent,
  message,
  stage: _stage,
  isConnected: _isConnected,
  onCancel,
}: GenerationProgressProps) {
  const displayStage = currentStage ?? message ?? 'Processing…'
  const elapsed = useElapsedTimer(true)
  const clampedPercent = Math.min(100, Math.max(0, percent))

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full min-h-[420px] py-16 px-6 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 50%, #1A1033 0%, #0A0A0A 70%)',
      }}
    >
      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#1A1A1A] transition-colors"
          aria-label="Cancel generation"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Floating dots */}
      <div className="flex items-end gap-2 mb-8 h-6" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-accent/70"
            style={{
              animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-foreground mb-2 text-center">{title}</h2>

      {/* Large percent */}
      <div
        className="text-7xl font-bold tabular-nums leading-none mb-8"
        style={{ color: '#7C3AED' }}
      >
        <AnimatedNumber value={clampedPercent} />
        <span className="text-4xl">%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md h-1 bg-[#2A2A2A] rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #5B21B6, #7C3AED, #A78BFA)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Animated stage message */}
      <div className="h-7 flex items-center justify-center mb-2" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={displayStage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted-foreground text-center"
          >
            {displayStage}
            <AnimatedDots />
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Elapsed timer */}
      <p className="text-xs text-muted-foreground/60 tabular-nums mb-4">
        Elapsed: {elapsed}
      </p>

      {/* Hint */}
      <p className="text-xs text-muted-foreground/40 text-center max-w-xs">
        If stuck, refresh the page &mdash; your progress is saved
      </p>

      {/* Bounce keyframes injected globally once */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40%            { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function AnimatedDots() {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(id)
  }, [])
  return <span className="inline-block w-5 text-left">{dots}</span>
}
