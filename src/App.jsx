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
      <div className="ambient-bg" />
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
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
