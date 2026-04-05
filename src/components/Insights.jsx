import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  PiggyBank,
  Lightbulb,
  Repeat,
  Target,
} from 'lucide-react'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}
const fadeUp = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
}

function Recommendation({ text, type, isDark }) {
  const borderColor = {
    warning: isDark ? 'border-l-z-amber' : 'border-l-zl-amber',
    good: isDark ? 'border-l-z-green' : 'border-l-zl-green',
    info: isDark ? 'border-l-z-blue' : 'border-l-zl-blue',
  }
  const glowBg = {
    warning: isDark ? 'bg-z-amber/[0.04]' : 'bg-zl-amber/[0.04]',
    good: isDark ? 'bg-z-green/[0.04]' : 'bg-zl-green/[0.04]',
    info: isDark ? 'bg-z-blue/[0.04]' : 'bg-zl-blue/[0.04]',
  }
  const iconColor = {
    warning: isDark ? 'text-z-amber' : 'text-zl-amber',
    good: isDark ? 'text-z-green' : 'text-zl-green',
    info: isDark ? 'text-z-blue' : 'text-zl-blue',
  }
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border-l-[3px] ${borderColor[type]} ${isDark ? 'bg-z-surface' : 'bg-zl-surface'} ${glowBg[type]}`}>
      <div className={`p-1.5 rounded-lg shrink-0 ${isDark ? 'bg-z-elevated' : 'bg-zl-elevated'}`}>
        <Lightbulb size={14} className={iconColor[type]} />
      </div>
      <p className={`text-sm leading-relaxed ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>{text}</p>
    </div>
  )
}

