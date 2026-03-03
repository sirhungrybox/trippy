import { useState } from 'react'
import { format, eachDayOfInterval, parseISO, isToday } from 'date-fns'
import { Plus, Trash2, ChevronDown, ChevronUp, Check, MapPin, Bed } from 'lucide-react'
import type { Trip, TripDay, Activity } from '../types'
import { useSyncedState } from '../hooks/useSyncedState'

const dayColors = ['#E8B94A', '#60A5FA', '#34D399', '#F87171', '#A78BFA', '#FB923C', '#2DD4BF', '#F472B6']

function buildEmptyDays(trip: Trip): TripDay[] {
  const days = eachDayOfInterval({ start: parseISO(trip.startDate), end: parseISO(trip.endDate) })
  return days.map((d, i) => ({
    id: `day-${i}`, date: format(d, 'yyyy-MM-dd'), title: `Day ${i + 1}`, location: '', countryEmoji: '',
    activities: [], accommodation: '', notes: '',
  }))
}

export function Itinerary({ trip }: { trip: Trip }) {
  const [days, setDays] = useSyncedState<TripDay[]>(`trip-days-${trip.id}`, buildEmptyDays(trip))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) => setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const expandAll = () => setExpanded(new Set(days.map((d) => d.id)))
  const collapseAll = () => setExpanded(new Set())

  const updateDay = (id: string, patch: Partial<TripDay>) => setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  const addActivity = (dayId: string) => setDays((prev) => prev.map((d) =>
    d.id === dayId ? { ...d, activities: [...d.activities, { id: crypto.randomUUID(), time: '', description: 'New activity', done: false }] } : d
  ))
  const updateActivity = (dayId: string, actId: string, patch: Partial<Activity>) => setDays((prev) => prev.map((d) =>
    d.id === dayId ? { ...d, activities: d.activities.map((a) => (a.id === actId ? { ...a, ...patch } : a)) } : d
  ))
  const removeActivity = (dayId: string, actId: string) => setDays((prev) => prev.map((d) =>
    (d.id === dayId ? { ...d, activities: d.activities.filter((a) => a.id !== actId) } : d)
  ))

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Itinerary</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{days.length} days planned</p>
        </div>
        <div className="flex gap-3 text-xs">
          <button onClick={expandAll} className="py-2 transition-colors" style={{ color: 'var(--color-text-muted)' }}>Expand</button>
          <button onClick={collapseAll} className="py-2 transition-colors" style={{ color: 'var(--color-text-muted)' }}>Collapse</button>
        </div>
      </div>

      <div className="space-y-2">
        {days.map((day, idx) => {
          const isOpen = expanded.has(day.id)
          const doneCount = day.activities.filter((a) => a.done).length
          const color = dayColors[idx % dayColors.length]
          const isTodayDate = isToday(parseISO(day.date))

          return (
            <div key={day.id} className="rounded-xl overflow-hidden transition-all"
              style={{
                background: 'var(--color-surface-raised)',
                border: isTodayDate ? `1.5px solid var(--color-accent)` : '1px solid var(--color-surface-overlay)',
                boxShadow: isTodayDate ? '0 0 20px var(--color-accent-glow)' : 'none',
              }}>
              {/* Header */}
              <button onClick={() => toggle(day.id)} className="w-full flex items-center gap-3 p-4 text-left min-h-[64px] active:opacity-80 transition-opacity">
                {/* Colored left accent */}
                <div className="w-1 h-10 rounded-full shrink-0" style={{ background: color, opacity: 0.7 }} />
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: isTodayDate ? 'var(--color-accent-muted)' : 'var(--color-surface-overlay)',
                    color: isTodayDate ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  }}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {day.countryEmoji && <span>{day.countryEmoji}</span>}
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{format(parseISO(day.date), 'EEE, MMM d')}</span>
                    {isTodayDate && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>TODAY</span>}
                  </div>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{day.title}</p>
                  {day.location && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-text-faint)' }}><MapPin size={10} /> {day.location}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {day.activities.length > 0 && (
                    <span className="text-xs" style={{ color: doneCount === day.activities.length && doneCount > 0 ? '#34D399' : 'var(--color-text-faint)' }}>
                      {doneCount}/{day.activities.length}
                    </span>
                  )}
                  {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-text-faint)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-faint)' }} />}
                </div>
              </button>

              {/* Body */}
              {isOpen && (
                <div className="px-4 pb-5 pt-3 border-t space-y-4 anim-fade-in" style={{ borderColor: 'var(--color-surface-overlay)' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Title" value={day.title} onChange={(v) => updateDay(day.id, { title: v })} />
                    <Field label="Location" value={day.location} onChange={(v) => updateDay(day.id, { location: v })} placeholder="City, Country" />
                  </div>
                  <Field label="Flag / Emoji" value={day.countryEmoji} onChange={(v) => updateDay(day.id, { countryEmoji: v })} placeholder="🇫🇷" className="w-20" />

                  <div>
                    <label className="text-xs block mb-2" style={{ color: 'var(--color-text-muted)' }}>Activities</label>
                    <div className="space-y-1.5">
                      {day.activities.map((act) => (
                        <ActivityRow key={act.id} activity={act} color={color}
                          onToggle={() => updateActivity(day.id, act.id, { done: !act.done })}
                          onUpdate={(p) => updateActivity(day.id, act.id, p)}
                          onRemove={() => removeActivity(day.id, act.id)} />
                      ))}
                    </div>
                    <button onClick={() => addActivity(day.id)}
                      className="flex items-center gap-1.5 text-xs mt-3 py-2 min-h-[44px] transition-colors"
                      style={{ color: 'var(--color-accent)' }}>
                      <Plus size={16} /> Add activity
                    </button>
                  </div>

                  <div>
                    <label className="text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}><Bed size={12} /> Accommodation</label>
                    <input value={day.accommodation} onChange={(e) => updateDay(day.id, { accommodation: e.target.value })}
                      placeholder="Hotel name, address..."
                      className="w-full rounded-xl px-3.5 py-3 text-sm outline-none transition-colors"
                      style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--color-text-faint)')} />
                  </div>

                  <div>
                    <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Notes</label>
                    <textarea value={day.notes} onChange={(e) => updateDay(day.id, { notes: e.target.value })}
                      placeholder="Parking, tips, reminders..." rows={2}
                      className="w-full rounded-xl px-3.5 py-3 text-sm outline-none resize-none transition-colors"
                      style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-text-faint)')} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder = '', className = '' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string
}) {
  return (
    <div>
      <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`rounded-xl px-3.5 py-3 text-sm outline-none transition-colors w-full ${className}`}
        style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--color-text-faint)')} />
    </div>
  )
}

