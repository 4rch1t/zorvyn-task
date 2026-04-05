import { useStore } from './store/useStore'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import Insights from './components/Insights'
import Goals from './components/Goals'
import TransactionModal from './components/TransactionModal'
import CommandPalette from './components/CommandPalette'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import ToastContainer from './components/ToastContainer'
import { AnimatePresence, motion } from 'framer-motion'

const pages = {
  dashboard: Dashboard,
  transactions: Transactions,
  insights: Insights,
  goals: Goals,
}

export default function App() {
  const { activePage, theme } = useStore()
  const isDark = theme === 'dark'
  const PageComponent = pages[activePage] || Dashboard

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-z-bg' : 'light bg-zl-bg'}`}>
      {/* Animated mesh gradient background */}
      <div className="mesh-bg" />
      <div className="dot-grid" />

      <Navbar />
      <main className="relative z-10 md:ml-[76px] px-4 md:px-8 pt-6 pb-24 md:pb-10 max-w-[1400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <TransactionModal />
      <CommandPalette />
      <KeyboardShortcuts />
      <ToastContainer />
    </div>
  )
}
