import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Download,
} from 'lucide-react'
import { allCategories } from '../data/mockData'
import { useToastStore } from './ToastContainer'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}

const fadeUp = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
}

export default function Transactions() {
  const { transactions, filters, setFilter, role, theme, openModal, deleteTransaction } = useStore()
  const isDark = theme === 'dark'
  const isAdmin = role === 'admin'

  const filtered = useMemo(() => {
    let result = [...transactions]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((t) =>
        t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      )
    }
    if (filters.category !== 'All') result = result.filter((t) => t.category === filters.category)
    if (filters.type !== 'All') result = result.filter((t) => t.type === filters.type.toLowerCase())
    result.sort((a, b) => {
      let cmp = 0
      if (filters.sortBy === 'date') cmp = new Date(a.date) - new Date(b.date)
      else if (filters.sortBy === 'amount') cmp = a.amount - b.amount
      return filters.sortDir === 'desc' ? -cmp : cmp
    })
    return result
  }, [transactions, filters])

  const toggleSort = (field) => {
    if (filters.sortBy === field) setFilter('sortDir', filters.sortDir === 'desc' ? 'asc' : 'desc')
    else { setFilter('sortBy', field); setFilter('sortDir', 'desc') }
  }

  const exportCSV = () => {
    const header = 'Date,Description,Category,Amount,Type\n'
    const rows = filtered.map((t) => `${t.date},"${t.description}",${t.category},${t.amount},${t.type}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'transactions.csv'; a.click()
    URL.revokeObjectURL(url)
    useToastStore.getState().addToast(`Exported ${filtered.length} transactions`, 'info')
  }

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach((t) => {
      const d = new Date(t.date + 'T00:00:00')
      const key = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return Object.entries(groups)
  }, [filtered])

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      {/* Hero */}
      <section className="px-6 md:px-10 lg:px-16 mb-10">
        <motion.p variants={fadeUp} className={`text-lg mb-4 ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
          All <span className="accent-word">transactions</span>, searchable.
        </motion.p>
        <motion.h1 variants={fadeUp}
          className={`font-display font-[700] text-4xl sm:text-5xl md:text-6xl tracking-[-0.03em] mb-3 ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
          Transactions
        </motion.h1>
        <motion.p variants={fadeUp} className={`text-sm font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''} &middot; {formatCurrency(filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))} spent
        </motion.p>
      </section>

      {/* Filters — pill-style */}
      <motion.section variants={fadeUp} className="px-6 md:px-10 lg:px-16 mb-8">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative flex-1 w-full md:max-w-sm">
            <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="input-field text-sm pl-9 pr-4 py-2.5 w-full"
            />
          </div>
          <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}
            className="input-field text-sm px-4 py-2.5">
            <option value="All">All Categories</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)}
            className="input-field text-sm px-4 py-2.5">
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={exportCSV} className="pill-outlined flex items-center gap-1.5 px-4 py-2.5 text-sm">
              <Download size={14} /> CSV
            </button>
            {isAdmin && (
              <button onClick={() => openModal()} className="pill-filled flex items-center gap-1.5 px-4 py-2.5 text-sm">
                <Plus size={14} /> Add
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Transaction Feed */}
      <motion.section variants={fadeUp} className="px-6 md:px-10 lg:px-16 mb-16">
        {filtered.length === 0 ? (
          <div className={`text-center py-20 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            <Search size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No transactions found</p>
            <p className="text-xs mt-1 opacity-60">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([dateLabel, txns]) => (
              <div key={dateLabel}>
                {/* Date header with extending line */}
                <div className="flex items-center gap-3 mb-3">
                  <p className={`text-[11px] uppercase tracking-[0.12em] font-medium shrink-0 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                    {dateLabel}
                  </p>
                  <div className={`flex-1 h-px ${isDark ? 'bg-z-border' : 'bg-zl-border'}`} />
                </div>
                <div className="space-y-0.5">
                  <AnimatePresence>
                    {txns.map((t) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all group ${
                          isDark ? 'hover:bg-z-card' : 'hover:bg-zl-card'
                        }`}
                      >
                        {/* 3px type dot */}
                        <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${
                          t.type === 'income'
                            ? isDark ? 'bg-z-green' : 'bg-zl-green'
                            : isDark ? 'bg-z-red/70' : 'bg-zl-red/70'
                        }`} />

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                            {t.description}
                          </p>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                            {t.category}
                          </p>
                        </div>

                        <span className={`font-mono text-sm font-semibold shrink-0 ${
                          t.type === 'income'
                            ? isDark ? 'text-z-green' : 'text-zl-green'
                            : isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>

                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0 translate-x-1 group-hover:translate-x-0">
                            <button
                              onClick={() => openModal(t)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark ? 'text-z-muted hover:text-z-accent-bright hover:bg-white/5' : 'text-zl-muted hover:text-zl-accent-bright hover:bg-black/5'
                              }`}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => { deleteTransaction(t.id); useToastStore.getState().addToast(`Deleted "${t.description}"`, 'warning') }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark ? 'text-z-muted hover:text-z-red hover:bg-white/5' : 'text-zl-muted hover:text-zl-red hover:bg-black/5'
                              }`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  )
}
