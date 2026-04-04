import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)
  const { theme } = useStore()
  const isDark = theme === 'dark'

  useEffect(() => {
    const openHandler = () => setOpen(true)
    window.addEventListener('centra:shortcuts', openHandler)

    const keyHandler = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', keyHandler)
    return () => {
      window.removeEventListener('centra:shortcuts', openHandler)
      window.removeEventListener('keydown', keyHandler)
    }
  }, [])

  const shortcuts = [
    { keys: ['Ctrl', 'K'], desc: 'Open command palette' },
    { keys: ['?'], desc: 'Show this help' },
    { keys: ['1'], desc: 'Go to Dashboard' },
    { keys: ['2'], desc: 'Go to Transactions' },
    { keys: ['3'], desc: 'Go to Insights' },
    { keys: ['4'], desc: 'Go to Goals' },
    { keys: ['D'], desc: 'Toggle dark / light mode' },
    { keys: ['N'], desc: 'New transaction (admin)' },
  ]

  // Global keyboard navigation
  useEffect(() => {
    const { setActivePage, toggleTheme, openModal, role } = useStore.getState()

    const handler = (e) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      switch (e.key) {
        case '1': setActivePage('dashboard'); break
        case '2': setActivePage('transactions'); break
        case '3': setActivePage('insights'); break
        case '4': setActivePage('goals'); break
        case 'd': case 'D': toggleTheme(); break
        case 'n': case 'N':
          if (role === 'admin') openModal()
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-md rounded-lg border overflow-hidden shadow-2xl ${
              isDark
                ? 'bg-terminal-surface border-terminal-border'
                : 'bg-light-surface border-light-border'
            }`}
          >
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              isDark ? 'border-terminal-border' : 'border-light-border'
            }`}>
              <h2 className={`text-sm font-mono uppercase tracking-wider ${
                isDark ? 'text-terminal-text' : 'text-light-text'
              }`}>
                Keyboard Shortcuts
              </h2>
              <button onClick={() => setOpen(false)} className={`p-1 rounded ${
                isDark ? 'text-terminal-muted hover:text-terminal-text' : 'text-light-muted hover:text-light-text'
              }`}>
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {shortcuts.map((s) => (
                <div key={s.desc} className="flex items-center justify-between py-1">
                  <span className={`text-sm ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>
                    {s.desc}
                  </span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border min-w-[24px] text-center ${
                          isDark
                            ? 'bg-terminal-card border-terminal-border text-terminal-muted'
                            : 'bg-light-bg border-light-border text-light-muted'
                        }`}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
