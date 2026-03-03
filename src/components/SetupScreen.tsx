import { useState } from 'react'
import type { Trip } from '../types'
import { Compass } from 'lucide-react'

const emojiOptions = ['🌍', '✈️', '🏔️', '🏖️', '🗼', '🌴', '🎒', '🚗', '🛳️', '🏕️', '🎿', '🌸']

export function SetupScreen({ onCreate }: { onCreate: (trip: Trip) => void }) {
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
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--color-surface-base)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'var(--color-accent-muted)', border: '1px solid var(--color-accent-border)' }}>
            <Compass size={28} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Trippy</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Plan your journey. Track every detail.</p>
        </div>

        <div className="rounded-2xl p-5 sm:p-6 space-y-5" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}>
          <div>
            <label className="text-xs block mb-2.5" style={{ color: 'var(--color-text-secondary)' }}>Choose an icon</label>
            <div className="flex gap-2.5 flex-wrap">
              {emojiOptions.map((e) => (
                <button key={e} onClick={() => setEmoji(e)}
                  className="w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: emoji === e ? 'var(--color-accent-muted)' : 'var(--color-surface-overlay)',
                    border: emoji === e ? '2px solid var(--color-accent-border)' : '2px solid transparent',
                    transform: emoji === e ? 'scale(1.05)' : 'scale(1)',
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
            className="w-full py-3.5 font-semibold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: canCreate ? 'var(--color-accent)' : 'var(--color-text-faint)', color: '#0B0A09' }}>
            Create trip
          </button>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'var(--color-text-faint)' }}>Your data is saved locally on this device.</p>
      </div>
    </div>
  )
}
