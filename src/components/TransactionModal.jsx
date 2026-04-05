import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { allCategories } from '../data/mockData'
import { useToastStore } from './ToastContainer'

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
      useToastStore.getState().addToast(`Updated "${data.description}"`, 'success')
    } else {
      addTransaction(data)
      useToastStore.getState().addToast(`Added "${data.description}"`, 'success')
    }
    closeModal()
  }

  const inputClass = `w-full text-sm px-3 py-2 rounded-xl outline-none transition-colors ${
    isDark
      ? 'bg-white/[0.04] border border-white/[0.07] text-z-text placeholder:text-z-muted focus:border-z-accent/50'
      : 'bg-black/[0.03] border border-black/[0.07] text-zl-text placeholder:text-zl-muted focus:border-zl-accent/50'
  }`

  const labelClass = `block text-[11px] uppercase tracking-widest font-medium mb-1 ${
    isDark ? 'text-z-muted' : 'text-zl-muted'
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
            className="relative w-full max-w-md rounded-2xl p-6 glass glass-strong shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <button
                onClick={closeModal}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'text-z-muted hover:text-z-text hover:bg-white/5'
                    : 'text-zl-muted hover:text-zl-text hover:bg-black/5'
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
                      className={`flex-1 py-2 text-sm rounded-xl border font-medium transition-all ${
                        form.type === t
                          ? t === 'expense'
                            ? isDark
                              ? 'bg-z-red/15 border-z-red/40 text-z-red'
                              : 'bg-zl-red/10 border-zl-red/40 text-zl-red'
                            : isDark
                            ? 'bg-z-green/15 border-z-green/40 text-z-green'
                            : 'bg-zl-green/10 border-zl-green/40 text-zl-green'
                          : isDark
                          ? 'border-white/[0.07] text-z-muted hover:border-white/[0.15]'
                          : 'border-black/[0.07] text-zl-muted hover:border-black/[0.15]'
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
                    <p className={`text-xs mt-1 ${isDark ? 'text-z-red' : 'text-zl-red'}`}>{errors.date}</p>
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
                    <p className={`text-xs mt-1 ${isDark ? 'text-z-red' : 'text-zl-red'}`}>{errors.amount}</p>
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
                  <p className={`text-xs mt-1 ${isDark ? 'text-z-red' : 'text-zl-red'}`}>{errors.description}</p>
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
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isDark
                    ? 'bg-z-accent text-z-bg hover:bg-z-accent/80'
                    : 'bg-zl-accent text-white hover:bg-zl-accent/80'
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
