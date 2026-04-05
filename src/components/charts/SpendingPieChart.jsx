import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useStore } from '../../store/useStore'

const COLORS_DARK = ['#89b4e0', '#6b8db5', '#60a5fa', '#a78bfa', '#4ade80', '#fbbf24']
const COLORS_LIGHT = ['#3d7ab5', '#4a6580', '#2563eb', '#7c3aed', '#16a34a', '#d97706']

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function SpendingPieChart() {
  const { transactions, theme } = useStore()
  const isDark = theme === 'dark'
  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT

  const { data, total } = useMemo(() => {
    const categoryTotals = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      })
    const total = Object.values(categoryTotals).reduce((s, v) => s + v, 0)
    const data = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
    return { data, total }
  }, [transactions])

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[260px] text-sm ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
        No expense data
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#161d2e' : '#f8f8f5',
                border: `1px solid ${isDark ? 'rgba(107,141,181,0.25)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '12px',
                boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.08)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: isDark ? '#f5f5f2' : '#1a1a2e',
              }}
              formatter={(value) => [`$${value.toLocaleString()}`]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Donut hole — total in JetBrains Mono */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`font-mono text-lg font-bold tracking-tight ${isDark ? 'text-z-text' : 'text-zl-text'}`}>
            {formatCurrency(total)}
          </span>
          <span className={`text-[10px] uppercase tracking-[0.12em] ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
            Total
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className={`font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
