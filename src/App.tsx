import { useState } from 'react'
import type { Tab, Trip, TripData } from './types'
import { eachDayOfInterval, parseISO, format } from 'date-fns'
import { useSyncedState } from './hooks/useSyncedState'
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
  const [tripDataMap, setTripDataMap] = useSyncedState<Record<string, TripData>>('all-trip-data', {})
  const [tab, setTab] = useState<Tab>('overview')

  const activeTrip = trips.find((t) => t.id === activeTripId) || null
  const tripData = activeTripId ? tripDataMap[activeTripId] || null : null

  const createTrip = (meta: Trip) => {
    const days = eachDayOfInterval({ start: parseISO(meta.startDate), end: parseISO(meta.endDate) }).map((d, i) => ({
      id: `day-${i}`, date: format(d, 'yyyy-MM-dd'), title: `Day ${i + 1}`, location: '', countryEmoji: '',
      activities: [], accommodation: '', notes: '',
    }))
    const data: TripData = { meta, days, budget: [], checklist: [], flights: [] }
    setTrips((prev) => [...prev, meta])
    setTripDataMap((prev) => ({ ...prev, [meta.id]: data }))
    setActiveTripId(meta.id)
    setTab('overview')
  }

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id))
    setTripDataMap((prev) => { const n = { ...prev }; delete n[id]; return n })
    if (activeTripId === id) setActiveTripId(null)
  }

  const updateTrip = (patch: Partial<TripData>) => {
    if (!activeTripId || !tripData) return
    const updated = { ...tripData, ...patch }
    setTripDataMap((prev) => ({ ...prev, [activeTripId]: updated }))
  }

  const goHome = () => { setActiveTripId(null); setTab('overview') }

  if (!activeTrip || !tripData) {
    return <TripHome trips={trips} onCreate={createTrip} onSelect={(id) => { setActiveTripId(id); setTab('overview') }} onDelete={deleteTrip} />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
      <TopBar trip={activeTrip} tab={tab} onTab={setTab} onBack={goHome} />
      <main className="pt-13 pb-20 sm:pb-6">
        <div className="anim-fade-in" key={tab}>
          {tab === 'overview' && <Overview trip={activeTrip} tripData={tripData} update={updateTrip} onTab={setTab} />}
          {tab === 'itinerary' && <Itinerary tripData={tripData} update={updateTrip} />}
          {tab === 'budget' && <Budget tripData={tripData} update={updateTrip} />}
          {tab === 'checklist' && <Checklist tripData={tripData} update={updateTrip} />}
        </div>
      </main>
      <BottomNav tab={tab} onTab={setTab} />
    </div>
  )
}
