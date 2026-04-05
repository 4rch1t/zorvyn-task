import { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Target,
  Sun,
  Moon,
  Plus,
  RotateCcw,
  Keyboard,
} from 'lucide-react'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)

  const {
    setActivePage,
    toggleTheme,
    theme,
    role,
    openModal,
    resetTransactions,
  } = useStore()

  const isDark = theme === 'dark'

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const commands = useMemo(() => {
    const items = [
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, group: 'Navigation', action: () => setActivePage('dashboard') },
      { id: 'nav-transactions', label: 'Go to Transactions', icon: ArrowLeftRight, group: 'Navigation', action: () => setActivePage('transactions') },
      { id: 'nav-insights', label: 'Go to Insights', icon: TrendingUp, group: 'Navigation', action: () => setActivePage('insights') },
      { id: 'nav-goals', label: 'Go to Goals', icon: Target, group: 'Navigation', action: () => setActivePage('goals') },
      { id: 'toggle-theme', label: `Switch to ${isDark ? 'Light' : 'Dark'} Mode`, icon: isDark ? Sun : Moon, group: 'Actions', action: toggleTheme },
      { id: 'shortcuts', label: 'Show Keyboard Shortcuts', icon: Keyboard, group: 'Actions', action: () => window.dispatchEvent(new CustomEvent('centra:shortcuts')) },
    ]
    if (role === 'admin') {
      items.push(
        { id: 'add-txn', label: 'Add New Transaction', icon: Plus, group: 'Actions', action: () => openModal() },
        { id: 'reset-data', label: 'Reset to Default Data', icon: RotateCcw, group: 'Danger', action: resetTransactions },
      )
    }
    return items
  }, [isDark, role, setActivePage, toggleTheme, openModal, resetTransactions])

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    )
  }, [query, commands])

  useEffect(() => {
    if (selected >= filtered.length) setSelected(Math.max(0, filtered.length - 1))
  }, [filtered.length, selected])

  const run = (cmd) => {
    cmd.action()
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => (s + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => (s - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter' && filtered[selected]) {
      run(filtered[selected])
    }
  }

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach((c) => {
      if (!groups[c.group]) groups[c.group] = []
      groups[c.group].push(c)
    })
    return groups
  }, [filtered])

  let flatIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl glass glass-strong"
          >
            <div className={`flex items-center gap-3 px-4 py-3 border-b ${
              isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'
            }`}>
              <Search size={16} className={isDark ? 'text-z-muted' : 'text-zl-muted'} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command\u2026"
                className={`flex-1 bg-transparent outline-none text-sm ${
                  isDark ? 'text-z-text placeholder:text-z-muted' : 'text-zl-text placeholder:text-zl-muted'
                }`}
              />
              <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded-lg border ${
                isDark
                  ? 'bg-white/[0.04] border-white/[0.07] text-z-muted'
                  : 'bg-black/[0.03] border-black/[0.07] text-zl-muted'
              }`}>
                ESC
              </kbd>
            </div>

            <div className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 && (
                <p className={`text-sm text-center py-6 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  No results found.
                </p>
              )}
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <p className={`px-4 py-1 text-[10px] uppercase tracking-widest font-medium ${
                    isDark ? 'text-z-muted' : 'text-zl-muted'
                  }`}>
                    {group}
                  </p>
                  {items.map((cmd) => {
                    flatIndex++
                    const idx = flatIndex
                    const Icon = cmd.icon
                    const isSelected = idx === selected
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => run(cmd)}
                        onMouseEnter={() => setSelected(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          isSelected
                            ? isDark
                              ? 'bg-z-accent/10 text-z-accent'
                              : 'bg-zl-accent/10 text-zl-accent'
                            : isDark
                            ? 'text-z-text hover:bg-white/[0.03]'
                            : 'text-zl-text hover:bg-black/[0.03]'
                        }`}
                      >
                        <Icon size={15} className={isSelected ? '' : isDark ? 'text-z-muted' : 'text-zl-muted'} />
                        {cmd.label}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className={`flex items-center gap-4 px-4 py-2 text-[10px] font-mono border-t ${
              isDark ? 'border-white/[0.06] text-z-muted' : 'border-black/[0.06] text-zl-muted'
            }`}>
              <span>\u2191\u2193 navigate</span>
              <span>\u21B5 select</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
