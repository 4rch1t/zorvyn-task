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
} from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
]

export default function Navbar() {
  const { activePage, setActivePage, role, setRole, theme, toggleTheme } = useStore()
  const isDark = theme === 'dark'

  return (
    <>
      {/* ── Desktop: floating left sidebar ── */}
      <aside
        className={`hidden md:flex fixed left-3 top-3 bottom-3 w-[56px] z-50 flex-col items-center py-4 rounded-2xl glass glass-strong`}
      >
        {/* Logo */}
        <div className="mb-6">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm ${
            isDark ? 'bg-z-accent/15 text-z-accent' : 'bg-zl-accent/15 text-zl-accent'
          }`}>
            Z
          </div>
        </div>

        {/* Nav Icons */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className="relative p-3 rounded-xl group"
                title={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className={`absolute inset-0 rounded-xl ${
                      isDark ? 'bg-z-accent/10' : 'bg-zl-accent/10'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={18}
                  className={`relative z-10 transition-colors ${
                    isActive
                      ? isDark ? 'text-z-accent' : 'text-zl-accent'
                      : isDark ? 'text-z-muted group-hover:text-z-text' : 'text-zl-muted group-hover:text-zl-text'
                  }`}
                />
                {/* Tooltip */}
                <span className={`absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity ${
                  isDark ? 'bg-z-surface text-z-text' : 'bg-zl-surface text-zl-text shadow-lg'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Bottom controls */}
        <div className="flex flex-col items-center gap-2 mt-auto">
          {/* Command palette mini trigger */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-z-muted hover:text-z-text hover:bg-white/5' : 'text-zl-muted hover:text-zl-text hover:bg-black/5'
            }`}
            title="Command Palette (Ctrl+K)"
          >
            <Command size={15} />
          </button>

          {/* Role toggle */}
          <button
            onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-z-muted hover:text-z-text hover:bg-white/5' : 'text-zl-muted hover:text-zl-text hover:bg-black/5'
            }`}
            title={`Role: ${role}`}
          >
            {role === 'admin' ? <Shield size={15} /> : <Eye size={15} />}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-z-muted hover:text-z-amber hover:bg-white/5' : 'text-zl-muted hover:text-zl-amber hover:bg-black/5'
            }`}
            title={isDark ? 'Switch to light' : 'Switch to dark'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </aside>

      {/* ── Mobile: floating bottom bar ── */}
      <nav className={`md:hidden fixed bottom-3 left-3 right-3 z-50 h-[56px] rounded-2xl glass glass-strong flex items-center justify-around px-2`}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="relative p-3 rounded-xl"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className={`absolute inset-0 rounded-xl ${
                    isDark ? 'bg-z-accent/10' : 'bg-zl-accent/10'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={`relative z-10 ${
                  isActive
                    ? isDark ? 'text-z-accent' : 'text-zl-accent'
                    : isDark ? 'text-z-muted' : 'text-zl-muted'
                }`}
              />
            </button>
          )
        })}
        {/* Mobile theme toggle */}
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>
    </>
  )
}
