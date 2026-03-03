import { useState, useEffect, useCallback, useRef } from 'react'
import type { TripData, Trip, TripDay, BudgetItem, ChecklistItem, Flight } from '../types'
import { saveTrip, subscribeTrip, isFirebaseConfigured } from '../firebase'

const SAVE_DEBOUNCE = 800

export function useTripStore(tripId: string | null) {
  const [data, setData] = useState<TripData | null>(null)
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Subscribe to Firestore for this trip
  useEffect(() => {
    if (!tripId) { setData(null); setLoading(false); return }

    if (isFirebaseConfigured) {
      setLoading(true)
      const unsub = subscribeTrip(tripId, (raw) => {
        if (raw) {
          setData({
            meta: raw.meta as Trip,
            days: (raw.days as TripDay[]) || [],
            budget: (raw.budget as BudgetItem[]) || [],
            checklist: (raw.checklist as ChecklistItem[]) || [],
            flights: (raw.flights as Flight[]) || [],
          })
        }
        setLoading(false)
      })
      return unsub
    } else {
      // Fallback: localStorage
      const stored = localStorage.getItem(`trip-${tripId}`)
      if (stored) {
        try { setData(JSON.parse(stored)) } catch { /* ignore */ }
      }
      setLoading(false)
    }
  }, [tripId])

  // Debounced save
  const persistData = useCallback((updated: TripData) => {
    if (!tripId) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (isFirebaseConfigured) {
        saveTrip(tripId, updated as unknown as Record<string, unknown>)
      } else {
        localStorage.setItem(`trip-${tripId}`, JSON.stringify(updated))
      }
    }, SAVE_DEBOUNCE)
  }, [tripId])

  const update = useCallback((patch: Partial<TripData>) => {
    setData((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      persistData(next)
      return next
    })
  }, [persistData])

  return { data, loading, update }
}
