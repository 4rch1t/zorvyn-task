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

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

export default function App() {
  const { activePage, theme } = useStore()
  const PageComponent = pages[activePage] || Dashboard
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-z-bg' : 'light bg-zl-bg'}`}>
      <div className="ambient-bg" />
      <div className="grid-bg" />
      <Navbar />
      <main className="relative z-10 pt-20 pb-16">
        <AnimatePresence mode="wait">
          <motion.div key={activePage} {...pageTransition}>
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
