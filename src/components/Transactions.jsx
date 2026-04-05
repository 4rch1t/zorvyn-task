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

export default function Transactions() {
  const {
    transactions,
    filters,
    setFilter,
    role,
    theme,
    openModal,
    deleteTransaction,
  } = useStore()
  const isDark = theme === 'dark'
  const isAdmin = role === 'admin'

  const filtered = useMemo(() => {
    let result = [...transactions]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }
    if (filters.category !== 'All') {
      result = result.filter((t) => t.category === filters.category)
    }
    if (filters.type !== 'All') {
      result = result.filter((t) => t.type === filters.type.toLowerCase())
    }
    result.sort((a, b) => {
      let cmp = 0
      if (filters.sortBy === 'date') {
        cmp = new Date(a.date) - new Date(b.date)
      } else if (filters.sortBy === 'amount') {
        cmp = a.amount - b.amount
      }
      return filters.sortDir === 'desc' ? -cmp : cmp
    })
    return result
  }, [transactions, filters])

  const toggleSort = (field) => {
    if (filters.sortBy === field) {
      setFilter('sortDir', filters.sortDir === 'desc' ? 'asc' : 'desc')
    } else {
      setFilter('sortBy', field)
      setFilter('sortDir', 'desc')
    }
  }

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field)
      return <ArrowUpDown size={12} className={isDark ? 'text-z-muted' : 'text-zl-muted'} />
    return filters.sortDir === 'desc' ? (
      <ChevronDown size={12} className={isDark ? 'text-z-accent' : 'text-zl-accent'} />
    ) : (
      <ChevronUp size={12} className={isDark ? 'text-z-accent' : 'text-zl-accent'} />
    )
  }

  const exportCSV = () => {
    const header = 'Date,Description,Category,Amount,Type\n'
    const rows = filtered
      .map((t) => `${t.date},"${t.description}",${t.category},${t.amount},${t.type}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
    useToastStore.getState().addToast(`Exported ${filtered.length} transactions to CSV`, 'info')
  }

  const inputClass = `text-sm px-3 py-2 rounded-xl outline-none transition-colors ${
    isDark
      ? 'bg-white/[0.04] border border-white/[0.07] text-z-text placeholder:text-z-muted focus:border-z-accent/50'
      : 'bg-black/[0.03] border border-black/[0.07] text-zl-text placeholder:text-zl-muted focus:border-zl-accent/50'
  }`

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
            Transactions
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} · {formatCurrency(filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))} spent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${
              isDark
                ? 'bg-white/[0.04] border border-white/[0.07] text-z-muted hover:text-z-text'
                : 'bg-black/[0.03] border border-black/[0.07] text-zl-muted hover:text-zl-text'
            }`}
          >
            <Download size={14} />
            CSV
          </button>
          {isAdmin && (
            <button
              onClick={() => openModal()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isDark
                  ? 'bg-z-accent text-z-bg hover:bg-z-accent-dim'
                  : 'bg-zl-accent text-white hover:bg-zl-accent-dim'
              }`}
            >
              <Plus size={14} />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className={`${inputClass} pl-8 w-full`}
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => setFilter('category', e.target.value)}
          className={inputClass}
        >
          <option value="All">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filters.type}
          onChange={(e) => setFilter('type', e.target.value)}
          className={inputClass}
        >
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}>
                <th
                  className={`text-left px-4 py-3 text-[11px] uppercase tracking-widest font-medium cursor-pointer select-none ${
                    isDark ? 'text-z-muted' : 'text-zl-muted'
                  }`}
                  onClick={() => toggleSort('date')}
                >
                  <span className="flex items-center gap-1">Date <SortIcon field="date" /></span>
                </th>
                <th className={`text-left px-4 py-3 text-[11px] uppercase tracking-widest font-medium ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  Description
                </th>
                <th className={`text-left px-4 py-3 text-[11px] uppercase tracking-widest font-medium ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  Category
                </th>
                <th
                  className={`text-right px-4 py-3 text-[11px] uppercase tracking-widest font-medium cursor-pointer select-none ${
                    isDark ? 'text-z-muted' : 'text-zl-muted'
                  }`}
                  onClick={() => toggleSort('amount')}
                >
                  <span className="flex items-center justify-end gap-1">Amount <SortIcon field="amount" /></span>
                </th>
                {isAdmin && (
                  <th className={`text-right px-4 py-3 text-[11px] uppercase tracking-widest font-medium ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 5 : 4}
                      className={`text-center py-16 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search size={24} className="opacity-30" />
                        <p>No transactions found</p>
                        <p className="text-xs opacity-60">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.015 }}
                      className={`border-t transition-colors ${
                        isDark
                          ? 'border-white/[0.04] hover:bg-white/[0.02]'
                          : 'border-black/[0.04] hover:bg-black/[0.02]'
                      }`}
                    >
                      <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                        {new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
                        {t.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                          isDark ? 'bg-white/[0.04] text-z-muted' : 'bg-black/[0.04] text-zl-muted'
                        }`}>
                          {t.category}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold ${
                        t.type === 'income'
                          ? isDark ? 'text-z-green' : 'text-zl-green'
                          : isDark ? 'text-z-red' : 'text-zl-red'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openModal(t)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark ? 'text-z-muted hover:text-z-blue hover:bg-white/5' : 'text-zl-muted hover:text-zl-blue hover:bg-black/5'
                              }`}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => {
                                deleteTransaction(t.id)
                                useToastStore.getState().addToast(`Deleted "${t.description}"`, 'warning')
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark ? 'text-z-muted hover:text-z-red hover:bg-white/5' : 'text-zl-muted hover:text-zl-red hover:bg-black/5'
                              }`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
