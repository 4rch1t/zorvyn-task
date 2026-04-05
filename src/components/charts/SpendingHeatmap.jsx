import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { motion } from 'framer-motion'

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getIntensity(amount, max) {
  if (amount === 0 || max === 0) return 0
  const pct = amount / max
  if (pct < 0.25) return 1
  if (pct < 0.5) return 2
  if (pct < 0.75) return 3
  return 4
}

/* Color scale: z-elevated (zero) -> z-accent-bright (max) */
const darkColors = [
  'bg-[#161d2e]',          // 0 — no spending
  'bg-[#89b4e0]/20',       // 1
  'bg-[#89b4e0]/40',       // 2
  'bg-[#89b4e0]/70',       // 3
  'bg-[#89b4e0]',          // 4
]

const lightColors = [
  'bg-[#f8f8f5]',          // 0
  'bg-[#3d7ab5]/20',       // 1
  'bg-[#3d7ab5]/40',       // 2
  'bg-[#3d7ab5]/70',       // 3
  'bg-[#3d7ab5]',          // 4
]

export default function SpendingHeatmap() {
  const { transactions, theme } = useStore()
  const isDark = theme === 'dark'

  const { weeks, maxDaily, monthLabels } = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 83)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const dailyTotals = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        dailyTotals[t.date] = (dailyTotals[t.date] || 0) + t.amount
      })

    const weeks = []
    let maxDaily = 0
    const d = new Date(startDate)

    while (d <= today) {
      if (weeks.length === 0 || weeks[weeks.length - 1].length === 7) weeks.push([])

      const dateStr = d.toISOString().slice(0, 10)
      const amount = dailyTotals[dateStr] || 0
      if (amount > maxDaily) maxDaily = amount

      weeks[weeks.length - 1].push({ date: dateStr, amount, dayOfWeek: d.getDay() })
      d.setDate(d.getDate() + 1)
    }

    while (weeks[weeks.length - 1].length < 7) {
      weeks[weeks.length - 1].push(null)
    }

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
            style={{ position: 'relative', left: `${m.col * 14}px` }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1">
          {dayLabels.map((d, i) => (
            <span
              key={i}
              className={`text-[10px] font-mono w-4 h-2.5 flex items-center justify-center ${
                isDark ? 'text-z-muted' : 'text-zl-muted'
              }`}
            >
              {i % 2 === 1 ? d : ''}
            </span>
          ))}
        </div>

        {/* Grid — 10x10px rounded cells */}
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-[3px]">
            {week.map((day, dIdx) => {
              if (!day)
                return <div key={dIdx} className="w-2.5 h-2.5 rounded-[3px] opacity-0" />
              const intensity = getIntensity(day.amount, maxDaily)
              return (
                <motion.div
                  key={dIdx}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wIdx * 7 + dIdx) * 0.003, duration: 0.15 }}
                  title={`${day.date}: $${day.amount.toFixed(0)}`}
                  className={`w-2.5 h-2.5 rounded-[3px] cursor-default ${colors[intensity]}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 ml-6">
        <span className={`text-[10px] font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>Less</span>
        {colors.map((c, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-[3px] ${c}`} />
        ))}
        <span className={`text-[10px] font-mono ${isDark ? 'text-z-muted' : 'text-zl-muted'}`}>More</span>
      </div>
    </div>
  )
}
