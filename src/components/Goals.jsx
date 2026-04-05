import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Pencil,
} from 'lucide-react'
import { useToastStore } from './ToastContainer'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}
const fadeUp = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
}

function ProgressRing({ pct, size = 80, stroke = 5, isDark }) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const capped = Math.min(pct, 100)
  const color =
    capped >= 100
      ? isDark ? '#22c55e' : '#16a34a'
      : isDark ? '#f59e0b' : '#b45309'

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={isDark ? '#1c1c1e' : '#edede8'} strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (circ * capped) / 100 }}
        transition={{ duration: 0.6 }}
      />
    </svg>
  )
}

const defaultGoals = [
  { id: 1, name: 'Emergency Fund', target: 10000, saved: 6240, deadline: '2026-09-01', icon: '\uD83D\uDEDF' },
  { id: 2, name: 'Japan Trip', target: 3500, saved: 1800, deadline: '2026-12-15', icon: '\u2708\uFE0F' },
  { id: 3, name: 'New MacBook Pro', target: 2500, saved: 2500, deadline: '2026-06-01', icon: '\uD83D\uDCBB' },
  { id: 4, name: 'Car Down Payment', target: 8000, saved: 2100, deadline: '2027-03-01', icon: '\uD83D\uDE97' },
]

function loadGoals() {
  try { const s = localStorage.getItem('centra-goals'); return s ? JSON.parse(s) : defaultGoals } catch { return defaultGoals }
}
function saveGoals(goals) { localStorage.setItem('centra-goals', JSON.stringify(goals)) }

