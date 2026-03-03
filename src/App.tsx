import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import type { Tab, Trip, TripData } from './types'
import { eachDayOfInterval, parseISO, format } from 'date-fns'
import { isFirebaseConfigured, onAuth, signInWithGoogle, handleRedirectResult, logOut, saveTrip, subscribeUserTrips, deleteTrip as fbDeleteTrip, loadTrip } from './firebase'
import { useTripStore } from './hooks/useTripStore'
import { BottomNav } from './components/BottomNav'
import { TopBar } from './components/TopBar'
import { TripHome } from './components/TripHome'
import { LoginScreen } from './components/LoginScreen'
import { Overview } from './components/Overview'
import { Itinerary } from './components/Itinerary'
import { Budget } from './components/Budget'
import { Checklist } from './components/Checklist'
import { Loader2 } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [trips, setTrips] = useState<Trip[]>([])
  const [activeTripId, setActiveTripId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [isViewOnly, setIsViewOnly] = useState(false)

  const { data: tripData, loading: tripLoading, update: updateTrip } = useTripStore(activeTripId)

  // Check URL for shared trip link on mount
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/^\/trip\/(.+)$/)
    if (match) {
      setActiveTripId(match[1])
      setIsViewOnly(true) // Will be updated once we know the user
    }
    // Also handle hash-based
    const hash = window.location.hash
    const hashMatch = hash.match(/^#\/trip\/(.+)$/)
    if (hashMatch) {
      setActiveTripId(hashMatch[1])
      setIsViewOnly(true)
    }
  }, [])

  // Auth listener
  useEffect(() => {
    if (!isFirebaseConfigured) { setAuthLoading(false); return }
    const unsub = onAuth((u) => {
      setUser(u)
      setAuthLoading(false)
      // If viewing a shared trip, check if we're the owner
      if (u && activeTripId) {
        loadTrip(activeTripId).then((d) => {
          if (d && (d.meta as Trip)?.ownerId === u.uid) setIsViewOnly(false)
        })
      }
    })
    return unsub
  }, [activeTripId])

  // Load user's trips from Firestore
  useEffect(() => {
    if (!user || !isFirebaseConfigured) return
    const unsub = subscribeUserTrips(user.uid, (raw) => {
      setTrips(raw.map((r) => (r.meta as Trip) || r) as Trip[])
    })
    return unsub
  }, [user])

  // Update isViewOnly when we know both user and trip
  useEffect(() => {
    if (user && tripData?.meta) {
      setIsViewOnly(tripData.meta.ownerId !== user.uid)
    }
  }, [user, tripData])

  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoginError(null)
    try {
      await signInWithGoogle()
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string }
      setLoginError(err.message || 'Sign in failed. Please try again.')
    }
  }

  // Handle redirect result (for mobile fallback)
  useEffect(() => {
    handleRedirectResult().catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logOut()
    setUser(null)
    setTrips([])
    setActiveTripId(null)
  }

  const createTrip = async (meta: Omit<Trip, 'ownerId' | 'ownerName' | 'ownerPhoto'>) => {
    if (!user) return
    const trip: Trip = {
      ...meta,
      ownerId: user.uid,
      ownerName: user.displayName || '',
      ownerPhoto: user.photoURL || '',
    }
    const days = eachDayOfInterval({ start: parseISO(trip.startDate), end: parseISO(trip.endDate) }).map((d, i) => ({
      id: `day-${i}`, date: format(d, 'yyyy-MM-dd'), title: `Day ${i + 1}`, location: '', countryEmoji: '',
      activities: [], accommodation: '', notes: '',
    }))
    const tripData: TripData = { meta: trip, days, budget: [], checklist: [], flights: [] }

    if (isFirebaseConfigured) {
      await saveTrip(trip.id, tripData as unknown as Record<string, unknown>)
    } else {
      localStorage.setItem(`trip-${trip.id}`, JSON.stringify(tripData))
    }
    setActiveTripId(trip.id)
    setIsViewOnly(false)
    setTab('overview')
  }

  const deleteTrip = async (id: string) => {
    if (isFirebaseConfigured) {
      await fbDeleteTrip(id)
    } else {
      localStorage.removeItem(`trip-${id}`)
    }
    if (activeTripId === id) setActiveTripId(null)
  }

  const goHome = () => {
    setActiveTripId(null)
    setIsViewOnly(false)
    setTab('overview')
    // Clear shared trip URL
    if (window.location.pathname !== '/' || window.location.hash) {
      window.history.pushState(null, '', '/')
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-base)' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    )
  }

  // Not logged in + not viewing shared trip → login screen
  if (!user && !activeTripId) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />
  }

  // Not logged in but viewing a shared trip
  if (!user && activeTripId && tripData) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
        <TopBar trip={tripData.meta} tab={tab} onTab={setTab} onBack={goHome} isViewOnly onLogin={handleLogin} />
        <main className="pt-13 pb-20 sm:pb-6">
          <SharedTripView tripData={tripData} tab={tab} onTab={setTab} />
        </main>
        <BottomNav tab={tab} onTab={setTab} />
      </div>
    )
  }

  // Logged in, no active trip → trip home
  if (user && !activeTripId) {
    return <TripHome user={user} trips={trips} onCreate={createTrip} onSelect={(id) => { setActiveTripId(id); setIsViewOnly(false); setTab('overview') }} onDelete={deleteTrip} onLogout={handleLogout} />
  }

  // Loading trip data
  if (tripLoading || !tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-base)' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    )
  }

  // Active trip view
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
      <TopBar trip={tripData.meta} tab={tab} onTab={setTab} onBack={goHome} isViewOnly={isViewOnly} />
      <main className="pt-13 pb-20 sm:pb-6">
        <div className="anim-fade-in" key={tab}>
          {tab === 'overview' && <Overview trip={tripData.meta} tripData={tripData} update={updateTrip} onTab={setTab} isViewOnly={isViewOnly} />}
          {tab === 'itinerary' && <Itinerary tripData={tripData} update={updateTrip} isViewOnly={isViewOnly} />}
          {tab === 'budget' && <Budget tripData={tripData} update={updateTrip} isViewOnly={isViewOnly} />}
          {tab === 'checklist' && <Checklist tripData={tripData} update={updateTrip} isViewOnly={isViewOnly} />}
        </div>
      </main>
      <BottomNav tab={tab} onTab={setTab} />
    </div>
  )
}

function SharedTripView({ tripData, tab, onTab }: { tripData: TripData; tab: Tab; onTab: (t: Tab) => void }) {
  const noop = () => {}
  return (
    <div className="anim-fade-in" key={tab}>
      {tab === 'overview' && <Overview trip={tripData.meta} tripData={tripData} update={noop} onTab={onTab} isViewOnly />}
      {tab === 'itinerary' && <Itinerary tripData={tripData} update={noop} isViewOnly />}
      {tab === 'budget' && <Budget tripData={tripData} update={noop} isViewOnly />}
      {tab === 'checklist' && <Checklist tripData={tripData} update={noop} isViewOnly />}
    </div>
  )
}
