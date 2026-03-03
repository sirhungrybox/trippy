import { useState } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronUp, Receipt } from 'lucide-react'
import type { BudgetItem, TripData } from '../types'

const defaultCategories = ['Flights', 'Accommodation', 'Transport', 'Food & Dining', 'Activities', 'Shopping', 'Insurance', 'Other']
const currencies = ['USD', 'EUR', 'GBP', 'CHF', 'AED', 'SEK', 'JPY', 'AUD', 'CAD', 'INR', 'THB']

export function Budget({ tripData, update }: { tripData: TripData; update: (p: Partial<TripData>) => void }) {
  const items = tripData.budget
  const setItems = (fn: (prev: BudgetItem[]) => BudgetItem[]) => update({ budget: fn(items) })
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState('all')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const categories = [...new Set([...defaultCategories, ...items.map((i) => i.category)])]
  const filtered = filterCat === 'all' ? items : items.filter((i) => i.category === filterCat)
  const grouped = categories.map((c) => ({ name: c, items: filtered.filter((i) => i.category === c) })).filter((g) => g.items.length > 0)

  const total = items.reduce((s, i) => s + i.amount, 0)
  const paidTotal = items.filter((i) => i.paid).reduce((s, i) => s + i.amount, 0)
  const pct = total > 0 ? Math.round((paidTotal / total) * 100) : 0

  const addItem = (item: Omit<BudgetItem, 'id'>) => { setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]); setShowAdd(false) }
  const updateItem = (id: string, patch: Partial<BudgetItem>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))
  const toggleCat = (n: string) => setCollapsed((p) => { const s = new Set(p); s.has(n) ? s.delete(n) : s.add(n); return s })

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Budget</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{items.length} expenses tracked</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl active:scale-[0.97] min-h-[44px]"
          style={{ background: 'var(--color-accent)', color: '#0B0A09' }}>
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
        <div className="rounded-xl p-3 sm:p-4" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Total</p>
          <p className="text-base sm:text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{fmt(total)}</p>
        </div>
        <div className="rounded-xl p-3 sm:p-4" style={{ background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Paid</p>
          <p className="text-base sm:text-lg font-bold text-emerald-400">{fmt(paidTotal)}</p>
        </div>
        <div className="rounded-xl p-3 sm:p-4" style={{ background: 'var(--color-accent-glow)', border: '1px solid var(--color-accent-border)' }}>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Unpaid</p>
          <p className="text-base sm:text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{fmt(total - paidTotal)}</p>
        </div>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="rounded-xl p-3 mb-5" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{items.filter(i => i.paid).length} of {items.length} paid</span>
            <span className="text-xs font-semibold text-emerald-400">{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-overlay)' }}>
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4">
        <Pill active={filterCat === 'all'} onClick={() => setFilterCat('all')}>All</Pill>
        {categories.filter((c) => items.some((i) => i.category === c)).map((c) => (
          <Pill key={c} active={filterCat === c} onClick={() => setFilterCat(c)}>{c}</Pill>
        ))}
      </div>

      {/* Empty state */}
      {grouped.length === 0 && !showAdd && (
        <button onClick={() => setShowAdd(true)}
          className="w-full py-12 rounded-xl text-sm transition-all active:scale-[0.99]"
          style={{ border: '1.5px dashed var(--color-text-faint)', color: 'var(--color-text-faint)' }}>
          <Receipt size={28} className="mx-auto mb-2 opacity-40" />
          <p className="font-serif text-base" style={{ color: 'var(--color-text-muted)' }}>No expenses yet</p>
          <p className="text-xs mt-1">Start tracking your trip budget</p>
        </button>
      )}

      <div className="space-y-3">
        {grouped.map((group) => {
          const groupTotal = group.items.reduce((s, i) => s + i.amount, 0)
          const groupPaid = group.items.filter(i => i.paid).reduce((s, i) => s + i.amount, 0)
          const isCollapsed = collapsed.has(group.name)
          return (
            <div key={group.name} className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }}>
              <button onClick={() => toggleCat(group.name)} className="w-full flex items-center justify-between px-4 py-3.5 text-left min-h-[52px] active:opacity-80">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{group.name}</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-faint)' }}>{group.items.filter(i => i.paid).length}/{group.items.length} paid</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-medium block" style={{ color: 'var(--color-text-primary)' }}>{fmt(groupTotal)}</span>
                    {groupPaid > 0 && groupPaid < groupTotal && (
                      <span className="text-[10px] text-emerald-400">{fmt(groupPaid)} paid</span>
                    )}
                  </div>
                  {isCollapsed ? <ChevronDown size={14} style={{ color: 'var(--color-text-faint)' }} /> : <ChevronUp size={14} style={{ color: 'var(--color-text-faint)' }} />}
                </div>
              </button>
              {!isCollapsed && (
                <div className="px-4 pb-3 space-y-1 anim-fade-in" style={{ borderTop: '1px solid var(--color-surface-overlay)' }}>
                  {group.items.map((item) =>
                    editingId === item.id
                      ? <EditRow key={item.id} item={item} onSave={(p) => { updateItem(item.id, p); setEditingId(null) }} onCancel={() => setEditingId(null)} />
                      : <ItemRow key={item.id} item={item} onEdit={() => setEditingId(item.id)} onTogglePaid={() => updateItem(item.id, { paid: !item.paid })} onRemove={() => removeItem(item.id)} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showAdd && <AddModal categories={categories} onAdd={addItem} onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function fmt(n: number) { return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function Pill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap min-h-[36px] transition-colors"
      style={{
        background: active ? 'var(--color-accent-muted)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-text-faint)',
      }}>{children}</button>
  )
}

function ItemRow({ item, onEdit, onTogglePaid, onRemove }: {
  item: BudgetItem; onEdit: () => void; onTogglePaid: () => void; onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 min-h-[52px] py-1">
      <button onClick={onTogglePaid}
        className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${item.paid ? 'anim-check' : ''}`}
        style={{ background: item.paid ? '#34D399' : 'transparent', borderColor: item.paid ? '#34D399' : 'var(--color-text-faint)' }}>
        {item.paid && <Check size={14} color="#0B0A09" />}
      </button>
      <button onClick={onEdit} className="flex-1 text-left min-h-[44px] flex flex-col justify-center">
        <p className={`text-sm ${item.paid ? 'line-through' : ''}`} style={{ color: item.paid ? 'var(--color-text-faint)' : 'var(--color-text-primary)' }}>{item.name}</p>
        {item.notes && <p className="text-xs truncate" style={{ color: 'var(--color-text-faint)' }}>{item.notes}</p>}
      </button>
      <p className="text-sm font-medium shrink-0" style={{ color: item.paid ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
        {fmt(item.amount)} <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{item.currency}</span>
      </p>
      <button onClick={onRemove} className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0 transition-colors active:text-red-400"
        style={{ color: 'var(--color-text-faint)' }}>
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function EditRow({ item, onSave, onCancel }: { item: BudgetItem; onSave: (p: Partial<BudgetItem>) => void; onCancel: () => void }) {
  const [name, setName] = useState(item.name)
  const [amount, setAmount] = useState(String(item.amount))
  const [notes, setNotes] = useState(item.notes)
  return (
    <div className="rounded-xl p-3 space-y-2 anim-fade-in" style={{ background: 'var(--color-surface-overlay)' }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' }} autoFocus />
      <div className="grid grid-cols-2 gap-2">
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount"
          className="rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' }} />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes"
          className="rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' }} />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ name, amount: Number(amount), notes })}
          className="px-4 py-2.5 rounded-lg text-xs font-medium" style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>Save</button>
        <button onClick={onCancel} className="px-4 py-2.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>Cancel</button>
      </div>
    </div>
  )
}

function AddModal({ categories, onAdd, onClose }: { categories: string[]; onAdd: (i: Omit<BudgetItem, 'id'>) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [category, setCategory] = useState(categories[0])
  const [notes, setNotes] = useState('')
  const [paid, setPaid] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-sm sm:mx-4 max-h-[90vh] overflow-y-auto anim-fade-in"
        style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-overlay)' }} onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden" style={{ background: 'var(--color-text-faint)' }} />
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Add Expense</h3>
        <div className="space-y-3">
          <Inp label="Name" value={name} onChange={setName} placeholder="Hotel, dinner..." autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Amount" value={amount} onChange={setAmount} placeholder="0.00" type="number" />
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl px-3.5 py-3 text-sm outline-none [color-scheme:dark]"
                style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}>
                {currencies.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl px-3.5 py-3 text-sm outline-none [color-scheme:dark]"
              style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-text-faint)', color: 'var(--color-text-primary)' }}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Inp label="Notes (optional)" value={notes} onChange={setNotes} placeholder="" />
          <button onClick={() => setPaid(!paid)}
            className="w-full flex items-center justify-between py-3 px-3.5 rounded-xl min-h-[48px] transition-colors"
            style={{
              background: paid ? 'rgba(52, 211, 153, 0.08)' : 'var(--color-surface-overlay)',
              border: paid ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid var(--color-text-faint)',
              color: paid ? '#34D399' : 'var(--color-text-muted)',
            }}>
            <span className="text-sm">Already paid</span>
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all`}
              style={{ background: paid ? '#34D399' : 'transparent', borderColor: paid ? '#34D399' : 'var(--color-text-faint)' }}>
              {paid && <Check size={14} color="#0B0A09" />}
            </div>
          </button>
          <button onClick={() => { if (name && amount) onAdd({ name, amount: Number(amount), currency, category, notes, paid }) }}
            className="w-full py-3.5 text-sm font-semibold rounded-xl active:scale-[0.98]"
            style={{ background: 'var(--color-accent)', color: '#0B0A09' }}>
            Add expense
          </button>
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
