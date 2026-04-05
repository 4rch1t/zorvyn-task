import { create } from 'zustand'

const useToastStore = create((set) => ({
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

const icons = { success: CheckCircle2, warning: AlertTriangle, info: Info, error: AlertTriangle }

const accentsDark = {
  success: 'border-l-emerald-400 text-emerald-400',
  warning: 'border-l-amber-400 text-amber-400',
  info: 'border-l-[#a78bfa] text-[#a78bfa]',
  error: 'border-l-red-400 text-red-400',
}
const accentsLight = {
  success: 'border-l-emerald-600 text-emerald-600',
  warning: 'border-l-amber-600 text-amber-600',
  info: 'border-l-[#7c3aed] text-[#7c3aed]',
  error: 'border-l-red-600 text-red-600',
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
          const accent = isDark ? (accentsDark[toast.type] || accentsDark.info) : (accentsLight[toast.type] || accentsLight.info)
          return (
            <motion.div key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border-l-[3px] shadow-lg glass ${accent}`}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className={`text-sm flex-1 ${isDark ? 'text-z-text' : 'text-zl-text'}`}>{toast.message}</p>
              <button onClick={() => removeToast(toast.id)}
                className={`shrink-0 ${isDark ? 'text-z-muted hover:text-z-text' : 'text-zl-muted hover:text-zl-text'}`}>
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
