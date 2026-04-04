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

function SummaryCard({ icon: Icon, label, value, subtext, accent, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded border ${
        isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded ${
            isDark ? 'bg-terminal-surface' : 'bg-light-bg'
          }`}
        >
          <Icon size={18} className={accent} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs uppercase tracking-wider ${
              isDark ? 'text-terminal-muted' : 'text-light-muted'
            }`}
          >
            {label}
          </p>
          <p
            className={`text-xl font-mono font-bold ${
              isDark ? 'text-terminal-text' : 'text-light-text'
            }`}
          >
            {value}
          </p>
          {subtext && (
            <p className={`text-xs mt-0.5 ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
              {subtext}
            </p>
          )}
        </div>
      </div>
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

    // Budget usage this month
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

  // Upcoming bills — bills due after today this month
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
      accent: isDark ? 'text-terminal-accent' : 'text-light-accent',
    },
    {
      icon: TrendingUp,
      label: 'Income This Month',
      value: formatCurrency(stats.thisMonthIncome),
      subtext: now.toLocaleDateString('en-US', { month: 'long' }),
      accent: isDark ? 'text-terminal-accent' : 'text-light-accent',
    },
    {
      icon: TrendingDown,
      label: 'Spent This Month',
      value: formatCurrency(stats.thisMonthExpenses),
      subtext: `${stats.expenseChange >= 0 ? '+' : ''}${stats.expenseChange.toFixed(1)}% vs last month`,
      accent: isDark ? 'text-terminal-red' : 'text-light-red',
    },
    {
      icon: PiggyBank,
      label: 'Savings Rate',
      value: `${stats.savingsRate.toFixed(1)}%`,
      subtext: stats.savingsRate >= 20 ? 'On track' : 'Below 20% target',
      accent: isDark ? 'text-terminal-amber' : 'text-light-amber',
    },
  ]

  // Budget bars — only categories where there's a budget
  const budgetEntries = Object.entries(budgets)
    .map(([cat, limit]) => ({
      category: cat,
      limit,
      spent: stats.categorySpending[cat] || 0,
      pct: limit > 0 ? ((stats.categorySpending[cat] || 0) / limit) * 100 : 0,
    }))
    .sort((a, b) => b.pct - a.pct)

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1
          className={`text-2xl font-bold ${
            isDark ? 'text-terminal-text' : 'text-light-text'
          }`}
        >
          {getGreeting()}
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
          Here's your financial snapshot for {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} isDark={isDark} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className={`lg:col-span-2 p-4 rounded border ${
            isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
          }`}
        >
          <h2
            className={`text-sm font-mono uppercase tracking-wider mb-4 ${
              isDark ? 'text-terminal-muted' : 'text-light-muted'
            }`}
          >
            Balance Trend (6 months)
          </h2>
          <BalanceChart />
        </div>
        <div
          className={`p-4 rounded border ${
            isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
          }`}
        >
          <h2
            className={`text-sm font-mono uppercase tracking-wider mb-4 ${
              isDark ? 'text-terminal-muted' : 'text-light-muted'
            }`}
          >
            Where your money goes
          </h2>
          <SpendingPieChart />
        </div>
      </div>

      {/* Budget + Upcoming Bills Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Budget Tracker */}
        <div
          className={`p-4 rounded border ${
            isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
          }`}
        >
          <h2
            className={`text-sm font-mono uppercase tracking-wider mb-4 ${
              isDark ? 'text-terminal-muted' : 'text-light-muted'
            }`}
          >
            Budget vs. Actual — {now.toLocaleDateString('en-US', { month: 'short' })}
          </h2>
          <div className="space-y-3">
            {budgetEntries.map(({ category, limit, spent, pct }) => {
              const over = pct > 100
              const barColor = over
                ? isDark ? 'bg-terminal-red' : 'bg-light-red'
                : pct > 75
                ? isDark ? 'bg-terminal-amber' : 'bg-light-amber'
                : isDark ? 'bg-terminal-accent' : 'bg-light-accent'
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`flex items-center gap-1.5 ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>
                      {category}
                      {over && <AlertCircle size={12} className={isDark ? 'text-terminal-red' : 'text-light-red'} />}
                    </span>
                    <span className={`font-mono text-xs ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
                      {formatCurrency(spent)} / {formatCurrency(limit)}
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-terminal-surface' : 'bg-light-bg'}`}>
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
        <div
          className={`p-4 rounded border ${
            isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-sm font-mono uppercase tracking-wider ${
                isDark ? 'text-terminal-muted' : 'text-light-muted'
              }`}
            >
              Upcoming Bills
            </h2>
            <span className={`text-xs font-mono ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
              {formatCurrency(totalUpcoming)} due
            </span>
          </div>
          {upcomingBills.length === 0 ? (
            <p className={`text-sm py-4 text-center ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
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
                    className={`flex items-center justify-between py-2 px-3 rounded ${
                      isDark ? 'bg-terminal-surface' : 'bg-light-bg'
                    }`}
                  >
                    <div>
                      <p className={`text-sm ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>
                        {bill.name}
                      </p>
                      <p className={`text-xs ${
                        daysUntil <= 3
                          ? isDark ? 'text-terminal-red' : 'text-light-red'
                          : isDark ? 'text-terminal-muted' : 'text-light-muted'
                      }`}>
                        <CalendarClock size={10} className="inline mr-1" />
                        {daysUntil <= 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `Due in ${daysUntil} days`}
                      </p>
                    </div>
                    <span className={`font-mono text-sm font-semibold ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
