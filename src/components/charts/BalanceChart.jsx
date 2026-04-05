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

  const accent = isDark ? '#a78bfa' : '#7c3aed'
  const grid = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
  const textColor = isDark ? '#52525b' : '#71717a'

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
            backgroundColor: isDark ? '#16161f' : '#f4f4f8',
            border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '12px',
            boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.08)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: isDark ? '#fafafa' : '#0f0f11',
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
