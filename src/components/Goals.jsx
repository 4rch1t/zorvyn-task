import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Pencil,
} from 'lucide-react'
import { useToastStore } from './ToastContainer'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

// SVG ring progress
function ProgressRing({ pct, size = 100, stroke = 8, isDark }) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const capped = Math.min(pct, 100)
  const color =
    capped >= 100
      ? isDark ? '#00ff88' : '#059669'
      : capped >= 50
      ? isDark ? '#ffaa00' : '#d97706'
      : isDark ? '#4488ff' : '#2563eb'

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isDark ? '#1a1a26' : '#e0e0e5'}
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (circ * capped) / 100 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  )
}

// Default goals for first-time load
const defaultGoals = [
  { id: 1, name: 'Emergency Fund', target: 10000, saved: 6240, deadline: '2026-09-01', icon: '🛟' },
  { id: 2, name: 'Japan Trip', target: 3500, saved: 1800, deadline: '2026-12-15', icon: '✈️' },
  { id: 3, name: 'New MacBook Pro', target: 2500, saved: 2500, deadline: '2026-06-01', icon: '💻' },
  { id: 4, name: 'Car Down Payment', target: 8000, saved: 2100, deadline: '2027-03-01', icon: '🚗' },
]

function loadGoals() {
  try {
    const stored = localStorage.getItem('centra-goals')
    return stored ? JSON.parse(stored) : defaultGoals
  } catch {
    return defaultGoals
  }
}

function saveGoals(goals) {
  localStorage.setItem('centra-goals', JSON.stringify(goals))
}

