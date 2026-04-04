import { create } from 'zustand'

const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      }, duration)
    }
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export { useToastStore }

import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: AlertTriangle,
}

const accents = {
  success: { dark: 'border-terminal-accent text-terminal-accent', light: 'border-light-accent text-light-accent' },
  warning: { dark: 'border-terminal-amber text-terminal-amber', light: 'border-light-amber text-light-amber' },
  info: { dark: 'border-terminal-blue text-terminal-blue', light: 'border-light-blue text-light-blue' },
  error: { dark: 'border-terminal-red text-terminal-red', light: 'border-light-red text-light-red' },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()
  const { theme } = useStore()
  const isDark = theme === 'dark'

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info
          const accent = accents[toast.type] || accents.info
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg ${
                isDark
                  ? `bg-terminal-card ${accent.dark}`
                  : `bg-light-card ${accent.light}`
              }`}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className={`text-sm flex-1 ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`shrink-0 ${isDark ? 'text-terminal-muted hover:text-terminal-text' : 'text-light-muted hover:text-light-text'}`}
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
