import { differenceInDays, format, isAfter, isBefore } from 'date-fns'
import { CalendarDays, Wallet, CheckSquare, Plus, Plane, ArrowRight, Trash2 } from 'lucide-react'
import type { Tab, Trip, Flight } from '../types'
import { useSyncedState } from '../hooks/useSyncedState'
import { useState } from 'react'

export function Overview({ trip, onTab }: { trip: Trip; onTab: (t: Tab) => void }) {
  const [flights, setFlights] = useSyncedState<Flight[]>(`trip-flights-${trip.id}`, [])
  const [showAddFlight, setShowAddFlight] = useState(false)

  const start = new Date(trip.startDate)
  const end = new Date(trip.endDate)
  const today = new Date()
  const totalDays = differenceInDays(end, start) + 1
  const daysUntil = differenceInDays(start, today)
  const isActive = isAfter(today, start) && isBefore(today, end)
  const currentDay = isActive ? differenceInDays(today, start) + 1 : 0

  const addFlight = (f: Omit<Flight, 'id'>) => { setFlights((prev) => [...prev, { ...f, id: crypto.randomUUID() }]); setShowAddFlight(false) }
  const removeFlight = (id: string) => setFlights((prev) => prev.filter((f) => f.id !== id))

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8 space-y-5">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden hero-accent topo-pattern" style={{ border: '1px solid var(--color-surface-overlay)' }}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-accent) 30%, var(--color-accent) 70%, transparent 100%)' }} />
        <div className="relative p-6 sm:p-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--color-accent)' }}>
            {daysUntil > 0 ? `${daysUntil} days to go` : isActive ? `Day ${currentDay} of ${totalDays}` : 'Trip complete'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{trip.name}</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {format(start, 'MMM d')} — {format(end, 'MMM d, yyyy')} · {totalDays} days
          </p>
          {/* Stats row */}
          <div className="flex gap-3 mt-5">
            <StatPill label="Days" value={String(totalDays)} />
            <StatPill label="Flights" value={String(flights.length)} />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { tab: 'itinerary' as Tab, icon: <CalendarDays size={22} />, label: 'Itinerary', sub: 'Day-by-day' },
          { tab: 'budget' as Tab, icon: <Wallet size={22} />, label: 'Budget', sub: 'Expenses' },
          { tab: 'checklist' as Tab, icon: <CheckSquare size={22} />, label: 'Checklist', sub: 'Prep list' },
        ]).map((item) => (
          <button key={item.tab} onClick={() => onTab(item.tab)}
            className="flex flex-col items-start gap-3 p-4 rounded-xl transition-all text-left min-h-[80px] active:scale-[0.97]"
            style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}
            onTouchStart={(e) => (e.currentTarget.style.background = 'var(--color-surface-overlay)')}
            onTouchEnd={(e) => (e.currentTarget.style.background = 'var(--color-surface-raised)')}>
            <span style={{ color: 'var(--color-accent)' }}>{item.icon}</span>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--color-text-faint)' }}>{item.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Flights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Flights</h2>
          <button onClick={() => setShowAddFlight(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs min-h-[44px] transition-colors"
            style={{ color: 'var(--color-accent)' }}>
            <Plus size={16} /> Add
          </button>
        </div>

        {flights.length === 0 && !showAddFlight && (
          <button onClick={() => setShowAddFlight(true)}
            className="w-full py-10 rounded-xl text-sm transition-all active:scale-[0.99]"
            style={{ border: '1.5px dashed var(--color-text-faint)', color: 'var(--color-text-faint)' }}>
            <Plane size={24} className="mx-auto mb-2 opacity-40" />
            <span>Add your first flight</span>
          </button>
        )}

        <div className="space-y-2">
          {flights.map((f) => (
            <div key={f.id} className="rounded-xl p-4" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent-muted)' }}>
                    <Plane size={16} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{f.airline} {f.flightNumber}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{f.depDate}</p>
                  </div>
                </div>
                <button onClick={() => removeFlight(f.id)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors active:text-red-400"
                  style={{ color: 'var(--color-text-faint)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-3 pl-11">
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{f.depTime}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>{f.depCode}</p>
                </div>
                <div className="flex-1 h-px relative" style={{ background: 'var(--color-text-faint)' }}>
                  <ArrowRight size={12} className="absolute -right-1 -top-1.5" style={{ color: 'var(--color-text-faint)' }} />
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{f.arrTime}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>{f.arrCode}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showAddFlight && <AddFlightModal onAdd={addFlight} onClose={() => setShowAddFlight(false)} />}
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--color-accent-glow)', border: '1px solid var(--color-accent-border)' }}>
      <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{value}</span>
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    </div>
  )
}

function AddFlightModal({ onAdd, onClose }: { onAdd: (f: Omit<Flight, 'id'>) => void; onClose: () => void }) {
  const [airline, setAirline] = useState('')
  const [num, setNum] = useState('')
  const [depCode, setDepCode] = useState('')
  const [depTime, setDepTime] = useState('')
  const [depDate, setDepDate] = useState('')
  const [arrCode, setArrCode] = useState('')
  const [arrTime, setArrTime] = useState('')
  const [arrDate, setArrDate] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md sm:mx-4 max-h-[85vh] overflow-y-auto anim-fade-in"
        style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }} onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden" style={{ background: 'var(--color-text-faint)' }} />
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Add Flight</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Airline" value={airline} onChange={setAirline} placeholder="Emirates" autoFocus />
            <Inp label="Flight #" value={num} onChange={setNum} placeholder="EK 157" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="From" value={depCode} onChange={setDepCode} placeholder="DXB" />
            <Inp label="Dep. time" value={depTime} onChange={setDepTime} placeholder="08:40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="To" value={arrCode} onChange={setArrCode} placeholder="ARN" />
            <Inp label="Arr. time" value={arrTime} onChange={setArrTime} placeholder="13:45" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Dep. date" value={depDate} onChange={setDepDate} placeholder="" type="date" />
            <Inp label="Arr. date" value={arrDate} onChange={setArrDate} placeholder="" type="date" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => onAdd({ airline, flightNumber: num, depCode, depTime, depDate, arrCode, arrTime, arrDate })}
              className="flex-1 py-3 text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform"
              style={{ background: 'var(--color-accent)', color: '#0B0A09' }}>
              Add flight
            </button>
            <button onClick={onClose} className="px-5 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Inp({ label, value, onChange, placeholder, type = 'text', autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; autoFocus?: boolean
}) {
  return (
    <div>
      <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        className="w-full rounded-xl px-3.5 py-3 text-sm outline-none [color-scheme:dark] transition-colors"
        style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--color-text-faint)')} />
    </div>
  )
}
