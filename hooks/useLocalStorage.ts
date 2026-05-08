'use client'
import { useState, useCallback, useEffect } from 'react'

/**
 * Typed localStorage hook with full SSR safety and cross-tab sync.
 *
 * @param key          localStorage key
 * @param initialValue Value to use on the server or when the key is absent
 * @returns            [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const isServer = typeof window === 'undefined'

  const readValue = useCallback((): T => {
    if (isServer) return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : initialValue
    } catch (err) {
      console.warn(`useLocalStorage: error reading key "${key}"`, err)
      return initialValue
    }
  }, [isServer, key, initialValue])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  // Re-sync when the key changes (e.g. dynamic keys driven by route params)
  useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const setValue = useCallback(
    (value: T) => {
      if (isServer) {
        console.warn(
          `useLocalStorage: attempted to set key "${key}" during SSR`
        )
        return
      }
      try {
        const serialized = JSON.stringify(value)
        window.localStorage.setItem(key, serialized)
        setStoredValue(value)
        // Notify other tabs / hook instances in the same tab
        window.dispatchEvent(
          new StorageEvent('storage', { key, newValue: serialized })
        )
      } catch (err) {
        console.warn(`useLocalStorage: error setting key "${key}"`, err)
      }
    },
    [isServer, key]
  )

  const removeValue = useCallback(() => {
    if (isServer) return
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
      window.dispatchEvent(
        new StorageEvent('storage', { key, newValue: null })
      )
    } catch (err) {
      console.warn(`useLocalStorage: error removing key "${key}"`, err)
    }
  }, [isServer, key, initialValue])

  // Cross-tab synchronisation
  useEffect(() => {
    if (isServer) return

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key) return
      if (e.newValue === null) {
        setStoredValue(initialValue)
      } else {
        try {
          setStoredValue(JSON.parse(e.newValue) as T)
        } catch {
          // Ignore parse errors originating from other tabs
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [isServer, key, initialValue])

  return [storedValue, setValue, removeValue]
}
