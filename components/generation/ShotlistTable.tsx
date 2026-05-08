'use client'

import { useCallback } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ShotlistRow, ShotType, ShotAngle, ViewLevel, LensProperty } from '@/types/database'
import { ShotlistCell } from './ShotlistCell'

interface ShotlistTableProps {
  sessionId: string
  rows: ShotlistRow[]
  onChange: (rows: ShotlistRow[]) => void
  isSaving?: boolean
}

/* ─── Column definitions ──────────────────────────────────────────────────── */

interface ColDef {
  key: keyof ShotlistRow
  label: string
  width: number
  isEnum?: boolean
  enumOptions?: string[]
}

const SHOT_TYPE_OPTIONS: ShotType[] = ['ECU', 'CU', 'MCU', 'MS', 'MWS', 'WS', 'EWS']
const SHOT_ANGLE_OPTIONS: ShotAngle[] = [
  'Eye level',
  'Low angle',
  'High angle',
  'Dutch tilt',
  "Bird's eye",
  "Worm's eye",
]
const VIEW_LEVEL_OPTIONS: ViewLevel[] = ['Ground', 'Eye level', 'Elevated', 'Aerial']
const LENS_OPTIONS: LensProperty[] = ['14mm', '24mm', '35mm', '50mm', '85mm', '135mm']

const COLUMNS: ColDef[] = [
  { key: 'scene_number', label: 'Scene #', width: 60 },
  { key: 'shot_number', label: 'Shot #', width: 60 },
  { key: 'composition', label: 'Composition', width: 140 },
  { key: 'shot_type', label: 'Type', width: 90, isEnum: true, enumOptions: SHOT_TYPE_OPTIONS },
  {
    key: 'shot_angle',
    label: 'Angle',
    width: 110,
    isEnum: true,
    enumOptions: SHOT_ANGLE_OPTIONS,
  },
  {
    key: 'view_level',
    label: 'View',
    width: 90,
    isEnum: true,
    enumOptions: VIEW_LEVEL_OPTIONS,
  },
  {
    key: 'lens_properties',
    label: 'Lens',
    width: 80,
    isEnum: true,
    enumOptions: LENS_OPTIONS,
  },
  { key: 'style', label: 'Style', width: 120 },
  { key: 'mood', label: 'Mood', width: 100 },
  { key: 'scene_description', label: 'Scene Description', width: 180 },
  { key: 'image_prompt', label: 'Image Prompt', width: 220 },
]

/* ─── Helper to build a blank row ──────────────────────────────────────────── */

function buildBlankRow(sessionId: string, userId: string, rowOrder: number): ShotlistRow {
  const now = new Date().toISOString()
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    session_id: sessionId,
    user_id: userId,
    scene_number: '',
    shot_number: '',
    composition: null,
    shot_type: null,
    shot_angle: null,
    view_level: null,
    lens_properties: null,
    style: null,
    mood: null,
    scene_description: null,
    image_prompt: null,
    row_order: rowOrder,
    created_at: now,
    updated_at: now,
  }
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function ShotlistTable({
  sessionId,
  rows,
  onChange,
  isSaving = false,
}: ShotlistTableProps) {
  const handleCellChange = useCallback(
    (rowId: string, colKey: keyof ShotlistRow, value: string) => {
      onChange(
        rows.map((r) =>
          r.id === rowId
            ? { ...r, [colKey]: value === '' ? null : value, updated_at: new Date().toISOString() }
            : r
        )
      )
    },
    [rows, onChange]
  )

  const handleAddBelow = useCallback(
    (afterIndex: number) => {
      const userId = rows[0]?.user_id ?? ''
      const newRow = buildBlankRow(sessionId, userId, afterIndex + 1)
      const updated = [
        ...rows.slice(0, afterIndex + 1),
        newRow,
        ...rows.slice(afterIndex + 1),
      ].map((r, i) => ({ ...r, row_order: i }))
      onChange(updated)
    },
    [rows, sessionId, onChange]
  )

  const handleDeleteRow = useCallback(
    (rowId: string) => {
      onChange(rows.filter((r) => r.id !== rowId).map((r, i) => ({ ...r, row_order: i })))
    },
    [rows, onChange]
  )

  return (
    <div className="flex flex-col gap-2">
      {/* Saving indicator */}
      <div className="h-5 flex items-center justify-end px-1">
        <AnimatePresence>
          {isSaving && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Table scroll wrapper */}
      <div className="w-full overflow-x-auto rounded-xl border border-[#2A2A2A]"
           style={{ scrollbarWidth: 'thin', scrollbarColor: '#3A3A3A #111111' }}>
        <table className="border-collapse text-sm" style={{ tableLayout: 'fixed', minWidth: 1370 }}>
          {/* Sticky header */}
          <thead>
            <tr className="sticky top-0 z-10 bg-[#111111]">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider
                             text-[#6B7280] border-b border-[#1F1F1F] border-r last:border-r-0 whitespace-nowrap"
                  style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                >
                  {col.label}
                </th>
              ))}
              {/* Actions column */}
              <th
                className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider
                           text-[#6B7280] border-b border-[#1F1F1F] w-16 min-w-[64px]"
              >
                &nbsp;
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={`
                  group relative
                  ${rowIndex % 2 === 0 ? 'bg-[#1A1A1A]' : 'bg-[#161616]'}
                  hover:bg-[#1F1F2E] transition-colors duration-100
                `}
              >
                {COLUMNS.map((col) => (
                  <ShotlistCell
                    key={col.key}
                    value={row[col.key] as string | null}
                    columnKey={col.key}
                    isEnum={col.isEnum}
                    enumOptions={col.enumOptions}
                    onChange={(val) => handleCellChange(row.id, col.key, val)}
                    width={col.width}
                  />
                ))}

                {/* Row action buttons — visible on hover */}
                <td className="border-r-0 border-[#1F1F1F] px-1 py-0.5 w-16">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      type="button"
                      onClick={() => handleAddBelow(rowIndex)}
                      title="Add row below"
                      className="p-1 rounded text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      title="Delete row"
                      className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="text-center py-12 text-muted-foreground/50 text-sm"
                >
                  No shots yet. Generate a shotlist or add rows manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
