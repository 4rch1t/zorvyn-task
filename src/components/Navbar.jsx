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
  Menu,
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
      <header className="fixed top-0 left-0 right-0 z-50 nav-bar">
        <div className="flex items-center justify-between px-6 md:px-10 h-16">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center font-display font-[700] text-sm ${
              isDark ? 'bg-z-surface text-z-accent-bright' : 'bg-zl-elevated text-zl-accent-bright'
            }`}>
              C
            </div>
            <span className={`font-display font-bold text-[15px] tracking-[-0.03em] ${
              isDark ? 'text-z-text' : 'text-zl-text'
            }`}>
              Centra
            </span>
          </div>

          {/* Desktop nav links — centered, hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors group ${
                    isActive
                      ? isDark ? 'text-z-text' : 'text-zl-text'
                      : isDark ? 'text-z-muted hover:text-z-text-secondary' : 'text-zl-muted hover:text-zl-text-secondary'
                  }`}
                >
                  {item.label}
                  {/* Underline indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className={`absolute -bottom-[1px] left-4 right-4 h-[2px] rounded-full ${
                        isDark ? 'bg-z-accent-bright' : 'bg-zl-accent-bright'
                      }`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {/* Hover underline for non-active */}
                  {!isActive && (
                    <span className={`absolute -bottom-[1px] left-4 right-4 h-[2px] rounded-full scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200 ${
                      isDark ? 'bg-z-accent-bright/40' : 'bg-zl-accent-bright/40'
                    }`} />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right side: controls + menu pill */}
          <div className="flex items-center gap-2">
            {/* Theme toggle — always visible */}
            <button
              onClick={toggleTheme}
              className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                isDark ? 'text-z-muted hover:text-z-text hover:bg-white/[0.04]'
                       : 'text-zl-muted hover:text-zl-text hover:bg-black/[0.04]'
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Cmd+K shortcut badge */}
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                isDark ? 'text-z-muted hover:text-z-text-secondary bg-white/[0.03] border border-white/[0.06]'
                       : 'text-zl-muted hover:text-zl-text-secondary bg-black/[0.02] border border-black/[0.06]'
              }`}
            >
              <Command size={11} />
              <span>K</span>
            </button>

            {/* Menu pill — for mobile + overflow */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="menu-pill flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer"
            >
              <motion.div animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
                {menuOpen
                  ? <X size={14} className={isDark ? 'text-z-text' : 'text-zl-text'} />
                  : <Menu size={14} className={isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'} />}
              </motion.div>
              <span className={`text-sm font-medium ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                Menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Expanded dropdown panel */}
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[68px] right-6 md:right-10 z-50 w-72 glass-strong glass overflow-hidden p-2"
            >
              {/* Nav items — with stagger */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
                className="space-y-0.5"
              >
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activePage === item.id
                  return (
                    <motion.button
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, y: -6 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                      }}
                      onClick={() => navigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? isDark ? 'bg-z-accent-glow text-z-accent-bright' : 'bg-zl-accent-glow text-zl-accent-bright'
                          : isDark ? 'text-z-text-secondary hover:bg-white/[0.03] hover:text-z-text' : 'text-zl-text-secondary hover:bg-black/[0.03] hover:text-zl-text'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </motion.button>
                  )
                })}
              </motion.div>

              <div className={`my-2 mx-4 h-px ${isDark ? 'bg-z-border' : 'bg-zl-border'}`} />

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
                    isDark ? 'bg-z-elevated text-z-muted' : 'bg-zl-elevated text-zl-muted'
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
                {/* Theme toggle in dropdown for mobile */}
                <button
                  onClick={toggleTheme}
                  className={`sm:hidden w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
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