function ActivityRow({ activity, color, onToggle, onUpdate, onRemove }: {
  activity: Activity; color: string; onToggle: () => void; onUpdate: (p: Partial<Activity>) => void; onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [time, setTime] = useState(activity.time)
  const [desc, setDesc] = useState(activity.description)
  const save = () => { onUpdate({ time, description: desc }); setEditing(false) }

  if (editing) {
    return (
      <div className="rounded-xl p-3 space-y-2 anim-fade-in" style={{ background: 'var(--color-surface-overlay)' }}>
        <div className="grid grid-cols-3 gap-2">
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="09:00"
            className="rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' }} />
          <input value={desc} onChange={(e) => setDesc(e.target.value)}
            className="col-span-2 rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' }}
            onKeyDown={(e) => e.key === 'Enter' && save()} autoFocus />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>Save</button>
          <button onClick={() => setEditing(false)} className="px-4 py-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 min-h-[44px]">
      <button onClick={onToggle}
        className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${activity.done ? 'anim-check' : ''}`}
        style={{
          background: activity.done ? '#34D399' : 'transparent',
          borderColor: activity.done ? '#34D399' : 'var(--color-text-faint)',
        }}>
        {activity.done && <Check size={14} color="#0B0A09" />}
      </button>
      <button onClick={() => { setTime(activity.time); setDesc(activity.description); setEditing(true) }}
        className="flex-1 text-left min-h-[44px] flex items-center gap-2">
        {activity.time && <span className="text-xs font-mono shrink-0" style={{ color }}>{activity.time}</span>}
        <span className={`text-sm ${activity.done ? 'line-through' : ''}`} style={{ color: activity.done ? 'var(--color-text-faint)' : 'var(--color-text-secondary)' }}>
          {activity.description}
        </span>
      </button>
      <button onClick={onRemove} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 transition-colors active:text-red-400"
        style={{ color: 'var(--color-text-faint)' }}>
        <Trash2 size={16} />
      </button>
    </div>
  )
}
