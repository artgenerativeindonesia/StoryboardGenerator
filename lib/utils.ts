import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/* ─── Class Name Utility ─────────────────────────────────────────────────── */

/**
 * Merges Tailwind CSS class names with full conflict resolution.
 * Uses clsx for conditional/array logic, then tailwind-merge to deduplicate
 * conflicting utility classes (e.g. `p-2 p-4` → `p-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/* ─── Date Formatting ────────────────────────────────────────────────────── */

/**
 * Formats a date string or Date object into a human-readable string.
 *
 * @param date    - ISO string or Date instance to format.
 * @param options - Optional `Intl.DateTimeFormatOptions` to override defaults.
 * @returns       Formatted date string in the user's locale.
 *
 * @example
 * formatDate('2024-03-15T10:30:00Z')
 * // → "Mar 15, 2024"
 *
 * formatDate(new Date(), { dateStyle: 'full' })
 * // → "Friday, March 15, 2024"
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Invalid date'
  return new Intl.DateTimeFormat('en-US', options).format(d)
}

/* ─── File Size Formatting ───────────────────────────────────────────────── */

/**
 * Converts a raw byte count into a human-readable file size string.
 *
 * @param bytes - Number of bytes.
 * @returns     Formatted string, e.g. "1.23 MB".
 *
 * @example
 * formatBytes(0)           // → "0 B"
 * formatBytes(1024)        // → "1.00 KB"
 * formatBytes(1_500_000)   // → "1.43 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (!Number.isFinite(bytes) || bytes < 0) return 'Unknown size'

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const value = bytes / Math.pow(1024, exponent)

  // Show no decimal for plain bytes; two decimals otherwise.
  const formatted = exponent === 0 ? value.toString() : value.toFixed(2)
  return `${formatted} ${units[exponent]}`
}

/* ─── String Truncation ──────────────────────────────────────────────────── */

/**
 * Truncates a string to at most `maxLength` characters, appending an ellipsis
 * if the string was shortened.
 *
 * @param str       - The source string.
 * @param maxLength - Maximum number of characters (including the ellipsis).
 * @returns         Truncated string.
 *
 * @example
 * truncate('Hello, World!', 8)  // → "Hello, …"
 * truncate('Short', 10)         // → "Short"
 */
export function truncate(str: string, maxLength: number): string {
  if (maxLength < 1) return ''
  if (str.length <= maxLength) return str
  // Use a proper ellipsis character, reserving one position for it.
  return str.slice(0, maxLength - 1) + '…'
}

/* ─── ID Generation ──────────────────────────────────────────────────────── */

/**
 * Generates a cryptographically random UUID v4.
 * Uses `crypto.randomUUID()` when available (all modern browsers and Node ≥ 14.17),
 * falling back to a manual PRNG implementation for older environments.
 *
 * @returns UUID v4 string, e.g. "550e8400-e29b-41d4-a716-446655440000".
 */
export function generateId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  // Fallback: manually construct a v4 UUID using getRandomValues if available,
  // or Math.random as a last resort.
  const getRandomByte = (): number => {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function'
    ) {
      const buf = new Uint8Array(1)
      crypto.getRandomValues(buf)
      return buf[0]
    }
    return Math.floor(Math.random() * 256)
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const r = getRandomByte() & 0xf
    const v = char === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/* ─── Async Sleep ────────────────────────────────────────────────────────── */

/**
 * Returns a Promise that resolves after `ms` milliseconds.
 * Useful for rate-limiting, animation sequencing, or testing.
 *
 * @param ms - Milliseconds to wait.
 * @returns  Promise<void>
 *
 * @example
 * await sleep(500) // wait 500 ms
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ─── Concurrency Limiter ────────────────────────────────────────────────── */

/**
 * Runs an array of async task factories with a maximum concurrency limit.
 * Tasks are started eagerly up to `limit` at a time; as each finishes, the
 * next pending task is started. The returned array preserves the original order.
 *
 * @param tasks - Array of zero-argument async functions (task factories).
 * @param limit - Maximum number of tasks running concurrently.
 * @returns     Promise that resolves to an array of results in input order.
 *
 * @example
 * const urls = ['https://a.com', 'https://b.com', 'https://c.com']
 * const results = await withConcurrency(
 *   urls.map(url => () => fetch(url).then(r => r.json())),
 *   2, // at most 2 requests in-flight at once
 * )
 */
export async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  if (tasks.length === 0) return []
  if (limit < 1) throw new RangeError('Concurrency limit must be at least 1')

  const results: T[] = new Array(tasks.length)
  let nextIndex = 0

  async function runNext(): Promise<void> {
    while (nextIndex < tasks.length) {
      const index = nextIndex++
      results[index] = await tasks[index]()
    }
  }

  // Start up to `limit` workers; each worker picks up the next available task.
  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => runNext(),
  )

  await Promise.all(workers)
  return results
}
