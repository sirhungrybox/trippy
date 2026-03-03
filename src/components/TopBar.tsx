import type { Tab, Trip } from '../types'
import { Map, CalendarDays, Wallet, CheckSquare, ChevronLeft } from 'lucide-react'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Map size={15} /> },
  { id: 'itinerary', label: 'Itinerary', icon: <CalendarDays size={15} /> },
  { id: 'budget', label: 'Budget', icon: <Wallet size={15} /> },
  { id: 'checklist', label: 'Checklist', icon: <CheckSquare size={15} /> },
]

export function TopBar({ trip, tab, onTab, onBack }: { trip: Trip; tab: Tab; onTab: (t: Tab) => void; onBack: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: 'var(--color-surface-overlay)' }}>
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-13">
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onBack} className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--color-accent)' }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => onTab('overview')} className="flex items-center gap-2 min-h-[44px]">
            <span className="text-lg">{trip.coverEmoji}</span>
            <span className="text-sm font-semibold truncate max-w-[120px] sm:max-w-[200px]" style={{ color: 'var(--color-text-primary)' }}>{trip.name}</span>
          </button>
        </div>

        {/* Desktop tabs */}
        <div className="hidden sm:flex items-center gap-0.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => onTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px]"
              style={{
                background: tab === t.id ? 'var(--color-accent-muted)' : 'transparent',
                color: tab === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                borderBottom: tab === t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
              }}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