export default function Goals() {
  const { theme, role } = useStore()
  const isDark = theme === 'dark'
  const isAdmin = role === 'admin'
  const addToast = useToastStore((s) => s.addToast)
  const [goals, setGoals] = useState(loadGoals)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', target: '', saved: '', deadline: '', icon: '\uD83C\uDFAF' })

  const updateGoals = (g) => { setGoals(g); saveGoals(g) }
  const openNew = () => { setForm({ name: '', target: '', saved: '0', deadline: '', icon: '\uD83C\uDFAF' }); setEditId(null); setShowForm(true) }
  const openEdit = (goal) => { setForm({ name: goal.name, target: String(goal.target), saved: String(goal.saved), deadline: goal.deadline, icon: goal.icon }); setEditId(goal.id); setShowForm(true) }
  const submitForm = () => {
    if (!form.name.trim() || !form.target) return
    if (editId) {
      updateGoals(goals.map((g) => g.id === editId ? { ...g, name: form.name.trim(), target: Number(form.target), saved: Number(form.saved || 0), deadline: form.deadline, icon: form.icon } : g))
      addToast(`Updated "${form.name.trim()}"`, 'success')
    } else {
      const maxId = goals.reduce((max, g) => Math.max(max, g.id), 0)
      updateGoals([...goals, { id: maxId + 1, name: form.name.trim(), target: Number(form.target), saved: Number(form.saved || 0), deadline: form.deadline, icon: form.icon }])
      addToast(`Created "${form.name.trim()}"`, 'success')
    }
    setShowForm(false)
  }
  const deleteGoal = (id) => { const g = goals.find((g) => g.id === id); updateGoals(goals.filter((g) => g.id !== id)); addToast(`Deleted "${g?.name}"`, 'warning') }

  const totalTarget = goals.reduce((s, g) => s + g.target, 0)
  const totalSaved = goals.reduce((s, g) => s + Math.min(g.saved, g.target), 0)
  const completedCount = goals.filter((g) => g.saved >= g.target).length

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      {/* Hero */}
      <section className="px-6 md:px-10 lg:px-16 mb-12">
        <motion.p variants={fadeUp} className={`text-lg mb-4 ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
          {formatCurrency(totalSaved)} saved of {formatCurrency(totalTarget)}.
        </motion.p>
        <motion.div variants={fadeUp} className="flex items-end justify-between flex-wrap gap-4">
          <h1 className={`font-display font-[700] text-4xl sm:text-5xl md:text-6xl tracking-[-0.03em] ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
            Goals
          </h1>
          {isAdmin && (
            <button onClick={openNew} className="pill-filled flex items-center gap-2 px-5 py-2.5 text-sm">
              <Plus size={15} /> New Goal
            </button>
          )}
        </motion.div>
      </section>

      {/* Stat strip */}
      <motion.section variants={fadeUp} className="px-6 md:px-10 lg:px-16 mb-14">
        <div className="glass rounded-lg overflow-hidden">
          <div className="grid grid-cols-3">
            {[
              { label: 'Total Target', value: formatCurrency(totalTarget) },
              { label: 'Total Saved', value: formatCurrency(totalSaved) },
              { label: 'Completed', value: `${completedCount} / ${goals.length}` },
            ].map((item) => (
              <div key={item.label} className="stat-card px-5 py-6 md:px-6 md:py-7">
                <p className={`font-mono text-xl md:text-2xl font-semibold tracking-tight mb-2 ${isDark ? 'text-z-text' : 'text-zl-text'}`}>{item.value}</p>
                <p className={`text-[10px] uppercase tracking-[0.15em] ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Goal Cards */}
      <section className="px-6 md:px-10 lg:px-16 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {goals.map((goal) => {
              const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0
              const done = pct >= 100
              const remaining = Math.max(0, goal.target - goal.saved)
              const deadlineDate = goal.deadline ? new Date(goal.deadline) : null
              const daysLeft = deadlineDate ? Math.ceil((deadlineDate - new Date()) / 86400000) : null
              return (
                <motion.div key={goal.id} layout
                  variants={fadeUp}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass card-lift rounded-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <ProgressRing pct={pct} isDark={isDark} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {done
                          ? <CheckCircle2 size={18} className={isDark ? 'text-z-green' : 'text-zl-green'} />
                          : <span className={`text-sm font-mono font-bold ${isDark ? 'text-z-text' : 'text-zl-text'}`}>{Math.round(pct)}%</span>}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{goal.icon}</span>
                        <h3 className={`font-display font-bold truncate ${isDark ? 'text-z-text' : 'text-zl-text'}`}>{goal.name}</h3>
                      </div>
                      <p className={`text-sm mt-1 font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                        {formatCurrency(goal.saved)} / {formatCurrency(goal.target)}
                      </p>
                      {!done && remaining > 0 && <p className={`text-xs mt-1 ${isDark ? 'text-z-muted/60' : 'text-zl-muted/60'}`}>{formatCurrency(remaining)} to go</p>}
                      {done && <p className={`text-xs mt-1 font-medium ${isDark ? 'text-z-green' : 'text-zl-green'}`}>Goal reached!</p>}
                      {deadlineDate && (
                        <div className={`inline-flex items-center gap-1 mt-2 text-[11px] font-mono px-2 py-0.5 rounded-full ${
                          daysLeft !== null && daysLeft < 30
                            ? isDark ? 'bg-z-amber/10 text-z-amber border border-z-amber/20' : 'bg-zl-amber/10 text-zl-amber border border-zl-amber/20'
                            : isDark ? 'bg-z-elevated text-z-muted border border-z-border' : 'bg-zl-elevated text-zl-muted border border-zl-border'
                        }`}>
                          <Calendar size={10} />
                          {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : 'Past due'}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => openEdit(goal)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-z-muted hover:text-z-accent-bright hover:bg-white/5' : 'text-zl-muted hover:text-zl-accent-bright hover:bg-black/5'}`}><Pencil size={14} /></button>
                        <button onClick={() => deleteGoal(goal.id)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-z-muted hover:text-z-red hover:bg-white/5' : 'text-zl-muted hover:text-zl-red hover:bg-black/5'}`}><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
        {goals.length === 0 && (
          <div className={`text-center py-16 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            <Target size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No savings goals yet.</p>
          </div>
        )}
      </section>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] w-full max-w-md glass-strong glass p-6 shadow-2xl"
            >
              <h2 className={`text-lg font-display font-bold mb-5 ${isDark ? 'text-z-text' : 'text-zl-text'}`}>{editId ? 'Edit Goal' : 'New Goal'}</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-16">
                    <label className={`text-[10px] uppercase tracking-[0.15em] ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>Icon</label>
                    <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field w-full mt-1 px-3 py-2.5 text-center text-lg" />
                  </div>
                  <div className="flex-1">
                    <label className={`text-[10px] uppercase tracking-[0.15em] ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Vacation Fund" className="input-field w-full mt-1 px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[10px] uppercase tracking-[0.15em] ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>Target ($)</label>
                    <input type="number" min="0" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className="input-field w-full mt-1 px-3 py-2.5 text-sm font-mono" />
                  </div>
                  <div>
                    <label className={`text-[10px] uppercase tracking-[0.15em] ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>Saved ($)</label>
                    <input type="number" min="0" value={form.saved} onChange={(e) => setForm({ ...form, saved: e.target.value })} className="input-field w-full mt-1 px-3 py-2.5 text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] uppercase tracking-[0.15em] ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>Target Date</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field w-full mt-1 px-3 py-2.5 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isDark ? 'bg-z-elevated text-z-muted hover:text-z-text' : 'bg-zl-elevated text-zl-muted hover:text-zl-text'
                }`}>Cancel</button>
                <button onClick={submitForm} className="pill-filled flex-1 py-2.5 text-sm">{editId ? 'Save' : 'Create'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