export default function Insights() {
  const { transactions, budgets, theme } = useStore()
  const isDark = theme === 'dark'

  const insights = useMemo(() => {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

    const thisMonthTxns = transactions.filter((t) => t.date.startsWith(thisMonth))
    const lastMonthTxns = transactions.filter((t) => t.date.startsWith(lastMonth))

    const categoryTotals = {}
    thisMonthTxns.filter((t) => t.type === 'expense').forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
    })
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

    const thisMonthExpenses = thisMonthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const lastMonthExpenses = lastMonthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const expenseChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

    const expenses = transactions.filter((t) => t.type === 'expense')
    const biggestExpense = expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0] || { amount: 0, description: 'N/A', category: 'N/A' })

    const thisMonthIncome = thisMonthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const lastMonthIncome = lastMonthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const thisMonthSavings = thisMonthIncome - thisMonthExpenses
    const lastMonthSavings = lastMonthIncome - lastMonthExpenses

    const subscriptionTotal = transactions.filter((t) => t.category === 'Subscriptions' && t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amount, 0)

    const allCategoryTotals = {}
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      allCategoryTotals[t.category] = (allCategoryTotals[t.category] || 0) + t.amount
    })
    const categoryBreakdown = Object.entries(allCategoryTotals).sort((a, b) => b[1] - a[1])
    const totalExpenseAll = Object.values(allCategoryTotals).reduce((s, v) => s + v, 0)

    const overBudget = Object.entries(budgets)
      .filter(([cat, limit]) => (categoryTotals[cat] || 0) > limit)
      .map(([cat, limit]) => ({ cat, limit, spent: categoryTotals[cat] }))

    const recs = []
    if (overBudget.length > 0) recs.push({ text: `Budget exceeded in ${overBudget.map((b) => b.cat).join(', ')}. Review these categories.`, type: 'warning' })
    if (subscriptionTotal > 70) recs.push({ text: `Subscriptions total ${formatCurrency(subscriptionTotal)}/mo. Audit for unused services.`, type: 'info' })
    if (thisMonthSavings > lastMonthSavings && lastMonthSavings > 0) recs.push({ text: `Savings improved by ${formatCurrency(thisMonthSavings - lastMonthSavings)} vs last month.`, type: 'good' })
    else if (thisMonthSavings < lastMonthSavings) recs.push({ text: `Savings dropped this month. Consider deferring non-essential purchases.`, type: 'warning' })
    if (expenseChange > 15) recs.push({ text: `Spending up ${expenseChange.toFixed(0)}% MoM. Check if this is seasonal.`, type: 'warning' })
    else if (expenseChange < -10) recs.push({ text: `Spending down ${Math.abs(expenseChange).toFixed(0)}% from last month \u2014 solid discipline.`, type: 'good' })
    if (recs.length === 0) recs.push({ text: `Finances look healthy this month. Stay consistent.`, type: 'good' })

    return { topCategory, thisMonthExpenses, lastMonthExpenses, expenseChange, biggestExpense, thisMonthSavings, lastMonthSavings, subscriptionTotal, categoryBreakdown, totalExpenseAll, overBudget, recs }
  }, [transactions, budgets])

  if (transactions.length === 0) {
    return (
      <div className={`text-center py-20 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
        <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg">No data to analyze</p>
        <p className="text-sm mt-1 opacity-60">Add some transactions first</p>
      </div>
    )
  }

  const metricCards = [
    { icon: BarChart3, label: 'Top Category', value: insights.topCategory ? insights.topCategory[0] : 'N/A', sub: insights.topCategory ? formatCurrency(insights.topCategory[1]) : '' },
    { icon: insights.expenseChange > 0 ? TrendingUp : TrendingDown, label: 'Expense Trend', value: `${insights.expenseChange >= 0 ? '+' : ''}${insights.expenseChange.toFixed(1)}%`, sub: `${formatCurrency(insights.lastMonthExpenses)} \u2192 ${formatCurrency(insights.thisMonthExpenses)}` },
    { icon: PiggyBank, label: 'Savings', value: formatCurrency(insights.thisMonthSavings), sub: insights.thisMonthSavings >= insights.lastMonthSavings ? 'Improving' : 'Declining' },
    { icon: Repeat, label: 'Subscriptions', value: formatCurrency(insights.subscriptionTotal), sub: insights.subscriptionTotal > 70 ? 'High' : 'Normal' },
    { icon: AlertTriangle, label: 'Largest Expense', value: formatCurrency(insights.biggestExpense.amount), sub: insights.biggestExpense.description },
    { icon: Target, label: 'Budget Alerts', value: insights.overBudget.length === 0 ? 'On track' : `${insights.overBudget.length} over`, sub: insights.overBudget.length > 0 ? insights.overBudget.map((b) => b.cat).join(', ') : 'All within limits' },
  ]

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      {/* Hero */}
      <section className="px-6 md:px-10 lg:px-16 mb-12">
        <motion.p variants={fadeUp} className={`text-lg mb-4 ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
          Spending patterns this month.
        </motion.p>
        <motion.h1 variants={fadeUp}
          className={`font-display font-[700] text-4xl sm:text-5xl md:text-6xl tracking-[-0.03em] mb-3 ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
          Insights
        </motion.h1>
        <motion.p variants={fadeUp} className={`text-sm ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>
          Based on {transactions.length} transactions.
        </motion.p>
      </section>

      {/* Recommendations */}
      <motion.section variants={fadeUp} className="px-6 md:px-10 lg:px-16 mb-12">
        <div className="glass rounded-lg p-6 md:p-8 space-y-2">
          <h2 className={`text-xs uppercase tracking-[0.15em] font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            <Lightbulb size={14} /> Recommendations
          </h2>
          {insights.recs.map((r, i) => (
            <Recommendation key={i} text={r.text} type={r.type} isDark={isDark} />
          ))}
        </div>
      </motion.section>

      {/* Metric cards — 3 col grid */}
      <motion.section variants={fadeUp} className="px-6 md:px-10 lg:px-16 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="glass card-lift rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${isDark ? 'bg-z-elevated' : 'bg-zl-elevated'}`}>
                    <Icon size={15} className={isDark ? 'text-z-accent-bright' : 'text-zl-accent-bright'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] uppercase tracking-[0.15em] mb-1.5 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>{card.label}</p>
                    <p className={`font-mono text-xl font-semibold tracking-tight truncate ${isDark ? 'text-z-text' : 'text-zl-text'}`}>{card.value}</p>
                    <p className={`text-xs mt-1 truncate font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>{card.sub}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* Spending Breakdown */}
      <motion.section variants={fadeUp} className="px-6 md:px-10 lg:px-16 mb-16">
        <div className="glass rounded-lg p-6 md:p-8">
          <h2 className={`text-xs uppercase tracking-[0.15em] font-medium mb-8 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            All-time Breakdown
          </h2>
          <div className="space-y-5">
            {insights.categoryBreakdown.map(([cat, total]) => {
              const pct = insights.totalExpenseAll > 0 ? (total / insights.totalExpenseAll) * 100 : 0
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}>{cat}</span>
                    <span className={`font-mono text-xs ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                      {formatCurrency(total)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bar-fill"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
