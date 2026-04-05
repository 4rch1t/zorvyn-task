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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function InsightCard({ icon: Icon, label, value, detail, stripe, isDark }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`glass card-glow accent-stripe ${stripe} rounded-2xl p-5 pl-6`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <Icon size={16} className={isDark ? 'text-z-muted' : 'text-zl-muted'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] uppercase tracking-widest font-medium mb-1 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            {label}
          </p>
          <p className={`text-lg font-mono font-bold truncate ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
            {value}
          </p>
          {detail && (
            <p className={`text-xs mt-1 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
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
    warning: isDark ? 'border-z-amber/20 bg-z-amber/5' : 'border-zl-amber/20 bg-zl-amber/5',
    good: isDark ? 'border-z-green/20 bg-z-green/5' : 'border-zl-green/20 bg-zl-green/5',
    info: isDark ? 'border-z-blue/20 bg-z-blue/5' : 'border-zl-blue/20 bg-zl-blue/5',
  }
  const iconColor = {
    warning: isDark ? 'text-z-amber' : 'text-zl-amber',
    good: isDark ? 'text-z-green' : 'text-zl-green',
    info: isDark ? 'text-z-blue' : 'text-zl-blue',
  }
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${colorMap[type]}`}>
      <Lightbulb size={16} className={`mt-0.5 shrink-0 ${iconColor[type]}`} />
      <p className={`text-sm ${isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}`}>{text}</p>
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
    thisMonthTxns
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      })

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

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

    const expenses = transactions.filter((t) => t.type === 'expense')
    const biggestExpense = expenses.reduce(
      (max, t) => (t.amount > max.amount ? t : max),
      expenses[0] || { amount: 0, description: 'N/A', category: 'N/A' }
    )

    const thisMonthIncome = thisMonthTxns
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const lastMonthIncome = lastMonthTxns
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)

    const thisMonthSavings = thisMonthIncome - thisMonthExpenses
    const lastMonthSavings = lastMonthIncome - lastMonthExpenses

    const subscriptionTotal = transactions
      .filter((t) => t.category === 'Subscriptions' && t.date.startsWith(thisMonth))
      .reduce((s, t) => s + t.amount, 0)

    const allCategoryTotals = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        allCategoryTotals[t.category] = (allCategoryTotals[t.category] || 0) + t.amount
      })

    const categoryBreakdown = Object.entries(allCategoryTotals).sort((a, b) => b[1] - a[1])
    const totalExpenseAll = Object.values(allCategoryTotals).reduce((s, v) => s + v, 0)

    const overBudget = Object.entries(budgets)
      .filter(([cat, limit]) => (categoryTotals[cat] || 0) > limit)
      .map(([cat, limit]) => ({ cat, limit, spent: categoryTotals[cat] }))

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
      <div className={`text-center py-20 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
        <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg">No data to analyze</p>
        <p className="text-sm mt-1 opacity-60">Add some transactions first</p>
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
      <motion.div variants={fadeUp}>
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
          Insights
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
          Patterns, alerts, and recommendations from your transaction history.
        </p>
      </motion.div>

      {/* Recommendations */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-5 space-y-2">
        <h2 className={`text-[11px] uppercase tracking-widest font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
          <Lightbulb size={14} /> Recommendations
        </h2>
        {insights.recs.map((r, i) => (
          <Recommendation key={i} text={r.text} type={r.type} isDark={isDark} />
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
        <InsightCard
          icon={BarChart3}
          label="Top Spending Category"
          value={insights.topCategory ? insights.topCategory[0] : 'No expenses yet'}
          detail={insights.topCategory ? `${formatCurrency(insights.topCategory[1])} this month` : undefined}
          stripe="stripe-amber"
          isDark={isDark}
        />
        <InsightCard
          icon={insights.expenseChange > 0 ? TrendingUp : TrendingDown}
          label="Expense Trend (MoM)"
          value={`${insights.expenseChange >= 0 ? '+' : ''}${insights.expenseChange.toFixed(1)}%`}
          detail={`${formatCurrency(insights.lastMonthExpenses)} → ${formatCurrency(insights.thisMonthExpenses)}`}
          stripe={insights.expenseChange > 0 ? 'stripe-red' : 'stripe-green'}
          isDark={isDark}
        />
        <InsightCard
          icon={AlertTriangle}
          label="Largest Single Expense"
          value={formatCurrency(insights.biggestExpense.amount)}
          detail={insights.biggestExpense.description}
          stripe="stripe-violet"
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
          stripe={insights.thisMonthSavings >= insights.lastMonthSavings ? 'stripe-green' : 'stripe-red'}
          isDark={isDark}
        />
        <InsightCard
          icon={Repeat}
          label="Monthly Subscriptions"
          value={formatCurrency(insights.subscriptionTotal)}
          detail={insights.subscriptionTotal > 70 ? 'Consider auditing unused services' : 'Within reasonable range'}
          stripe="stripe-cyan"
          isDark={isDark}
        />
        <InsightCard
          icon={Target}
          label="Budget Alerts"
          value={insights.overBudget.length === 0 ? 'All on track' : `${insights.overBudget.length} over budget`}
          detail={insights.overBudget.length > 0 ? insights.overBudget.map((b) => b.cat).join(', ') : 'Every category within limits'}
          stripe={insights.overBudget.length > 0 ? 'stripe-red' : 'stripe-green'}
          isDark={isDark}
        />
      </motion.div>

      {/* Category Breakdown */}
      <motion.div variants={fadeUp} className="glass rounded-2xl overflow-hidden">
        <div className="p-5 pb-2">
          <h2 className={`text-[11px] uppercase tracking-widest font-medium ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            All-time Spending Breakdown
          </h2>
        </div>
        <div className="px-5 pb-5 space-y-4">
          {insights.categoryBreakdown.map(([cat, total]) => {
            const pct = insights.totalExpenseAll > 0 ? (total / insights.totalExpenseAll) * 100 : 0
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className={isDark ? 'text-z-text-secondary' : 'text-zl-text-secondary'}>{cat}</span>
                  <span className={`font-mono text-xs ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
                    {formatCurrency(total)} ({pct.toFixed(1)}%)
                  </span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${isDark ? 'bg-z-accent' : 'bg-zl-accent'}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
