'use client'

import {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

interface ScriptEditorProps {
  sessionId: string
  initialContent: string
  onContentChange: (content: string) => void
}

type SaveStatus = 'idle' | 'saving' | 'saved'

export function ScriptEditor({
  sessionId: _sessionId,
  initialContent,
  onContentChange,
}: ScriptEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [charCount, setCharCount] = useState(initialContent.length)

  /* Populate editor with initial content once on mount */
  useEffect(() => {
    if (editorRef.current && initialContent) {
      // Convert newlines to <br> for contenteditable
      editorRef.current.innerText = initialContent
      setCharCount(initialContent.length)
    }
    // Only on mount — intentionally ignoring initialContent updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInput = useCallback(() => {
    const el = editorRef.current
    if (!el) return

    const text = el.innerText ?? ''
    setCharCount(text.length)

    setSaveStatus('saving')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onContentChange(text)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1500)
  }, [onContentChange])

  /* Paste as plain text */
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }, [])

  /* Cleanup debounce on unmount */
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] overflow-hidden">
      {/* Toolbar / status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1F1F1F] bg-[#111111]">
        <span className="text-xs text-muted-foreground font-medium">Script Editor</span>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
              <motion.span
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </motion.span>
            )}
            {saveStatus === 'saved' && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-emerald-500"
              >
                <Check className="w-3 h-3" />
                Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scrollable editor area */}
      <div
        className="overflow-y-auto"
        style={{ height: 'calc(100vh - 280px)' }}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          spellCheck
          className={`
            outline-none min-h-full mx-auto px-8 py-10
            text-foreground text-sm leading-loose
            font-mono tracking-wide
            whitespace-pre-wrap break-words
            caret-accent
            [&:focus]:ring-0
          `}
          style={{
            maxWidth: 680,
            /* Let the container handle the height */
            minHeight: '100%',
          }}
          aria-label="Script editor"
          aria-multiline="true"
          role="textbox"
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#1F1F1F] bg-[#111111]">
        <span className="text-xs text-muted-foreground/60">
          {charCount.toLocaleString()} characters
        </span>
        <span className="text-xs text-muted-foreground/40 hidden sm:block">
          Ctrl+A to select all &nbsp;&bull;&nbsp; Ctrl+Z to undo
        </span>
      </div>
    </div>
  )
}
