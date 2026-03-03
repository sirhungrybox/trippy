import { useState } from 'react'
import type { Tab, Trip } from '../types'
import { Map, CalendarDays, Wallet, CheckSquare, ChevronLeft, Share2, Check, Eye, LogIn } from 'lucide-react'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Map size={15} /> },
  { id: 'itinerary', label: 'Itinerary', icon: <CalendarDays size={15} /> },
  { id: 'budget', label: 'Budget', icon: <Wallet size={15} /> },
  { id: 'checklist', label: 'Checklist', icon: <CheckSquare size={15} /> },
]

export function TopBar({ trip, tab, onTab, onBack, isViewOnly, onLogin }: {
  trip: Trip; tab: Tab; onTab: (t: Tab) => void; onBack: () => void; isViewOnly?: boolean; onLogin?: () => void
}) {
  const [copied, setCopied] = useState(false)

  const share = () => {
    const url = `${window.location.origin}/trip/${trip.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: 'var(--color-surface-overlay)' }}>
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-13">
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onBack} className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center" style={{ color: 'var(--color-accent)' }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => onTab('overview')} className="flex items-center gap-2 min-h-[44px]">
            <span className="text-lg">{trip.coverEmoji}</span>
            <span className="text-sm font-semibold truncate max-w-[100px] sm:max-w-[180px]" style={{ color: 'var(--color-text-primary)' }}>{trip.name}</span>
          </button>
          {isViewOnly && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ml-1"
              style={{ background: 'var(--color-surface-overlay)', color: 'var(--color-text-muted)' }}>
              <Eye size={10} /> View only
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Share button — always visible */}
          <button onClick={share} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors"
            style={{ color: copied ? '#34D399' : 'var(--color-accent)' }}>
            {copied ? <Check size={16} /> : <Share2 size={16} />}
          </button>

          {/* Login button for anonymous viewers */}
          {isViewOnly && onLogin && (
            <button onClick={onLogin} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium min-h-[44px]"
              style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
              <LogIn size={14} /> Sign in
            </button>
          )}

          {/* Desktop tabs */}
          <div className="hidden sm:flex items-center gap-0.5 ml-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => onTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px]"
                style={{
                  background: tab === t.id ? 'var(--color-accent-muted)' : 'transparent',
                  color: tab === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}>
                {t.icon}<span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
