import { useState, useCallback } from 'react'

// Simple localStorage-only fallback for when Firebase isn't configured
export function useSyncedState<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try { return JSON.parse(stored) } catch { /* ignore */ }
    }
    return initialValue
  })

  const updateValue = useCallback((newVal: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof newVal === 'function' ? (newVal as (p: T) => T)(prev) : newVal
      localStorage.setItem(key, JSON.stringify(resolved))
      return resolved
    })
  }, [key])

  return [value, updateValue]
}
