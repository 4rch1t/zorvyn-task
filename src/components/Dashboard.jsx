import { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { motion, useSpring } from 'framer-motion'
import {
  CalendarClock,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import BalanceChart from './charts/BalanceChart'
import SpendingPieChart from './charts/SpendingPieChart'
import SpendingHeatmap from './charts/SpendingHeatmap'
import { recurringBills } from '../data/mockData'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/* Animated counter that counts up on mount */
function AnimatedNumber({ value, format = 'currency' }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 })
  const [display, setDisplay] = useState({ dollars: '$0', cents: '.00' })

  const formatValue = useCallback((v) => {
    if (format === 'currency') {
      const abs = Math.abs(v)
      const dollars = Math.floor(abs)
      const cents = Math.round((abs - dollars) * 100).toString().padStart(2, '0')
      const sign = v < 0 ? '-' : ''
      return { dollars: `${sign}$${dollars.toLocaleString()}`, cents: `.${cents}` }
    }
    return { dollars: `${v.toFixed(1)}%`, cents: '' }
  }, [format])

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useEffect(() => {
    const unsub = spring.on('change', (v) => setDisplay(formatValue(v)))
    return unsub
  }, [spring, formatValue])

  return (
    <span>
      <span>{display.dollars}</span>
      {display.cents && (
        <span className="text-[0.6em] opacity-50 ml-0.5">{display.cents}</span>
      )}
    </span>
  )
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export default function Dashboard() {
  const { transactions, budgets, theme, setActivePage } = useStore()
  const isDark = theme === 'dark'
  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  const stats = useMemo(() => {
    const thisMonth = transactions.filter((t) => t.date.startsWith(thisMonthKey))
    const lastMonth = transactions.filter((t) => t.date.startsWith(lastMonthKey))
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const thisMonthIncome = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const thisMonthExpenses = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const lastMonthExpenses = lastMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const expenseChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0
    const categorySpending = {}
    thisMonth.filter((t) => t.type === 'expense').forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount
    })
    return {
      totalBalance: totalIncome - totalExpenses,
      thisMonthIncome,
      thisMonthExpenses,
      expenseChange,
      savingsRate: thisMonthIncome > 0 ? ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100 : 0,
      categorySpending,
    }
  }, [transactions, thisMonthKey, lastMonthKey])

  const upcomingBills = useMemo(() => {
    const today = now.getDate()
    return recurringBills.filter((b) => b.dueDay > today).sort((a, b) => a.dueDay - b.dueDay).slice(0, 5)
  }, [])
  const totalUpcoming = upcomingBills.reduce((s, b) => s + b.amount, 0)

  const statCards = [
    { label: 'Net Balance', value: stats.totalBalance, format: 'currency', delta: null },
    { label: 'Income', value: stats.thisMonthIncome, format: 'currency', delta: null },
    { label: 'Spending', value: stats.thisMonthExpenses, format: 'currency', delta: stats.expenseChange },
    { label: 'Savings Rate', value: stats.savingsRate, format: 'percent', delta: null },
  ]

  const budgetEntries = Object.entries(budgets)
    .map(([cat, limit]) => ({
      category: cat, limit,
      spent: stats.categorySpending[cat] || 0,
      pct: limit > 0 ? ((stats.categorySpending[cat] || 0) / limit) * 100 : 0,
    }))
    .sort((a, b) => b.pct - a.pct)

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>

      {/* ══════ HERO SECTION ══════ */}
      <section className="px-6 md:px-10 lg:px-16 min-h-[40vh] flex flex-col justify-center mb-8">
        {/* Greeting */}
        <motion.p variants={fadeUp} className={`text-lg mb-6 ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
          {getGreeting()}. Your <span className="accent-word">finances</span> at a glance.
        </motion.p>

        {/* Giant balance — Tuyo "$18,727.02" treatment */}
        <motion.h1 variants={fadeUp}
          className={`font-display font-[800] tracking-[-0.04em] leading-[0.95] mb-6 ${
            isDark ? 'text-z-text' : 'text-zl-text'
          }`}
          style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)' }}
        >
          <span className="font-mono">
            <AnimatedNumber value={stats.totalBalance} format="currency" />
          </span>
        </motion.h1>

        {/* Summary line */}
        <motion.p variants={fadeUp} className={`text-base max-w-xl leading-relaxed ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} &mdash;{' '}
          {stats.savingsRate >= 20 ? 'Consistent saving this month.' : 'Room to improve your savings rate.'}
        </motion.p>
      </section>

      {/* ══════ STAT STRIP ══════ */}
      <motion.section variants={fadeUp} className="px-6 md:px-10 lg:px-16 mb-16">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.label} className="stat-card px-5 py-7 md:px-6 md:py-8">
                <p className={`font-mono text-xl md:text-2xl font-semibold tracking-tight mb-3 ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                  {card.format === 'currency' ? formatCurrency(card.value) : `${card.value.toFixed(1)}%`}
                </p>
                <p className={`text-[10px] uppercase tracking-[0.15em] font-medium ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  {card.label}
                </p>
                {card.delta !== null && (
                  <div className={`flex items-center gap-1 mt-2 text-xs font-mono ${
                    card.delta > 0
                      ? isDark ? 'text-z-red' : 'text-zl-red'
                      : isDark ? 'text-z-green' : 'text-zl-green'
                  }`}>
                    {card.delta > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(card.delta).toFixed(1)}% MoM
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ══════ CHARTS — asymmetric 3/5 + 2/5 ══════ */}
      <section className="px-6 md:px-10 lg:px-16 mb-12 space-y-6">
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 glass rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xs uppercase tracking-[0.15em] font-medium ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  Balance <span className="accent-word">Trend</span>
                </h2>
                <span className={`text-xs font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>6 months</span>
              </div>
              <BalanceChart />
            </div>
            <div className="lg:col-span-2 glass rounded-2xl p-6 md:p-8">
              <h2 className={`text-xs uppercase tracking-[0.15em] font-medium mb-6 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                Spending <span className="accent-word">Breakdown</span>
              </h2>
              <SpendingPieChart />
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass rounded-2xl p-6 md:p-8">
          <h2 className={`text-xs uppercase tracking-[0.15em] font-medium mb-6 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            Spending <span className="accent-word">Activity</span>
          </h2>
          <SpendingHeatmap />
        </motion.div>
      </section>

      {/* ══════ BUDGET + BILLS ══════ */}
      <section className="px-6 md:px-10 lg:px-16 mb-12">
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className={`text-xs uppercase tracking-[0.15em] font-medium mb-8 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                Budget vs. <span className="accent-word">Actual</span>
              </h2>
              <div className="space-y-5">
                {budgetEntries.map(({ category, limit, spent, pct }) => {
                  const over = pct > 100
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className={`flex items-center gap-1.5 ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
                          {category}
                          {over && <AlertCircle size={11} className={isDark ? 'text-z-red' : 'text-zl-red'} />}
                        </span>
                        <span className={`font-mono text-xs ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                          {formatCurrency(spent)} / {formatCurrency(limit)}
                        </span>
                      </div>
                      <div className="bar-track">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-full ${
                            over
                              ? isDark ? 'bg-z-red' : 'bg-zl-red'
                              : pct > 75
                              ? isDark ? 'bg-z-amber' : 'bg-zl-amber'
                              : 'bar-fill'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Upcoming Bills */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-xs uppercase tracking-[0.15em] font-medium ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  Upcoming <span className="accent-word">Bills</span>
                </h2>
                <span className={`text-xs font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  {formatCurrency(totalUpcoming)} due
                </span>
              </div>
              {upcomingBills.length === 0 ? (
                <p className={`text-sm py-4 text-center ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>All bills paid this month</p>
              ) : (
                <div className="space-y-1">
                  {upcomingBills.map((bill) => {
                    const dueDate = new Date(now.getFullYear(), now.getMonth(), bill.dueDay)
                    const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={bill.name} className={`flex items-center justify-between py-3 px-4 rounded-xl transition-colors ${
                        isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'
                      }`}>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>{bill.name}</p>
                          <p className={`text-xs font-mono mt-0.5 ${
                            daysUntil <= 3 ? isDark ? 'text-z-red' : 'text-zl-red' : isDark ? 'text-z-muted' : 'text-zl-muted'
                          }`}>
                            <CalendarClock size={10} className="inline mr-1" />
                            {daysUntil <= 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `Due in ${daysUntil} days`}
                          </p>
                        </div>
                        <span className={`font-mono text-sm font-semibold ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════ QUICK NAV CARDS ══════ */}
      <section className="px-6 md:px-10 lg:px-16 mb-16">
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { page: 'transactions', label: 'Transactions', sub: 'Recent Activity' },
              { page: 'insights', label: 'Insights', sub: 'Your Patterns' },
            ].map((item) => (
              <button
                key={item.page}
                onClick={() => setActivePage(item.page)}
                className="glass card-lift rounded-2xl p-6 flex items-end justify-between text-left group"
              >
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.15em] mb-2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>{item.sub}</p>
                  <p className={`text-lg font-display font-bold ${isDark ? 'text-z-text' : 'text-zl-text'}`}>{item.label}</p>
                </div>
                <ArrowRight size={18} className={`transition-transform group-hover:translate-x-1 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`} />
              </button>
            ))}
          </div>
        </motion.div>
      </section>
    </motion.div>
  )
}
