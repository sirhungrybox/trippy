import { useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Plus, Trash2, Compass, ArrowRight } from 'lucide-react'
import type { Trip } from '../types'

const emojiOptions = ['🌍', '✈️', '🏔️', '🏖️', '🗼', '🌴', '🎒', '🚗', '🛳️', '🏕️', '🎿', '🌸']

export function TripHome({ trips, onCreate, onSelect, onDelete }: {
  trips: Trip[]; onCreate: (t: Trip) => void; onSelect: (id: string) => void; onDelete: (id: string) => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  return (
    <div className="min-h-screen px-5 py-12 sm:py-16" style={{ background: 'var(--color-surface-base)' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'var(--color-accent-muted)', border: '1px solid var(--color-accent-border)' }}>
            <Compass size={28} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Trippy</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Your trips, all in one place.</p>
        </div>

        {/* Trip list */}
        {trips.length > 0 && (
          <div className="space-y-3 mb-6">
            {trips.map((trip) => {
              const start = new Date(trip.startDate)
              const end = new Date(trip.endDate)
              const totalDays = differenceInDays(end, start) + 1
              const daysUntil = differenceInDays(start, new Date())
              const isActive = daysUntil <= 0 && differenceInDays(new Date(), end) <= 0
              const isPast = differenceInDays(new Date(), end) > 0

              return (
                <div key={trip.id} className="rounded-xl overflow-hidden transition-all"
                  style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}>
                  <button onClick={() => onSelect(trip.id)}
                    className="w-full flex items-center gap-4 p-4 text-left min-h-[72px] active:opacity-80 transition-opacity">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: 'var(--color-accent-glow)' }}>
                      {trip.coverEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{trip.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {format(start, 'MMM d')} — {format(end, 'MMM d, yyyy')} · {totalDays} days
                      </p>
                      <p className="text-xs mt-0.5" style={{
                        color: isActive ? '#34D399' : isPast ? 'var(--color-text-faint)' : 'var(--color-accent)'
                      }}>
                        {isActive ? 'Happening now' : isPast ? 'Completed' : `${daysUntil} days away`}
                      </p>
                    </div>
                    <ArrowRight size={18} style={{ color: 'var(--color-text-faint)' }} />
                  </button>

                  {/* Delete confirmation */}
                  {confirmDelete === trip.id ? (
                    <div className="px-4 pb-3 flex items-center gap-2 anim-fade-in" style={{ borderTop: '1px solid var(--color-surface-overlay)' }}>
                      <p className="text-xs flex-1" style={{ color: 'var(--color-text-muted)' }}>Delete this trip and all its data?</p>
                      <button onClick={() => onDelete(trip.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 active:bg-red-500/25 min-h-[36px]">
                        Delete
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1.5 rounded-lg text-xs min-h-[36px]" style={{ color: 'var(--color-text-muted)' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 pb-3" style={{ borderTop: '1px solid var(--color-surface-overlay)' }}>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(trip.id) }}
                        className="flex items-center gap-1 text-xs py-1 min-h-[32px] transition-colors"
                        style={{ color: 'var(--color-text-faint)' }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Create new trip button / form */}
        {!showCreate ? (
          <button onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] min-h-[56px]"
            style={{ background: 'var(--color-accent)', color: '#0B0A09' }}>
            <Plus size={18} /> New trip
          </button>
        ) : (
          <CreateTripForm onCreate={(t) => { onCreate(t); setShowCreate(false) }} onCancel={() => setShowCreate(false)} />
        )}

        <p className="text-center text-[11px] mt-8" style={{ color: 'var(--color-text-faint)' }}>
          {trips.length} trip{trips.length !== 1 ? 's' : ''} saved on this device.
        </p>
      </div>
    </div>
  )
}

function CreateTripForm({ onCreate, onCancel }: { onCreate: (t: Trip) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [emoji, setEmoji] = useState('🌍')

  const canCreate = name.trim() && start && end

  const handleCreate = () => {
    if (!canCreate) return
    onCreate({ id: crypto.randomUUID(), name: name.trim(), startDate: start, endDate: end, coverEmoji: emoji, countries: [] })
  }

  return (
    <div className="rounded-2xl p-5 space-y-5 anim-fade-in" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>New trip</h2>
        <button onClick={onCancel} className="text-xs py-1 px-2 min-h-[36px]" style={{ color: 'var(--color-text-muted)' }}>Cancel</button>
      </div>

      <div>
        <label className="text-xs block mb-2" style={{ color: 'var(--color-text-secondary)' }}>Icon</label>
        <div className="flex gap-2 flex-wrap">
          {emojiOptions.map((e) => (
            <button key={e} onClick={() => setEmoji(e)}
              className="w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all active:scale-90"
              style={{
                background: emoji === e ? 'var(--color-accent-muted)' : 'var(--color-surface-overlay)',
                border: emoji === e ? '2px solid var(--color-accent-border)' : '2px solid transparent',
              }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Trip name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer in Europe"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-text-faint)')}
          autoFocus />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Start date</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none [color-scheme:dark]"
            style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }} />
        </div>
        <div>
          <label className="text-xs block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>End date</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none [color-scheme:dark]"
            style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }} />
        </div>
      </div>

      <button onClick={handleCreate} disabled={!canCreate}
        className="w-full py-3.5 font-semibold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-30"
        style={{ background: canCreate ? 'var(--color-accent)' : 'var(--color-text-faint)', color: '#0B0A09' }}>
        Create trip
      </button>
    </div>
  )
}
