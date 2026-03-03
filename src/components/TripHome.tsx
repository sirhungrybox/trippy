import { useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Plus, Trash2, Compass, ArrowRight, LogOut, Share2, Check } from 'lucide-react'
import type { User } from 'firebase/auth'
import type { Trip } from '../types'

const emojiOptions = ['🌍', '✈️', '🏔️', '🏖️', '🗼', '🌴', '🎒', '🚗', '🛳️', '🏕️', '🎿', '🌸']

export function TripHome({ user, trips, onCreate, onSelect, onDelete, onLogout }: {
  user: User; trips: Trip[]; onCreate: (t: Omit<Trip, 'ownerId' | 'ownerName' | 'ownerPhoto'>) => void
  onSelect: (id: string) => void; onDelete: (id: string) => void; onLogout: () => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const shareTrip = (tripId: string) => {
    const url = `${window.location.origin}/trip/${tripId}`
    navigator.clipboard.writeText(url)
    setCopiedId(tripId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen px-5 py-8 sm:py-12" style={{ background: 'var(--color-surface-base)' }}>
      <div className="max-w-lg mx-auto">
        {/* User header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
                {(user.displayName || 'U')[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{user.displayName || 'Traveler'}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--color-text-faint)' }}>
            <LogOut size={18} />
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Your Trips</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
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
                <div key={trip.id} className="rounded-xl overflow-hidden"
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

                  {/* Actions */}
                  <div className="px-4 pb-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--color-surface-overlay)' }}>
                    <button onClick={() => shareTrip(trip.id)}
                      className="flex items-center gap-1.5 text-xs py-1.5 min-h-[32px] transition-colors"
                      style={{ color: copiedId === trip.id ? '#34D399' : 'var(--color-accent)' }}>
                      {copiedId === trip.id ? <><Check size={12} /> Link copied!</> : <><Share2 size={12} /> Share</>}
                    </button>
                    <span style={{ color: 'var(--color-text-faint)' }}>·</span>
                    {confirmDelete === trip.id ? (
                      <div className="flex items-center gap-2 anim-fade-in">
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Delete?</span>
                        <button onClick={() => onDelete(trip.id)} className="text-xs text-red-400 font-medium min-h-[32px]">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs min-h-[32px]" style={{ color: 'var(--color-text-muted)' }}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(trip.id)}
                        className="flex items-center gap-1 text-xs py-1.5 min-h-[32px] transition-colors"
                        style={{ color: 'var(--color-text-faint)' }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {trips.length === 0 && !showCreate && (
          <div className="text-center py-12 mb-6">
            <Compass size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-accent)' }} />
            <p className="font-serif text-lg mb-1" style={{ color: 'var(--color-text-secondary)' }}>No trips yet</p>
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>Create your first trip to get started</p>
          </div>
        )}

        {/* Create */}
        {!showCreate ? (
          <button onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] min-h-[56px]"
            style={{ background: 'var(--color-accent)', color: '#0B0A09' }}>
            <Plus size={18} /> New trip
          </button>
        ) : (
          <CreateForm onCreate={(t) => { onCreate(t); setShowCreate(false) }} onCancel={() => setShowCreate(false)} />
        )}
      </div>
    </div>
  )
}

function CreateForm({ onCreate, onCancel }: { onCreate: (t: Omit<Trip, 'ownerId' | 'ownerName' | 'ownerPhoto'>) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [emoji, setEmoji] = useState('🌍')
  const canCreate = name.trim() && start && end

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
              style={{ background: emoji === e ? 'var(--color-accent-muted)' : 'var(--color-surface-overlay)', border: emoji === e ? '2px solid var(--color-accent-border)' : '2px solid transparent' }}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Trip name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer in Europe"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')} onBlur={(e) => (e.target.style.borderColor = 'var(--color-text-faint)')} autoFocus />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Start</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none [color-scheme:dark]"
            style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }} />
        </div>
        <div>
          <label className="text-xs block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>End</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none [color-scheme:dark]"
            style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }} />
        </div>
      </div>
      <button onClick={() => { if (canCreate) onCreate({ id: crypto.randomUUID(), name: name.trim(), startDate: start, endDate: end, coverEmoji: emoji, countries: [] }) }}
        disabled={!canCreate}
        className="w-full py-3.5 font-semibold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-30"
        style={{ background: canCreate ? 'var(--color-accent)' : 'var(--color-text-faint)', color: '#0B0A09' }}>
        Create trip
      </button>
    </div>
  )
}