export default function Goals() {
  const { theme, role } = useStore()
  const isDark = theme === 'dark'
  const isAdmin = role === 'admin'
  const addToast = useToastStore((s) => s.addToast)

  const [goals, setGoals] = useState(loadGoals)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', target: '', saved: '', deadline: '', icon: '🎯' })

  const updateGoals = (newGoals) => {
    setGoals(newGoals)
    saveGoals(newGoals)
  }

  const openNew = () => {
    setForm({ name: '', target: '', saved: '0', deadline: '', icon: '🎯' })
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (goal) => {
    setForm({ name: goal.name, target: String(goal.target), saved: String(goal.saved), deadline: goal.deadline, icon: goal.icon })
    setEditId(goal.id)
    setShowForm(true)
  }

  const submitForm = () => {
    if (!form.name.trim() || !form.target) return
    if (editId) {
      const updated = goals.map((g) =>
        g.id === editId
          ? { ...g, name: form.name.trim(), target: Number(form.target), saved: Number(form.saved || 0), deadline: form.deadline, icon: form.icon }
          : g
      )
      updateGoals(updated)
      addToast(`Updated "${form.name.trim()}"`, 'success')
    } else {
      const maxId = goals.reduce((max, g) => Math.max(max, g.id), 0)
      const newGoal = {
        id: maxId + 1,
        name: form.name.trim(),
        target: Number(form.target),
        saved: Number(form.saved || 0),
        deadline: form.deadline,
        icon: form.icon,
      }
      updateGoals([...goals, newGoal])
      addToast(`Created goal "${form.name.trim()}"`, 'success')
    }
    setShowForm(false)
  }

  const deleteGoal = (id) => {
    const goal = goals.find((g) => g.id === id)
    updateGoals(goals.filter((g) => g.id !== id))
    addToast(`Deleted "${goal?.name}"`, 'warning')
  }

  const totalTarget = goals.reduce((s, g) => s + g.target, 0)
  const totalSaved = goals.reduce((s, g) => s + Math.min(g.saved, g.target), 0)
  const completedCount = goals.filter((g) => g.saved >= g.target).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>
            Savings Goals
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
            Track progress toward the things that matter.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openNew}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
              isDark
                ? 'bg-terminal-accent/10 text-terminal-accent hover:bg-terminal-accent/20'
                : 'bg-light-accent/10 text-light-accent hover:bg-light-accent/20'
            }`}
          >
            <Plus size={16} />
            New Goal
          </button>
        )}
      </div>

      {/* Summary strip */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4`}>
        {[
          { label: 'Total Target', value: formatCurrency(totalTarget), icon: Target },
          { label: 'Total Saved', value: formatCurrency(totalSaved), icon: TrendingUp },
          { label: 'Completed', value: `${completedCount} / ${goals.length}`, icon: CheckCircle2 },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 p-4 rounded border ${
              isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
            }`}
          >
            <item.icon size={18} className={isDark ? 'text-terminal-accent' : 'text-light-accent'} />
            <div>
              <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>{item.label}</p>
              <p className={`text-lg font-mono font-bold ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {goals.map((goal) => {
            const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0
            const done = pct >= 100
            const remaining = Math.max(0, goal.target - goal.saved)
            const deadlineDate = goal.deadline ? new Date(goal.deadline) : null
            const daysLeft = deadlineDate ? Math.ceil((deadlineDate - new Date()) / 86400000) : null

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative p-5 rounded-lg border ${
                  isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
                } ${done ? (isDark ? 'border-terminal-accent/30' : 'border-light-accent/30') : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Ring */}
                  <div className="relative shrink-0">
                    <ProgressRing pct={pct} size={80} stroke={6} isDark={isDark} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {done ? (
                        <CheckCircle2 size={20} className={isDark ? 'text-terminal-accent' : 'text-light-accent'} />
                      ) : (
                        <span className={`text-lg font-mono font-bold ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>
                          {Math.round(pct)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{goal.icon}</span>
                      <h3 className={`font-semibold truncate ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>
                        {goal.name}
                      </h3>
                    </div>

                    <p className={`text-sm mt-1 font-mono ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
                      {formatCurrency(goal.saved)} / {formatCurrency(goal.target)}
                    </p>

                    {!done && remaining > 0 && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
                        {formatCurrency(remaining)} to go
                      </p>
                    )}
                    {done && (
                      <p className={`text-xs mt-1 font-medium ${isDark ? 'text-terminal-accent' : 'text-light-accent'}`}>
                        Goal reached!
                      </p>
                    )}

                    {deadlineDate && (
                      <div className={`flex items-center gap-1 mt-2 text-xs ${
                        daysLeft !== null && daysLeft < 30
                          ? isDark ? 'text-terminal-amber' : 'text-light-amber'
                          : isDark ? 'text-terminal-muted' : 'text-light-muted'
                      }`}>
                        <Calendar size={12} />
                        {daysLeft !== null && daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                          ? 'Due today'
                          : 'Past deadline'
                        }
                        <span className="ml-1">
                          ({deadlineDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(goal)}
                        className={`p-1.5 rounded transition-colors ${
                          isDark ? 'text-terminal-muted hover:text-terminal-blue hover:bg-terminal-surface' : 'text-light-muted hover:text-light-blue hover:bg-light-bg'
                        }`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className={`p-1.5 rounded transition-colors ${
                          isDark ? 'text-terminal-muted hover:text-terminal-red hover:bg-terminal-surface' : 'text-light-muted hover:text-light-red hover:bg-light-bg'
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {goals.length === 0 && (
        <div className={`text-center py-16 ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No savings goals yet.</p>
          {isAdmin && <p className="text-xs mt-1">Click "New Goal" to create one.</p>}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] w-full max-w-md rounded-lg border p-6 shadow-2xl ${
                isDark ? 'bg-terminal-surface border-terminal-border' : 'bg-light-surface border-light-border'
              }`}
            >
              <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>
                {editId ? 'Edit Goal' : 'New Savings Goal'}
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-16">
                    <label className={`text-xs ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>Icon</label>
                    <input
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      className={`w-full mt-1 px-2 py-2 rounded border text-center text-lg outline-none ${
                        isDark ? 'bg-terminal-card border-terminal-border text-terminal-text' : 'bg-light-bg border-light-border text-light-text'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`text-xs ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Vacation Fund"
                      className={`w-full mt-1 px-3 py-2 rounded border text-sm outline-none ${
                        isDark ? 'bg-terminal-card border-terminal-border text-terminal-text placeholder:text-terminal-muted' : 'bg-light-bg border-light-border text-light-text placeholder:text-light-muted'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>Target ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.target}
                      onChange={(e) => setForm({ ...form, target: e.target.value })}
                      placeholder="10000"
                      className={`w-full mt-1 px-3 py-2 rounded border text-sm font-mono outline-none ${
                        isDark ? 'bg-terminal-card border-terminal-border text-terminal-text placeholder:text-terminal-muted' : 'bg-light-bg border-light-border text-light-text placeholder:text-light-muted'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>Saved so far ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.saved}
                      onChange={(e) => setForm({ ...form, saved: e.target.value })}
                      placeholder="0"
                      className={`w-full mt-1 px-3 py-2 rounded border text-sm font-mono outline-none ${
                        isDark ? 'bg-terminal-card border-terminal-border text-terminal-text placeholder:text-terminal-muted' : 'bg-light-bg border-light-border text-light-text placeholder:text-light-muted'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>Target Date</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className={`w-full mt-1 px-3 py-2 rounded border text-sm outline-none ${
                      isDark ? 'bg-terminal-card border-terminal-border text-terminal-text' : 'bg-light-bg border-light-border text-light-text'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowForm(false)}
                  className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                    isDark ? 'bg-terminal-card text-terminal-muted hover:text-terminal-text' : 'bg-light-bg text-light-muted hover:text-light-text'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={submitForm}
                  className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-terminal-accent/10 text-terminal-accent hover:bg-terminal-accent/20'
                      : 'bg-light-accent/10 text-light-accent hover:bg-light-accent/20'
                  }`}
                >
                  {editId ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
