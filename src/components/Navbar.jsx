import { useState } from 'react'
import { useStore } from '../store/useStore'
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Target,
  Sun,
  Moon,
  Command,
  Shield,
  Eye,
  Plus,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
]

export default function Navbar() {
  const { activePage, setActivePage, role, setRole, theme, toggleTheme } = useStore()
  const isDark = theme === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = (id) => {
    setActivePage(id)
    setMenuOpen(false)
  }

  return (
    <>
      {/* Top bar: brand left, menu pill right */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 pointer-events-none">
        {/* Brand mark */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm tracking-tight ${
            isDark ? 'bg-z-accent/15 text-z-accent' : 'bg-zl-accent/15 text-zl-accent'
          }`}>
            Z
          </div>
          <span className={`text-sm font-medium tracking-wide hidden sm:block ${
            isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'
          }`}>
            Zorvyn
          </span>
        </div>

        {/* Floating menu pill */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="pointer-events-auto menu-pill flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer"
        >
          <motion.div
            animate={{ rotate: menuOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {menuOpen ? (
              <X size={14} className={isDark ? 'text-z-text' : 'text-zl-text'} />
            ) : (
              <Plus size={14} className={isDark ? 'text-z-muted' : 'text-zl-muted'} />
            )}
          </motion.div>
          <span className={`text-sm font-medium ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
            Menu
          </span>
        </button>
      </header>

      {/* Expanded menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-[68px] right-6 md:right-10 z-50 w-64 rounded-2xl overflow-hidden glass-strong glass p-2"
            >
              {/* Navigation */}
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activePage === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] transition-all ${
                        isActive
                          ? isDark ? 'bg-z-accent/10 text-z-accent' : 'bg-zl-accent/10 text-zl-accent'
                          : isDark ? 'text-z-text-secondary hover:bg-white/[0.03] hover:text-z-text' : 'text-zl-text-secondary hover:bg-black/[0.03] hover:text-zl-text'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  )
                })}
              </div>

              <div className={`my-2 mx-4 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />

              {/* Controls */}
              <div className="space-y-0.5">
                <button
                  onClick={() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })); setMenuOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    isDark ? 'text-z-muted hover:text-z-text hover:bg-white/[0.03]' : 'text-zl-muted hover:text-zl-text hover:bg-black/[0.03]'
                  }`}
                >
                  <Command size={14} />
                  Command Palette
                  <kbd className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isDark ? 'bg-white/[0.04] text-z-muted' : 'bg-black/[0.04] text-zl-muted'
                  }`}>Ctrl+K</kbd>
                </button>
                <button
                  onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    isDark ? 'text-z-muted hover:text-z-text hover:bg-white/[0.03]' : 'text-zl-muted hover:text-zl-text hover:bg-black/[0.03]'
                  }`}
                >
                  {role === 'admin' ? <Shield size={14} /> : <Eye size={14} />}
                  {role === 'admin' ? 'Admin Mode' : 'Viewer Mode'}
                </button>
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    isDark ? 'text-z-muted hover:text-z-text hover:bg-white/[0.03]' : 'text-zl-muted hover:text-zl-text hover:bg-black/[0.03]'
                  }`}
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
