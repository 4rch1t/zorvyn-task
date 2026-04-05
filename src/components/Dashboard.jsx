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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function SummaryCard({ icon: Icon, label, value, subtext, stripe, isDark }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`glass card-glow accent-stripe ${stripe} rounded-2xl p-5 pl-6`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <Icon size={16} className={isDark ? 'text-z-muted' : 'text-zl-muted'} />
        </div>
      </div>
      <p className={`text-[11px] uppercase tracking-widest font-medium mb-1 ${
        isDark ? 'text-z-muted' : 'text-zl-muted'
      }`}>
        {label}
      </p>
      <p className={`text-2xl font-mono font-bold tracking-tight ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
        {value}
      </p>
      {subtext && (
        <p className={`text-xs mt-1 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

export default function Dashboard() {
  const { transactions, budgets, theme } = useStore()
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

  const cards = [
    {
      icon: Wallet,
      label: 'Net Balance',
      value: formatCurrency(stats.totalBalance),
      subtext: 'All time',
      stripe: 'stripe-orange',
    },
    {
      icon: TrendingUp,
      label: 'Income This Month',
      value: formatCurrency(stats.thisMonthIncome),
      subtext: now.toLocaleDateString('en-US', { month: 'long' }),
      stripe: 'stripe-green',
    },
    {
      icon: TrendingDown,
      label: 'Spent This Month',
      value: formatCurrency(stats.thisMonthExpenses),
      subtext: `${stats.expenseChange >= 0 ? '+' : ''}${stats.expenseChange.toFixed(1)}% vs last month`,
      stripe: 'stripe-red',
    },
    {
      icon: PiggyBank,
      label: 'Savings Rate',
      value: `${stats.savingsRate.toFixed(1)}%`,
      subtext: stats.savingsRate >= 20 ? 'On track' : 'Below 20% target',
      stripe: 'stripe-amber',
    },
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
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div variants={fadeUp}>
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
          {getGreeting()}
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
          Here's your financial snapshot for {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
        </p>
      </motion.div>

      {/* Summary Cards – bento grid */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger}>
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} isDark={isDark} />
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="lg:col-span-2 glass rounded-2xl p-5">
          <h2 className={`text-[11px] uppercase tracking-widest font-medium mb-4 ${
            isDark ? 'text-z-muted' : 'text-zl-muted'
          }`}>
            Balance Trend
          </h2>
          <BalanceChart />
        </motion.div>
        <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
          <h2 className={`text-[11px] uppercase tracking-widest font-medium mb-4 ${
            isDark ? 'text-z-muted' : 'text-zl-muted'
          }`}>
            Where your money goes
          </h2>
          <SpendingPieChart />
        </motion.div>
      </div>

      {/* Spending Heatmap */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
        <h2 className={`text-[11px] uppercase tracking-widest font-medium mb-4 ${
          isDark ? 'text-z-muted' : 'text-zl-muted'
        }`}>
          Spending Activity
        </h2>
        <SpendingHeatmap />
      </motion.div>

      {/* Budget + Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget Tracker */}
        <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
          <h2 className={`text-[11px] uppercase tracking-widest font-medium mb-5 ${
            isDark ? 'text-z-muted' : 'text-zl-muted'
          }`}>
            Budget vs. Actual — {now.toLocaleDateString('en-US', { month: 'short' })}
          </h2>
          <div className="space-y-4">
            {budgetEntries.map(({ category, limit, spent, pct }) => {
              const over = pct > 100
              const barColor = over
                ? 'bg-z-red'
                : pct > 75
                ? 'bg-z-amber'
                : 'bg-z-accent'
              const barColorLight = over
                ? 'bg-zl-red'
                : pct > 75
                ? 'bg-zl-amber'
                : 'bg-zl-accent'
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className={`flex items-center gap-1.5 text-[13px] ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
                      {category}
                      {over && <AlertCircle size={12} className={isDark ? 'text-z-red' : 'text-zl-red'} />}
                    </span>
                    <span className={`font-mono text-xs ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                      {formatCurrency(spent)} / {formatCurrency(limit)}
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${isDark ? barColor : barColorLight}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Upcoming Bills */}
        <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-[11px] uppercase tracking-widest font-medium ${
              isDark ? 'text-z-muted' : 'text-zl-muted'
            }`}>
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
            <div className="space-y-2">
              {upcomingBills.map((bill) => {
                const dueDate = new Date(now.getFullYear(), now.getMonth(), bill.dueDay)
                const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
                return (
                  <div
                    key={bill.name}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-xl ${
                      isDark ? 'bg-white/[0.02] hover:bg-white/[0.04]' : 'bg-black/[0.02] hover:bg-black/[0.04]'
                    } transition-colors`}
                  >
                    <div>
                      <p className={`text-[13px] ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
                        {bill.name}
                      </p>
                      <p className={`text-xs ${
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
        </motion.div>
      </div>
    </motion.div>
  )
}
