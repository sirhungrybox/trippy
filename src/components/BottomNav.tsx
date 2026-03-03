import type { Tab } from '../types'
import { Map, CalendarDays, Wallet, CheckSquare } from 'lucide-react'

const tabs: { id: Tab; label: string; icon: (a: boolean) => React.ReactNode }[] = [
  { id: 'overview', label: 'Home', icon: (a) => <Map size={20} strokeWidth={a ? 2.2 : 1.6} /> },
  { id: 'itinerary', label: 'Plan', icon: (a) => <CalendarDays size={20} strokeWidth={a ? 2.2 : 1.6} /> },
  { id: 'budget', label: 'Budget', icon: (a) => <Wallet size={20} strokeWidth={a ? 2.2 : 1.6} /> },
  { id: 'checklist', label: 'Lists', icon: (a) => <CheckSquare size={20} strokeWidth={a ? 2.2 : 1.6} /> },
]

export function BottomNav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t sm:hidden pb-safe" style={{ borderColor: 'var(--color-surface-overlay)' }}>
      <div className="grid grid-cols-4 h-16">
        {tabs.map((t) => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => onTab(t.id)}
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 relative">
              <span style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-faint)' }}>{t.icon(active)}</span>
              <span className="text-[10px] font-medium" style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-faint)' }}>{t.label}</span>
              {active && <span className="absolute bottom-1.5 w-1 h-1 rounded-full" style={{ background: 'var(--color-accent)' }} />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
