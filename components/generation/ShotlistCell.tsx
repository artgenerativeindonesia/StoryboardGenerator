'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShotlistCellProps {
  value: string | null
  columnKey: string
  isEnum?: boolean
  enumOptions?: string[]
  onChange: (value: string) => void
  width?: number
}

const LONG_COLUMNS = new Set(['scene_description', 'image_prompt', 'composition', 'style', 'mood'])

export function ShotlistCell({
  value,
  columnKey,
  isEnum = false,
  enumOptions = [],
  onChange,
  width,
}: ShotlistCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)

  const isLong = LONG_COLUMNS.has(columnKey)

  const enterEdit = useCallback(() => {
    setDraft(value ?? '')
    setEditing(true)
  }, [value])

  const commitEdit = useCallback(() => {
    setEditing(false)
    if (draft !== (value ?? '')) {
      onChange(draft)
    }
  }, [draft, value, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLong) {
        e.preventDefault()
        commitEdit()
      }
      if (e.key === 'Escape') {
        setDraft(value ?? '')
        setEditing(false)
      }
      if (e.key === 'Tab') {
        commitEdit()
      }
    },
    [commitEdit, isLong, value]
  )

  useEffect(() => {
    if (editing) {
      if (isEnum) {
        selectRef.current?.focus()
      } else if (isLong) {
        textareaRef.current?.focus()
      } else {
        inputRef.current?.focus()
      }
    }
  }, [editing, isEnum, isLong])

  const displayValue = value ?? '-'

  return (
    <td
      className="relative p-0 border-r border-[#1F1F1F] last:border-r-0 align-middle"
      style={width ? { width, minWidth: width, maxWidth: width } : undefined}
      onClick={() => !editing && enterEdit()}
    >
      <AnimatePresence initial={false} mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="w-full h-full"
          >
            {isEnum ? (
              <select
                ref={selectRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-[#0A0A0A] text-foreground text-sm px-2 py-1.5
                           ring-1 ring-[#7C3AED] outline-none border-none appearance-none cursor-pointer"
                style={width ? { width } : undefined}
              >
                <option value="">-</option>
                {enumOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : isLong ? (
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                rows={3}
                className="w-full bg-[#0A0A0A] text-foreground text-sm px-2 py-1.5
                           ring-1 ring-[#7C3AED] outline-none border-none resize-none leading-snug"
                style={width ? { width } : undefined}
              />
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-[#0A0A0A] text-foreground text-sm px-2 py-1.5
                           ring-1 ring-[#7C3AED] outline-none border-none"
                style={width ? { width } : undefined}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="px-2 py-1.5 text-sm text-foreground cursor-text select-none min-h-[32px] flex items-center
                       hover:bg-white/[0.03] transition-colors duration-100 overflow-hidden"
            title={value ?? undefined}
          >
            <span
              className={`truncate block w-full ${
                !value ? 'text-muted-foreground/40 italic' : ''
              }`}
            >
              {displayValue}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </td>
  )
}
