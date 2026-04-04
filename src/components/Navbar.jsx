import { useStore } from '../store/useStore'
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
]

export default function Navbar() {
  const { activePage, setActivePage, role, setRole, theme, toggleTheme } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDark = theme === 'dark'

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md ${
          isDark
            ? 'bg-terminal-bg/90 border-terminal-border'
            : 'bg-light-surface/90 border-light-border'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className={`text-lg font-bold tracking-tight font-mono ${
                isDark ? 'text-terminal-accent' : 'text-light-accent'
              }`}
            >
              CENTRA<span className={isDark ? 'text-terminal-muted' : 'text-light-muted'}>.finance</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-terminal-accent/10 text-terminal-accent'
                        : 'bg-light-accent/10 text-light-accent'
                      : isDark
                      ? 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-card'
                      : 'text-light-muted hover:text-light-text hover:bg-light-bg'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Role Switcher */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`text-xs font-mono px-2 py-1 rounded border outline-none cursor-pointer ${
                isDark
                  ? 'bg-terminal-card border-terminal-border text-terminal-text'
                  : 'bg-light-bg border-light-border text-light-text'
              }`}
            >
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded transition-colors ${
                isDark
                  ? 'text-terminal-muted hover:text-terminal-amber hover:bg-terminal-card'
                  : 'text-light-muted hover:text-light-amber hover:bg-light-bg'
              }`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-1.5 rounded transition-colors ${
                isDark
                  ? 'text-terminal-muted hover:text-terminal-text'
                  : 'text-light-muted hover:text-light-text'
              }`}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-14 left-0 right-0 z-40 border-b md:hidden ${
              isDark
                ? 'bg-terminal-bg border-terminal-border'
                : 'bg-light-surface border-light-border'
            }`}
          >
            <div className="p-2 flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id)
                      setMobileOpen(false)
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-terminal-accent/10 text-terminal-accent'
                          : 'bg-light-accent/10 text-light-accent'
                        : isDark
                        ? 'text-terminal-muted hover:text-terminal-text'
                        : 'text-light-muted hover:text-light-text'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
