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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
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

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) return <ArrowUpDown size={12} className={isDark ? 'text-z-muted' : 'text-zl-muted'} />
    return filters.sortDir === 'desc'
      ? <ChevronDown size={12} className={isDark ? 'text-z-accent' : 'text-zl-accent'} />
      : <ChevronUp size={12} className={isDark ? 'text-z-accent' : 'text-zl-accent'} />
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

  const inputClass = `text-sm px-3 py-2.5 rounded-xl outline-none transition-colors ${
    isDark
      ? 'bg-white/[0.03] border border-white/[0.06] text-z-text placeholder:text-z-muted focus:border-z-accent/40'
      : 'bg-black/[0.02] border border-black/[0.06] text-zl-text placeholder:text-zl-muted focus:border-zl-accent/40'
  }`

  // Group by date for timeline feel
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
    <div>
      {/* Hero header */}
      <section className="px-6 md:px-10 lg:px-16 mb-10">
        <motion.p
          variants={fadeUp} custom={0} initial="hidden" animate="show"
          className={`text-sm tracking-wide mb-4 flex items-center gap-2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-z-accent' : 'bg-zl-accent'}`} />
          Activity
        </motion.p>
        <motion.h1
          variants={fadeUp} custom={1} initial="hidden" animate="show"
          className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 ${isDark ? 'text-z-text' : 'text-zl-text'}`}
        >
          Transactions
        </motion.h1>
        <motion.p
          variants={fadeUp} custom={2} initial="hidden" animate="show"
          className={`text-lg ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}
        >
          {filtered.length} record{filtered.length !== 1 ? 's' : ''} &middot; {formatCurrency(filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))} spent
        </motion.p>
      </section>

      {/* Filters + Actions */}
      <motion.section variants={fadeUp} custom={3} initial="hidden" animate="show" className="px-6 md:px-10 lg:px-16 mb-8">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative flex-1 w-full md:max-w-sm">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`} />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className={`${inputClass} pl-8 w-full`}
            />
          </div>
          <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className={inputClass}>
            <option value="All">All Categories</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className={inputClass}>
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={exportCSV} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              isDark ? 'bg-white/[0.03] border border-white/[0.06] text-z-muted hover:text-z-text' : 'bg-black/[0.02] border border-black/[0.06] text-zl-muted hover:text-zl-text'
            }`}>
              <Download size={14} /> CSV
            </button>
            {isAdmin && (
              <button onClick={() => openModal()} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isDark ? 'bg-z-accent/15 text-z-accent hover:bg-z-accent/25' : 'bg-zl-accent/10 text-zl-accent hover:bg-zl-accent/20'
              }`}>
                <Plus size={14} /> Add
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Transaction Feed — grouped by date */}
      <motion.section variants={fadeUp} custom={4} initial="hidden" animate="show" className="px-6 md:px-10 lg:px-16">
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
                <p className={`text-xs uppercase tracking-[0.2em] font-medium mb-3 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  {dateLabel}
                </p>
                <div className="space-y-1">
                  <AnimatePresence>
                    {txns.map((t) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-4 py-3.5 px-4 rounded-xl transition-colors group ${
                          isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.015]'
                        }`}
                      >
                        {/* Type dot */}
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          t.type === 'income'
                            ? isDark ? 'bg-z-green' : 'bg-zl-green'
                            : isDark ? 'bg-z-red/60' : 'bg-zl-red/60'
                        }`} />

                        {/* Description + Category */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                            {t.description}
                          </p>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                            {t.category}
                          </p>
                        </div>

                        {/* Amount */}
                        <span className={`font-mono text-sm font-semibold shrink-0 ${
                          t.type === 'income'
                            ? isDark ? 'text-z-green' : 'text-zl-green'
                            : isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>

                        {/* Admin actions */}
                        {isAdmin && (
                          <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0`}>
                            <button
                              onClick={() => openModal(t)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark ? 'text-z-muted hover:text-z-blue hover:bg-white/5' : 'text-zl-muted hover:text-zl-blue hover:bg-black/5'
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
    </div>
  )
}
