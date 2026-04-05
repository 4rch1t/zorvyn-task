import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useStore } from '../../store/useStore'

const COLORS_DARK = ['#f59e0b', '#d97706', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6']
const COLORS_LIGHT = ['#b45309', '#92400e', '#2563eb', '#16a34a', '#dc2626', '#7c3aed']

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
                backgroundColor: isDark ? '#1c1c1e' : '#edede8',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: isDark ? '#e8e8e6' : '#1a1a18',
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
