import { useState, useEffect, useCallback, useRef } from 'react'
import { saveToFirestore, subscribeToFirestore, isFirebaseConfigured } from '../firebase'

export function useSyncedState<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try { return JSON.parse(stored) } catch { /* ignore */ }
    }
    return initialValue
  })

  const isRemoteUpdate = useRef(false)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    const unsub = subscribeToFirestore(key, (data) => {
      if (data) {
        isRemoteUpdate.current = true
        setValue(data as T)
        localStorage.setItem(key, JSON.stringify(data))
      }
    })
    return unsub
  }, [key])

  const updateValue = useCallback((newVal: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof newVal === 'function' ? (newVal as (p: T) => T)(prev) : newVal
      localStorage.setItem(key, JSON.stringify(resolved))
      if (isFirebaseConfigured) saveToFirestore(key, resolved)
      return resolved
    })
  }, [key])

  return [value, updateValue]
}
