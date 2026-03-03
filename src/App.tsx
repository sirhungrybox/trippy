import { useState } from 'react'
import type { Tab, Trip } from './types'
import { useSyncedState } from './hooks/useSyncedState'
import { isFirebaseConfigured } from './firebase'
import { BottomNav } from './components/BottomNav'
import { TopBar } from './components/TopBar'
import { SetupScreen } from './components/SetupScreen'
import { Overview } from './components/Overview'
import { Itinerary } from './components/Itinerary'
import { Budget } from './components/Budget'
import { Checklist } from './components/Checklist'

export default function App() {
  const [trip, setTrip] = useSyncedState<Trip | null>('trip-meta', null)
  const [tab, setTab] = useState<Tab>('overview')

  if (!trip) return <SetupScreen onCreate={setTrip} />

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
      <TopBar trip={trip} tab={tab} onTab={setTab} onReset={() => setTrip(null)} />
      <main className="pt-13 pb-20 sm:pb-6">
        <div className="anim-fade-in" key={tab}>
          {tab === 'overview' && <Overview trip={trip} onTab={setTab} />}
          {tab === 'itinerary' && <Itinerary trip={trip} />}
          {tab === 'budget' && <Budget />}
          {tab === 'checklist' && <Checklist />}
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
