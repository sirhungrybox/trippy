import { useState } from 'react'
import type { Tab, Trip } from './types'
import { useSyncedState } from './hooks/useSyncedState'
import { isFirebaseConfigured } from './firebase'
import { BottomNav } from './components/BottomNav'
import { TopBar } from './components/TopBar'
import { TripHome } from './components/TripHome'
import { Overview } from './components/Overview'
import { Itinerary } from './components/Itinerary'
import { Budget } from './components/Budget'
import { Checklist } from './components/Checklist'

export default function App() {
  const [trips, setTrips] = useSyncedState<Trip[]>('all-trips', [])
  const [activeTripId, setActiveTripId] = useSyncedState<string | null>('active-trip-id', null)
  const [tab, setTab] = useState<Tab>('overview')

  const activeTrip = trips.find((t) => t.id === activeTripId) || null

  const createTrip = (trip: Trip) => {
    setTrips((prev) => [...prev, trip])
    setActiveTripId(trip.id)
    setTab('overview')
  }

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id))
    // Clean up this trip's data from localStorage
    const keys = [`trip-days-${id}`, `trip-budget-${id}`, `trip-checklist-${id}`, `trip-flights-${id}`]
    keys.forEach((k) => localStorage.removeItem(k))
    if (activeTripId === id) setActiveTripId(null)
  }

  const goHome = () => { setActiveTripId(null); setTab('overview') }

  // No active trip — show trip selector
  if (!activeTrip) {
    return <TripHome trips={trips} onCreate={createTrip} onSelect={(id) => { setActiveTripId(id); setTab('overview') }} onDelete={deleteTrip} />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
      <TopBar trip={activeTrip} tab={tab} onTab={setTab} onBack={goHome} />
      <main className="pt-13 pb-20 sm:pb-6">
        <div className="anim-fade-in" key={tab}>
          {tab === 'overview' && <Overview trip={activeTrip} onTab={setTab} />}
          {tab === 'itinerary' && <Itinerary trip={activeTrip} />}
          {tab === 'budget' && <Budget tripId={activeTrip.id} />}
          {tab === 'checklist' && <Checklist tripId={activeTrip.id} />}
        </div>
      </main>
      <BottomNav tab={tab} onTab={setTab} />
      <div className="fixed bottom-21 sm:bottom-4 right-4 flex items-center gap-1.5 text-[10px] z-10" style={{ color: 'var(--color-text-faint)' }}>
        <div className={`w-1.5 h-1.5 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500 anim-pulse' : ''}`} style={!isFirebaseConfigured ? { background: 'var(--color-text-faint)' } : {}} />
        {isFirebaseConfigured ? 'Synced' : 'Local'}
      </div>
    </div>
  )
}
