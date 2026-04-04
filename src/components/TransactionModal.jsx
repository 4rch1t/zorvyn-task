import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { allCategories } from '../data/mockData'

export default function TransactionModal() {
  const {
    modalOpen,
    editingTransaction,
    closeModal,
    addTransaction,
    updateTransaction,
    theme,
  } = useStore()
  const isDark = theme === 'dark'

  const [form, setForm] = useState({
    date: '',
    description: '',
    category: 'Food',
    amount: '',
    type: 'expense',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        date: editingTransaction.date,
        description: editingTransaction.description,
        category: editingTransaction.category,
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
      })
    } else {
      setForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'Food & Dining',
        amount: '',
        type: 'expense',
      })
    }
    setErrors({})
  }, [editingTransaction, modalOpen])

  const validate = () => {
    const errs = {}
    if (!form.date) errs.date = 'Required'
    if (!form.description.trim()) errs.description = 'Required'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Must be a positive number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const data = {
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      amount: Math.round(Number(form.amount) * 100) / 100,
      type: form.type,
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data)
    } else {
      addTransaction(data)
    }
    closeModal()
  }

  const inputClass = `w-full text-sm px-3 py-2 rounded border outline-none transition-colors ${
    isDark
      ? 'bg-terminal-surface border-terminal-border text-terminal-text focus:border-terminal-accent'
      : 'bg-light-bg border-light-border text-light-text focus:border-light-accent'
  }`

  const labelClass = `block text-xs font-mono uppercase tracking-wider mb-1 ${
    isDark ? 'text-terminal-muted' : 'text-light-muted'
  }`

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md rounded-lg border p-6 ${
              isDark
                ? 'bg-terminal-card border-terminal-border'
                : 'bg-light-card border-light-border shadow-lg'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2
                className={`text-lg font-mono font-bold ${
                  isDark ? 'text-terminal-text' : 'text-light-text'
                }`}
              >
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <button
                onClick={closeModal}
                className={`p-1 rounded transition-colors ${
                  isDark
                    ? 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-surface'
                    : 'text-light-muted hover:text-light-text hover:bg-light-bg'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div>
                <label className={labelClass}>Type</label>
                <div className="flex gap-2">
                  {['expense', 'income'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-1.5 text-sm rounded border font-medium transition-all ${
                        form.type === t
                          ? t === 'expense'
                            ? isDark
                              ? 'bg-terminal-red/15 border-terminal-red/40 text-terminal-red'
                              : 'bg-light-red/10 border-light-red/40 text-light-red'
                            : isDark
                            ? 'bg-terminal-accent/15 border-terminal-accent/40 text-terminal-accent'
                            : 'bg-light-accent/10 border-light-accent/40 text-light-accent'
                          : isDark
                          ? 'border-terminal-border text-terminal-muted hover:border-terminal-muted'
                          : 'border-light-border text-light-muted hover:border-light-muted'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputClass}
                  />
                  {errors.date && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-terminal-red' : 'text-light-red'}`}>
                      {errors.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`${inputClass} font-mono`}
                  />
                  {errors.amount && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-terminal-red' : 'text-light-red'}`}>
                      {errors.amount}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                />
                {errors.description && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-terminal-red' : 'text-light-red'}`}>
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={`w-full py-2 rounded text-sm font-semibold transition-colors ${
                  isDark
                    ? 'bg-terminal-accent text-terminal-bg hover:bg-terminal-accent-dim'
                    : 'bg-light-accent text-white hover:bg-light-accent-dim'
                }`}
              >
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
