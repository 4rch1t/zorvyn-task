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

function InsightCard({ icon: Icon, label, value, detail, accent, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded border ${
        isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded ${isDark ? 'bg-terminal-surface' : 'bg-light-bg'}`}>
          <Icon size={18} className={accent} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs uppercase tracking-wider mb-1 ${
              isDark ? 'text-terminal-muted' : 'text-light-muted'
            }`}
          >
            {label}
          </p>
          <p
            className={`text-lg font-mono font-bold truncate ${
              isDark ? 'text-terminal-text' : 'text-light-text'
            }`}
          >
            {value}
          </p>
          {detail && (
            <p
              className={`text-xs mt-1 ${
                isDark ? 'text-terminal-muted' : 'text-light-muted'
              }`}
            >
              {detail}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function Recommendation({ text, type, isDark }) {
  const colorMap = {
    warning: isDark ? 'border-terminal-amber/30 bg-terminal-amber/5' : 'border-light-amber/30 bg-light-amber/5',
    good: isDark ? 'border-terminal-accent/30 bg-terminal-accent/5' : 'border-light-accent/30 bg-light-accent/5',
    info: isDark ? 'border-terminal-blue/30 bg-terminal-blue/5' : 'border-light-blue/30 bg-light-blue/5',
  }
  const iconColor = {
    warning: isDark ? 'text-terminal-amber' : 'text-light-amber',
    good: isDark ? 'text-terminal-accent' : 'text-light-accent',
    info: isDark ? 'text-terminal-blue' : 'text-light-blue',
  }
  return (
    <div className={`flex items-start gap-3 p-3 rounded border ${colorMap[type]}`}>
      <Lightbulb size={16} className={`mt-0.5 shrink-0 ${iconColor[type]}`} />
      <p className={`text-sm ${isDark ? 'text-terminal-text' : 'text-light-text'}`}>{text}</p>
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

    // Highest spending category this month
    const categoryTotals = {}
    thisMonthTxns
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      })

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

    // Month-over-month expense comparison
    const thisMonthExpenses = thisMonthTxns
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    const lastMonthExpenses = lastMonthTxns
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)

    const expenseChange =
      lastMonthExpenses > 0
        ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : 0

    // Biggest single expense
    const expenses = transactions.filter((t) => t.type === 'expense')
    const biggestExpense = expenses.reduce(
      (max, t) => (t.amount > max.amount ? t : max),
      expenses[0] || { amount: 0, description: 'N/A', category: 'N/A' }
    )

    // Savings trend
    const thisMonthIncome = thisMonthTxns
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const lastMonthIncome = lastMonthTxns
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)

    const thisMonthSavings = thisMonthIncome - thisMonthExpenses
    const lastMonthSavings = lastMonthIncome - lastMonthExpenses

    // Recurring spend detection — total subscriptions
    const subscriptionTotal = transactions
      .filter((t) => t.category === 'Subscriptions' && t.date.startsWith(thisMonth))
      .reduce((s, t) => s + t.amount, 0)

    // Category breakdown all time
    const allCategoryTotals = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        allCategoryTotals[t.category] = (allCategoryTotals[t.category] || 0) + t.amount
      })

    const categoryBreakdown = Object.entries(allCategoryTotals).sort((a, b) => b[1] - a[1])
    const totalExpenseAll = Object.values(allCategoryTotals).reduce((s, v) => s + v, 0)

    // Budget alerts
    const overBudget = Object.entries(budgets)
      .filter(([cat, limit]) => (categoryTotals[cat] || 0) > limit)
      .map(([cat, limit]) => ({ cat, limit, spent: categoryTotals[cat] }))

    // Recommendations
    const recs = []
    if (overBudget.length > 0) {
      const names = overBudget.map((b) => b.cat).join(', ')
      recs.push({ text: `You've exceeded your budget in ${names}. Review these categories to find cuts.`, type: 'warning' })
    }
    if (subscriptionTotal > 70) {
      recs.push({ text: `Your subscriptions total ${formatCurrency(subscriptionTotal)}/mo. Audit for services you don't use regularly.`, type: 'info' })
    }
    if (thisMonthSavings > lastMonthSavings && lastMonthSavings > 0) {
      recs.push({ text: `Your savings improved by ${formatCurrency(thisMonthSavings - lastMonthSavings)} vs last month. Keep it up.`, type: 'good' })
    } else if (thisMonthSavings < lastMonthSavings) {
      recs.push({ text: `Savings dropped this month. Consider deferring non-essential purchases until next month.`, type: 'warning' })
    }
    if (expenseChange > 15) {
      recs.push({ text: `Spending is up ${expenseChange.toFixed(0)}% month-over-month. Check if this is seasonal or a pattern.`, type: 'warning' })
    } else if (expenseChange < -10) {
      recs.push({ text: `Spending is down ${Math.abs(expenseChange).toFixed(0)}% from last month — solid discipline.`, type: 'good' })
    }
    if (recs.length === 0) {
      recs.push({ text: `Your finances look healthy this month. Stay consistent with your budget targets.`, type: 'good' })
    }

    return {
      topCategory,
      thisMonthExpenses,
      lastMonthExpenses,
      expenseChange,
      biggestExpense,
      thisMonthSavings,
      lastMonthSavings,
      subscriptionTotal,
      categoryBreakdown,
      totalExpenseAll,
      overBudget,
      recs,
    }
  }, [transactions, budgets])

  if (transactions.length === 0) {
    return (
      <div className={`text-center py-20 ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
        <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg">No data to analyze</p>
        <p className="text-sm mt-1 opacity-60">Add some transactions first</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className={`text-2xl font-bold ${
            isDark ? 'text-terminal-text' : 'text-light-text'
          }`}
        >
          Insights
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
          Patterns, alerts, and recommendations from your transaction history.
        </p>
      </div>

      {/* Recommendations */}
      <div
        className={`p-4 rounded border space-y-2 ${
          isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
        }`}
      >
        <h2
          className={`text-sm font-mono uppercase tracking-wider mb-3 flex items-center gap-2 ${
            isDark ? 'text-terminal-muted' : 'text-light-muted'
          }`}
        >
          <Lightbulb size={14} /> Recommendations
        </h2>
        {insights.recs.map((r, i) => (
          <Recommendation key={i} text={r.text} type={r.type} isDark={isDark} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InsightCard
          icon={BarChart3}
          label="Top Spending Category"
          value={insights.topCategory ? insights.topCategory[0] : 'No expenses yet'}
          detail={
            insights.topCategory
              ? `${formatCurrency(insights.topCategory[1])} this month`
              : undefined
          }
          accent={isDark ? 'text-terminal-amber' : 'text-light-amber'}
          isDark={isDark}
        />

        <InsightCard
          icon={insights.expenseChange > 0 ? TrendingUp : TrendingDown}
          label="Expense Trend (MoM)"
          value={`${insights.expenseChange >= 0 ? '+' : ''}${insights.expenseChange.toFixed(1)}%`}
          detail={`${formatCurrency(insights.lastMonthExpenses)} → ${formatCurrency(insights.thisMonthExpenses)}`}
          accent={
            insights.expenseChange > 0
              ? isDark ? 'text-terminal-red' : 'text-light-red'
              : isDark ? 'text-terminal-accent' : 'text-light-accent'
          }
          isDark={isDark}
        />

        <InsightCard
          icon={AlertTriangle}
          label="Largest Single Expense"
          value={formatCurrency(insights.biggestExpense.amount)}
          detail={`${insights.biggestExpense.description}`}
          accent={isDark ? 'text-terminal-purple' : 'text-light-purple'}
          isDark={isDark}
        />

        <InsightCard
          icon={PiggyBank}
          label="Savings This Month"
          value={formatCurrency(insights.thisMonthSavings)}
          detail={
            insights.thisMonthSavings >= insights.lastMonthSavings
              ? `+${formatCurrency(insights.thisMonthSavings - insights.lastMonthSavings)} vs last month`
              : `${formatCurrency(insights.thisMonthSavings - insights.lastMonthSavings)} vs last month`
          }
          accent={
            insights.thisMonthSavings >= insights.lastMonthSavings
              ? isDark ? 'text-terminal-accent' : 'text-light-accent'
              : isDark ? 'text-terminal-red' : 'text-light-red'
          }
          isDark={isDark}
        />

        <InsightCard
          icon={Repeat}
          label="Monthly Subscriptions"
          value={formatCurrency(insights.subscriptionTotal)}
          detail={`${insights.subscriptionTotal > 70 ? 'Consider auditing unused services' : 'Within reasonable range'}`}
          accent={isDark ? 'text-terminal-cyan' : 'text-light-cyan'}
          isDark={isDark}
        />

        <InsightCard
          icon={Target}
          label="Budget Alerts"
          value={insights.overBudget.length === 0 ? 'All on track' : `${insights.overBudget.length} over budget`}
          detail={
            insights.overBudget.length > 0
              ? insights.overBudget.map((b) => b.cat).join(', ')
              : 'Every category within limits'
          }
          accent={
            insights.overBudget.length > 0
              ? isDark ? 'text-terminal-red' : 'text-light-red'
              : isDark ? 'text-terminal-accent' : 'text-light-accent'
          }
          isDark={isDark}
        />
      </div>

      {/* Category Breakdown Table */}
      <div
        className={`rounded border overflow-hidden ${
          isDark ? 'bg-terminal-card border-terminal-border' : 'bg-light-card border-light-border shadow-sm'
        }`}
      >
        <div className="p-4 pb-2">
          <h2
            className={`text-sm font-mono uppercase tracking-wider ${
              isDark ? 'text-terminal-muted' : 'text-light-muted'
            }`}
          >
            All-time Spending Breakdown
          </h2>
        </div>
        <div className="px-4 pb-4 space-y-3">
          {insights.categoryBreakdown.map(([cat, total]) => {
            const pct = insights.totalExpenseAll > 0 ? (total / insights.totalExpenseAll) * 100 : 0
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isDark ? 'text-terminal-text' : 'text-light-text'}>
                    {cat}
                  </span>
                  <span className={`font-mono ${isDark ? 'text-terminal-muted' : 'text-light-muted'}`}>
                    {formatCurrency(total)} ({pct.toFixed(1)}%)
                  </span>
                </div>
                <div
                  className={`h-1.5 rounded-full overflow-hidden ${
                    isDark ? 'bg-terminal-surface' : 'bg-light-bg'
                  }`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      isDark ? 'bg-terminal-accent' : 'bg-light-accent'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
