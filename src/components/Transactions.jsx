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

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }

    // Category
    if (filters.category !== 'All') {
      result = result.filter((t) => t.category === filters.category)
    }

    // Type
    if (filters.type !== 'All') {
      result = result.filter((t) => t.type === filters.type.toLowerCase())
    }

    // Sort
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
      return <ArrowUpDown size={12} className={isDark ? 'text-terminal-muted' : 'text-light-muted'} />
    return filters.sortDir === 'desc' ? (
      <ChevronDown size={12} className={isDark ? 'text-terminal-accent' : 'text-light-accent'} />
    ) : (
      <ChevronUp size={12} className={isDark ? 'text-terminal-accent' : 'text-light-accent'} />
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
  }

  const inputClass = `text-sm px-3 py-1.5 rounded border outline-none ${
    isDark
      ? 'bg-terminal-surface border-terminal-border text-terminal-text placeholder:text-terminal-muted focus:border-terminal-accent'
      : 'bg-light-bg border-light-border text-light-text placeholder:text-light-muted focus:border-light-accent'
  }`

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className={`text-2xl font-bold font-mono ${
              isDark ? 'text-terminal-text' : 'text-light-text'
            }`}
          >
            Transactions
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} · {formatCurrency(filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))} spent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border transition-colors ${
              isDark
                ? 'border-terminal-border text-terminal-muted hover:text-terminal-text hover:bg-terminal-card'
                : 'border-light-border text-light-muted hover:text-light-text hover:bg-light-bg'
            }`}
          >
            <Download size={14} />
            CSV
          </button>
          {isAdmin && (
            <button
              onClick={() => openModal()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-terminal-accent text-terminal-bg hover:bg-terminal-accent-dim'
                  : 'bg-light-accent text-white hover:bg-light-accent-dim'
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
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-terminal-muted' : 'text-light-muted'
            }`}
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
            <option key={c} value={c}>
              {c}
            </option>
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
      <div
        className={`rounded border overflow-hidden ${
          isDark ? 'border-terminal-border' : 'border-light-border shadow-sm'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className={
                  isDark ? 'bg-terminal-surface' : 'bg-light-bg'
                }
              >
                <th
                  className={`text-left px-4 py-2.5 font-mono text-xs uppercase tracking-wider cursor-pointer select-none ${
                    isDark ? 'text-terminal-muted' : 'text-light-muted'
                  }`}
                  onClick={() => toggleSort('date')}
                >
                  <span className="flex items-center gap-1">
                    Date <SortIcon field="date" />
                  </span>
                </th>
                <th
                  className={`text-left px-4 py-2.5 font-mono text-xs uppercase tracking-wider ${
                    isDark ? 'text-terminal-muted' : 'text-light-muted'
                  }`}
                >
                  Description
                </th>
                <th
                  className={`text-left px-4 py-2.5 font-mono text-xs uppercase tracking-wider ${
                    isDark ? 'text-terminal-muted' : 'text-light-muted'
                  }`}
                >
                  Category
                </th>
                <th
                  className={`text-right px-4 py-2.5 font-mono text-xs uppercase tracking-wider cursor-pointer select-none ${
                    isDark ? 'text-terminal-muted' : 'text-light-muted'
                  }`}
                  onClick={() => toggleSort('amount')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Amount <SortIcon field="amount" />
                  </span>
                </th>
                {isAdmin && (
                  <th
                    className={`text-right px-4 py-2.5 font-mono text-xs uppercase tracking-wider ${
                      isDark ? 'text-terminal-muted' : 'text-light-muted'
                    }`}
                  >
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
                      className={`text-center py-12 ${
                        isDark ? 'text-terminal-muted' : 'text-light-muted'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search size={24} className="opacity-30" />
                        <p>No transactions found</p>
                        <p className="text-xs opacity-60">
                          Try adjusting your filters
                        </p>
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
                      transition={{ delay: i * 0.02 }}
                      className={`border-t ${
                        isDark
                          ? 'border-terminal-border hover:bg-terminal-surface/50'
                          : 'border-light-border hover:bg-light-bg/50'
                      }`}
                    >
                      <td
                        className={`px-4 py-2.5 font-mono text-xs ${
                          isDark ? 'text-terminal-muted' : 'text-light-muted'
                        }`}
                      >
                        {new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                      <td
                        className={`px-4 py-2.5 ${
                          isDark ? 'text-terminal-text' : 'text-light-text'
                        }`}
                      >
                        {t.description}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            isDark
                              ? 'bg-terminal-surface text-terminal-muted'
                              : 'bg-light-bg text-light-muted'
                          }`}
                        >
                          {t.category}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-mono font-semibold ${
                          t.type === 'income'
                            ? isDark
                              ? 'text-terminal-accent'
                              : 'text-light-accent'
                            : isDark
                            ? 'text-terminal-red'
                            : 'text-light-red'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatCurrency(t.amount)}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openModal(t)}
                              className={`p-1 rounded transition-colors ${
                                isDark
                                  ? 'text-terminal-muted hover:text-terminal-blue hover:bg-terminal-surface'
                                  : 'text-light-muted hover:text-light-blue hover:bg-light-bg'
                              }`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deleteTransaction(t.id)}
                              className={`p-1 rounded transition-colors ${
                                isDark
                                  ? 'text-terminal-muted hover:text-terminal-red hover:bg-terminal-surface'
                                  : 'text-light-muted hover:text-light-red hover:bg-light-bg'
                              }`}
                            >
                              <Trash2 size={14} />
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
