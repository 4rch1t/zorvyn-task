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

const accentsDark = {
  success: 'border-z-green text-z-green',
  warning: 'border-z-amber text-z-amber',
  info: 'border-z-blue text-z-blue',
  error: 'border-z-red text-z-red',
}

const accentsLight = {
  success: 'border-zl-green text-zl-green',
  warning: 'border-zl-amber text-zl-amber',
  info: 'border-zl-blue text-zl-blue',
  error: 'border-zl-red text-zl-red',
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
          const accent = isDark
            ? (accentsDark[toast.type] || accentsDark.info)
            : (accentsLight[toast.type] || accentsLight.info)
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 shadow-lg glass glass-strong ${accent}`}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className={`text-sm flex-1 ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`shrink-0 ${isDark ? 'text-z-muted hover:text-z-text' : 'text-zl-muted hover:text-zl-text'}`}
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
