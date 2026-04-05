import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { motion } from 'framer-motion'

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getIntensity(amount, max) {
  if (amount === 0) return 0
  if (max === 0) return 0
  const pct = amount / max
  if (pct < 0.25) return 1
  if (pct < 0.5) return 2
  if (pct < 0.75) return 3
  return 4
}

const darkColors = [
  'bg-white/[0.03]',      // 0 — no spending
  'bg-z-accent/20',       // 1
  'bg-z-accent/40',       // 2
  'bg-z-accent/70',       // 3
  'bg-z-accent',          // 4
]

const lightColors = [
  'bg-black/[0.03]',      // 0
  'bg-zl-accent/20',      // 1
  'bg-zl-accent/40',      // 2
  'bg-zl-accent/70',      // 3
  'bg-zl-accent',         // 4
]

export default function SpendingHeatmap() {
  const { transactions, theme } = useStore()
  const isDark = theme === 'dark'

  // Build last 12 weeks of daily spending
  const { weeks, maxDaily, monthLabels } = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 83) // ~12 weeks
    // Move to the preceding Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay())

    // Aggregate expense amounts by date string
    const dailyTotals = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        dailyTotals[t.date] = (dailyTotals[t.date] || 0) + t.amount
      })

    const weeks = []
    let maxDaily = 0
    const d = new Date(startDate)
    const seenMonths = new Map()

    while (d <= today) {
      const weekStart = weeks.length === 0 || weeks[weeks.length - 1].length === 7
      if (weekStart) weeks.push([])

      const dateStr = d.toISOString().slice(0, 10)
      const amount = dailyTotals[dateStr] || 0
      if (amount > maxDaily) maxDaily = amount

      const month = d.getMonth()
      const weekIdx = weeks.length - 1
      if (!seenMonths.has(month) || seenMonths.get(month).week !== weekIdx) {
        seenMonths.set(month, { week: weekIdx, label: d.toLocaleDateString('en-US', { month: 'short' }) })
      }

      weeks[weeks.length - 1].push({ date: dateStr, amount, dayOfWeek: d.getDay() })
      d.setDate(d.getDate() + 1)
    }

    // Pad last week if incomplete
    while (weeks[weeks.length - 1].length < 7) {
      weeks[weeks.length - 1].push(null)
    }

    // Build month labels with their starting column
    const monthLabels = []
    const seen = new Set()
    weeks.forEach((week, wIdx) => {
      const firstDay = week.find((d) => d !== null)
      if (firstDay) {
        const m = new Date(firstDay.date).getMonth()
        if (!seen.has(m)) {
          seen.add(m)
          monthLabels.push({ col: wIdx, label: new Date(firstDay.date).toLocaleDateString('en-US', { month: 'short' }) })
        }
      }
    })

    return { weeks, maxDaily, monthLabels }
  }, [transactions])

  const colors = isDark ? darkColors : lightColors

  return (
    <div>
      {/* Month labels */}
      <div className="flex mb-1 ml-6" style={{ gap: 0 }}>
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className={`text-[10px] font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}
            style={{ position: 'relative', left: `${m.col * 16}px`, marginRight: i < monthLabels.length - 1 ? 0 : 0 }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map((d, i) => (
            <span
              key={i}
              className={`text-[9px] font-mono w-4 h-3 flex items-center justify-center ${
                isDark ? 'text-z-muted' : 'text-zl-muted'
              }`}
            >
              {i % 2 === 1 ? d : ''}
            </span>
          ))}
        </div>

        {/* Grid */}
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-0.5">
            {week.map((day, dIdx) => {
              if (!day)
                return (
                  <div key={dIdx} className="w-3 h-3 rounded-sm opacity-0" />
                )
              const intensity = getIntensity(day.amount, maxDaily)
              return (
                <motion.div
                  key={dIdx}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wIdx * 7 + dIdx) * 0.003, duration: 0.15 }}
                  title={`${day.date}: $${day.amount.toFixed(0)}`}
                  className={`w-3 h-3 rounded-sm cursor-default ${colors[intensity]}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 ml-6">
        <span className={`text-[10px] font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>Less</span>
        {colors.map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className={`text-[10px] font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>More</span>
      </div>
    </div>
  )
}
