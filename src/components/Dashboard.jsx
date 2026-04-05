import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CalendarClock,
  AlertCircle,
  ArrowRight,
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
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
    const expenseChange = lastMonthExpenses > 0
      ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0
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
    return recurringBills
      .filter((b) => b.dueDay > today)
      .sort((a, b) => a.dueDay - b.dueDay)
      .slice(0, 5)
  }, [])

  const totalUpcoming = upcomingBills.reduce((s, b) => s + b.amount, 0)

  const statCards = [
    { label: 'Net Balance', value: formatCurrency(stats.totalBalance), sub: 'All time' },
    { label: 'Income', value: formatCurrency(stats.thisMonthIncome), sub: now.toLocaleDateString('en-US', { month: 'long' }) },
    { label: 'Spending', value: formatCurrency(stats.thisMonthExpenses), sub: `${stats.expenseChange >= 0 ? '+' : ''}${stats.expenseChange.toFixed(1)}% MoM` },
    { label: 'Savings Rate', value: `${stats.savingsRate.toFixed(1)}%`, sub: stats.savingsRate >= 20 ? 'On track' : 'Below target' },
  ]

  const budgetEntries = Object.entries(budgets)
    .map(([cat, limit]) => ({
      category: cat,
      limit,
      spent: stats.categorySpending[cat] || 0,
      pct: limit > 0 ? ((stats.categorySpending[cat] || 0) / limit) * 100 : 0,
    }))
    .sort((a, b) => b.pct - a.pct)

  return (
    <div>
      {/* ========== HERO SECTION ========== */}
      <section className="px-6 md:px-10 lg:px-16 mb-16">
        <motion.p
          variants={fadeUp} custom={0} initial="hidden" animate="show"
          className={`text-sm tracking-wide mb-4 flex items-center gap-2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-z-accent' : 'bg-zl-accent'}`} />
          {getGreeting()}
        </motion.p>

        <motion.h1
          variants={fadeUp} custom={1} initial="hidden" animate="show"
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 ${
            isDark ? 'text-z-text' : 'text-zl-text'
          }`}
        >
          {formatCurrency(stats.totalBalance)}
        </motion.h1>

        <motion.p
          variants={fadeUp} custom={2} initial="hidden" animate="show"
          className={`text-lg md:text-xl max-w-2xl leading-relaxed ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}
        >
          Your financial snapshot for {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
          {stats.savingsRate >= 20
            ? ' You are saving consistently this month.'
            : ' Consider reviewing your spending to improve your savings rate.'}
        </motion.p>
      </section>

      {/* ========== STAT STRIP (Hark-inspired glass cards) ========== */}
      <motion.section
        variants={fadeUp} custom={3} initial="hidden" animate="show"
        className="px-6 md:px-10 lg:px-16 mb-20"
      >
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, i) => (
              <div key={card.label} className="stat-card px-6 py-8 md:py-10">
                <p className={`text-2xl md:text-3xl font-bold tracking-tight mb-4 font-mono ${
                  isDark ? 'text-z-text' : 'text-zl-text'
                }`}>
                  {card.value}
                </p>
                <div className={`w-8 h-px mb-3 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                <p className={`text-sm ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  {card.label}
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-z-muted/60' : 'text-zl-muted/60'}`}>
                  {card.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ========== CHARTS — asymmetric grid ========== */}
      <section className="px-6 md:px-10 lg:px-16 mb-16 space-y-6">
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Balance trend — takes 3 cols on lg */}
            <div className="lg:col-span-3 glass rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xs uppercase tracking-[0.2em] font-medium ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  Balance Trend
                </h2>
                <span className={`text-xs ${isDark ? 'text-z-muted/60' : 'text-zl-muted/60'}`}>Last 6 months</span>
              </div>
              <BalanceChart />
            </div>
            {/* Pie chart — takes 2 cols */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 md:p-8">
              <h2 className={`text-xs uppercase tracking-[0.2em] font-medium mb-6 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                Where your money goes
              </h2>
              <SpendingPieChart />
            </div>
          </div>
        </motion.div>

        {/* Heatmap — full width */}
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show" className="glass rounded-2xl p-6 md:p-8">
          <h2 className={`text-xs uppercase tracking-[0.2em] font-medium mb-6 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            Spending Activity
          </h2>
          <SpendingHeatmap />
        </motion.div>
      </section>

      {/* ========== BUDGET + BILLS — side by side ========== */}
      <section className="px-6 md:px-10 lg:px-16 mb-16">
        <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className={`text-xs uppercase tracking-[0.2em] font-medium mb-8 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                Budget vs. Actual
              </h2>
              <div className="space-y-5">
                {budgetEntries.map(({ category, limit, spent, pct }) => {
                  const over = pct > 100
                  const barColor = over
                    ? isDark ? 'bg-z-red' : 'bg-zl-red'
                    : pct > 75
                    ? isDark ? 'bg-z-amber' : 'bg-zl-amber'
                    : isDark ? 'bg-z-accent' : 'bg-zl-accent'
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className={`flex items-center gap-1.5 ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
                          {category}
                          {over && <AlertCircle size={12} className={isDark ? 'text-z-red' : 'text-zl-red'} />}
                        </span>
                        <span className={`font-mono text-xs ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                          {formatCurrency(spent)} / {formatCurrency(limit)}
                        </span>
                      </div>
                      <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${barColor}`}
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
                <h2 className={`text-xs uppercase tracking-[0.2em] font-medium ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  Upcoming Bills
                </h2>
                <span className={`text-xs font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  {formatCurrency(totalUpcoming)} due
                </span>
              </div>
              {upcomingBills.length === 0 ? (
                <p className={`text-sm py-4 text-center ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  All bills paid this month
                </p>
              ) : (
                <div className="space-y-1">
                  {upcomingBills.map((bill) => {
                    const dueDate = new Date(now.getFullYear(), now.getMonth(), bill.dueDay)
                    const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
                    return (
                      <div
                        key={bill.name}
                        className={`flex items-center justify-between py-3 px-4 rounded-xl transition-colors ${
                          isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'
                        }`}
                      >
                        <div>
                          <p className={`text-sm ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
                            {bill.name}
                          </p>
                          <p className={`text-xs mt-0.5 ${
                            daysUntil <= 3
                              ? isDark ? 'text-z-red' : 'text-zl-red'
                              : isDark ? 'text-z-muted' : 'text-zl-muted'
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

      {/* ========== QUICK NAV CARDS (like Hark "Our Story"/"Our Solutions") ========== */}
      <section className="px-6 md:px-10 lg:px-16 mb-16">
        <motion.div variants={fadeUp} custom={7} initial="hidden" animate="show">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setActivePage('transactions')}
              className={`glass card-lift rounded-2xl p-6 flex items-end justify-between text-left group ${
                isDark ? 'hover:border-z-border-strong' : 'hover:border-zl-border-strong'
              }`}
            >
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  Recent Activity
                </p>
                <p className={`text-lg font-medium ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                  Transactions
                </p>
              </div>
              <ArrowRight size={18} className={`transition-transform group-hover:translate-x-1 ${
                isDark ? 'text-z-muted' : 'text-zl-muted'
              }`} />
            </button>
            <button
              onClick={() => setActivePage('insights')}
              className={`glass card-lift rounded-2xl p-6 flex items-end justify-between text-left group ${
                isDark ? 'hover:border-z-border-strong' : 'hover:border-zl-border-strong'
              }`}
            >
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                  Your Patterns
                </p>
                <p className={`text-lg font-medium ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
                  Insights
                </p>
              </div>
              <ArrowRight size={18} className={`transition-transform group-hover:translate-x-1 ${
                isDark ? 'text-z-muted' : 'text-zl-muted'
              }`} />
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
