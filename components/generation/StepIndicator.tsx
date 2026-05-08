'use client'

import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  Edit3,
  Table,
  Grid,
  Image,
  Check,
  type LucideIcon,
} from 'lucide-react'

interface Step {
  id: number
  label: string
  icon: LucideIcon
}

const STEPS: Step[] = [
  { id: 1, label: 'Upload', icon: Upload },
  { id: 2, label: 'Script', icon: FileText },
  { id: 3, label: 'Edit Script', icon: Edit3 },
  { id: 4, label: 'Shotlist', icon: Table },
  { id: 5, label: 'Edit Shots', icon: Grid },
  { id: 6, label: 'Images', icon: Image },
]

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Generation progress" className="w-full px-4 py-3">
      <ol className="flex items-center w-full">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isPending = step.id > currentStep
          const Icon = step.icon
          const isLast = index === STEPS.length - 1

          return (
            <li
              key={step.id}
              className={`flex items-center ${isLast ? 'flex-none' : 'flex-1'}`}
            >
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5 relative">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`
                    relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                    transition-colors duration-300
                    ${
                      isCompleted
                        ? 'bg-accent text-white'
                        : isCurrent
                          ? 'bg-transparent text-accent border-2 border-accent'
                          : 'bg-transparent text-muted-foreground border-2 border-[#2A2A2A]'
                    }
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <span className="text-xs font-bold">{step.id}</span>
                  ) : (
                    <Icon className="w-3.5 h-3.5 opacity-40" />
                  )}

                  {/* Pulse ring on current step */}
                  {isCurrent && (
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-accent"
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  )}
                </motion.div>

                {/* Label — always visible on md+, only on current on mobile */}
                <span
                  className={`
                    text-[10px] font-medium leading-tight text-center whitespace-nowrap
                    transition-colors duration-200
                    ${isCurrent ? 'text-accent' : isCompleted ? 'text-foreground/70' : 'text-muted-foreground/50'}
                    ${isCurrent ? 'block' : 'hidden md:block'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-2 h-px relative overflow-hidden rounded-full bg-[#2A2A2A] mt-[-12px]">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-accent rounded-full"
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
