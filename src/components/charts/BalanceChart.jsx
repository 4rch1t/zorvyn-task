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
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
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

  const accent = isDark ? '#f59e0b' : '#b45309'
  const grid = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
  const textColor = isDark ? '#5c5c5a' : '#78786e'

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={accent} stopOpacity={0.4} />
            <stop offset="95%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fill: textColor }}
          axisLine={{ stroke: grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fill: textColor }}
          axisLine={{ stroke: grid }}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1c1c1e' : '#edede8',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: isDark ? '#e8e8e6' : '#1a1a18',
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
