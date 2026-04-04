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
    <div
      className={`min-h-screen ${
        isDark ? 'dark bg-terminal-bg' : 'light bg-light-bg'
      }`}
    >
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
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
