import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useStore } from '../../store/useStore'

const COLORS_DARK = ['#f97316', '#fbbf24', '#60a5fa', '#a78bfa', '#34d399', '#f87171']
const COLORS_LIGHT = ['#ea580c', '#d97706', '#2563eb', '#7c3aed', '#059669', '#dc2626']

export default function SpendingPieChart() {
  const { transactions, theme } = useStore()
  const isDark = theme === 'dark'
  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT

  const data = useMemo(() => {
    const categoryTotals = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      })

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
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
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a1a26' : '#ffffff',
              border: `1px solid ${isDark ? '#2a2a3a' : '#e0e0e5'}`,
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: 12,
              color: isDark ? '#e0e0e8' : '#1a1a2e',
            }}
            formatter={(value) => [`$${value.toLocaleString()}`]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className={isDark ? 'text-z-muted' : 'text-zl-muted'}>
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
