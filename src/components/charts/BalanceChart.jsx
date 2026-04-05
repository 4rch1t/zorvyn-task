import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useStore } from '../../store/useStore'

export default function BalanceChart() {
  const { transactions, theme } = useStore()
  const isDark = theme === 'dark'

  const data = useMemo(() => {
    const months = {}
    const now = new Date()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7) // YYYY-MM
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      months[key] = { month: label, income: 0, expenses: 0, balance: 0 }
    }

    transactions.forEach((t) => {
      const key = t.date.slice(0, 7)
      if (months[key]) {
        if (t.type === 'income') months[key].income += t.amount
        else months[key].expenses += t.amount
      }
    })

    let runningBalance = 0
    return Object.values(months).map((m) => {
      runningBalance += m.income - m.expenses
      return { ...m, balance: Math.round(runningBalance * 100) / 100 }
    })
  }, [transactions])

  const accent = isDark ? '#f97316' : '#ea580c'
  const accentDim = isDark ? '#f9731630' : '#ea580c30'
  const grid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const textColor = isDark ? '#6a6a80' : '#6b7280'

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={accent} stopOpacity={0.3} />
            <stop offset="95%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fontFamily: 'monospace', fill: textColor }}
          axisLine={{ stroke: grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fontFamily: 'monospace', fill: textColor }}
          axisLine={{ stroke: grid }}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? 'rgba(20,20,24,0.9)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            fontFamily: 'monospace',
            fontSize: 12,
            color: isDark ? '#e0e0e8' : '#1a1a2e',
          }}
          formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={accent}
          strokeWidth={2}
          fill="url(#balanceGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
