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
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl glass glass-strong"
          >
            <div className={`flex items-center justify-between px-5 py-3 border-b ${
              isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'
            }`}>
              <h2 className={`text-sm font-bold uppercase tracking-widest ${
                isDark ? 'text-z-text' : 'text-zl-text'
              }`}>
                Keyboard Shortcuts
              </h2>
              <button onClick={() => setOpen(false)} className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-z-muted hover:text-z-text hover:bg-white/5' : 'text-zl-muted hover:text-zl-text hover:bg-black/5'
              }`}>
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-2">
              {shortcuts.map((s) => (
                <div key={s.desc} className="flex items-center justify-between py-1.5">
                  <span className={`text-sm ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                    {s.desc}
                  </span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border min-w-[24px] text-center ${
                          isDark
                            ? 'bg-white/[0.04] border-white/[0.07] text-z-muted'
                            : 'bg-black/[0.03] border-black/[0.07] text-zl-muted'
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
