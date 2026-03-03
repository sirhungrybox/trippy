import { useState } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import type { ChecklistItem } from '../types'
import { useSyncedState } from '../hooks/useSyncedState'

const defaultGroups = ['Documents', 'Packing', 'Bookings', 'Tech & Gear', 'Before Departure']

export function Checklist() {
  const [items, setItems] = useSyncedState<ChecklistItem[]>('trip-checklist', [])
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newText, setNewText] = useState('')
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [newGroup, setNewGroup] = useState('')

  const groups = [...new Set([...defaultGroups, ...items.map((i) => i.group)])]
  const usedGroups = groups.filter((g) => items.some((i) => i.group === g))
  const emptyGroups = groups.filter((g) => !items.some((i) => i.group === g))

  const total = items.length
  const done = items.filter((i) => i.checked).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const toggleItem = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))
  const toggleGroup = (g: string) => setCollapsed((p) => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n })

  const addItem = (group: string) => {
    if (!newText.trim()) return
    setItems((prev) => [...prev, { id: crypto.randomUUID(), group, text: newText.trim(), checked: false }])
    setNewText(''); setAddingTo(null)
  }

  const addGroup = () => {
    if (!newGroup.trim()) return
    setItems((prev) => [...prev, { id: crypto.randomUUID(), group: newGroup.trim(), text: 'First item', checked: false }])
    setNewGroup(''); setShowAddGroup(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Checklist</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Track your preparation</p>
        </div>
        <button onClick={() => setShowAddGroup(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl active:scale-[0.97] min-h-[44px]"
          style={{ background: 'var(--color-accent)', color: '#0B0A09' }}>
          <Plus size={16} /> Group
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{done} of {total} done</span>
            <span className="text-xs font-bold" style={{ color: pct === 100 ? '#34D399' : 'var(--color-accent)' }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-overlay)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct === 100 ? '#34D399' : 'var(--color-accent)' }} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && !showAddGroup && (
        <div className="text-center py-12">
          <ClipboardList size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-accent)' }} />
          <p className="font-serif text-lg mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nothing here yet</p>
          <p className="text-xs mb-5" style={{ color: 'var(--color-text-faint)' }}>Pick a category to start your checklist</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {defaultGroups.map((g) => (
              <button key={g} onClick={() => { setAddingTo(g); setNewText('') }}
                className="px-4 py-2.5 rounded-xl text-xs min-h-[44px] transition-all active:scale-[0.97]"
                style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)', color: 'var(--color-text-secondary)' }}>
                + {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Groups */}
      <div className="space-y-3">
        {usedGroups.map((group) => {
          const groupItems = items.filter((i) => i.group === group)
          const groupDone = groupItems.filter((i) => i.checked).length
          const isCollapsed = collapsed.has(group)
          const allDone = groupDone === groupItems.length && groupItems.length > 0

          return (
            <div key={group} className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}>
              <button onClick={() => toggleGroup(group)} className="w-full flex items-center justify-between px-4 py-3.5 text-left min-h-[52px] active:opacity-80">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: allDone ? '#34D399' : 'var(--color-text-secondary)' }}>{group}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>{groupDone}/{groupItems.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  {allDone && <Check size={14} color="#34D399" />}
                  {isCollapsed ? <ChevronDown size={14} style={{ color: 'var(--color-text-faint)' }} /> : <ChevronUp size={14} style={{ color: 'var(--color-text-faint)' }} />}
                </div>
              </button>

              {!isCollapsed && (
                <div className="px-4 pb-4 anim-fade-in" style={{ borderTop: '1px solid var(--color-surface-overlay)' }}>
                  <div className="space-y-0.5">
                    {groupItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 min-h-[48px]">
                        <button onClick={() => toggleItem(item.id)}
                          className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${item.checked ? 'anim-check' : ''}`}
                          style={{ background: item.checked ? 'var(--color-accent)' : 'transparent', borderColor: item.checked ? 'var(--color-accent)' : 'var(--color-text-faint)' }}>
                          {item.checked && <Check size={14} color="#0B0A09" />}
                        </button>
                        <span className={`text-sm flex-1 ${item.checked ? 'line-through' : ''}`}
                          style={{ color: item.checked ? 'var(--color-text-faint)' : 'var(--color-text-secondary)' }}>{item.text}</span>
                        <button onClick={() => removeItem(item.id)}
                          className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0 transition-colors active:text-red-400"
                          style={{ color: 'var(--color-text-faint)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {addingTo === group ? (
                    <div className="flex gap-2 mt-3">
                      <input value={newText} onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem(group)}
                        className="flex-1 rounded-xl px-3.5 py-3 text-sm outline-none"
                        style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                        onBlur={(e) => (e.target.style.borderColor = 'var(--color-text-faint)')}
                        placeholder="New item..." autoFocus />
                      <button onClick={() => addItem(group)}
                        className="px-4 py-3 rounded-xl text-xs min-h-[44px] font-medium"
                        style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>Add</button>
                    </div>
                  ) : (
                    <button onClick={() => { setAddingTo(group); setNewText('') }}
                      className="flex items-center gap-1.5 text-xs mt-3 py-2 min-h-[44px] transition-colors"
                      style={{ color: 'var(--color-accent)' }}>
                      <Plus size={16} /> Add item
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick-add unused groups */}
      {emptyGroups.length > 0 && total > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {emptyGroups.map((g) => (
            <button key={g} onClick={() => { setAddingTo(g); setNewText('') }}
              className="px-3.5 py-2 rounded-xl text-xs min-h-[40px] transition-colors"
              style={{ border: '1px solid var(--color-surface-overlay)', color: 'var(--color-text-faint)' }}>
              + {g}
            </button>
          ))}
        </div>
      )}

      {/* Add group modal */}
      {showAddGroup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAddGroup(false)}>
          <div className="rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-xs sm:mx-4 anim-fade-in"
            style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }} onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden" style={{ background: 'var(--color-text-faint)' }} />
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>New Group</h3>
            <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGroup()}
              className="w-full rounded-xl px-3.5 py-3 text-sm outline-none mb-3"
              style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-text-faint)')}
              placeholder="e.g. Medicine, Clothing..." autoFocus />
            <button onClick={addGroup}
              className="w-full py-3.5 text-sm font-semibold rounded-xl active:scale-[0.98]"
              style={{ background: 'var(--color-accent)', color: '#0B0A09' }}>
              Create group
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
