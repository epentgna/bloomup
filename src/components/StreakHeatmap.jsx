/*
 * GitHub-style heatmap of the last 26 weeks of focus activity.
 *
 * `focusHistory` is an object keyed by ISO date (YYYY-MM-DD) → minutes logged
 * that day. We bucket each day into one of 5 intensities.
 */
const WEEKS = 26

function bucket(minutes) {
  if (!minutes)        return 0
  if (minutes < 15)    return 1
  if (minutes < 45)    return 2
  if (minutes < 120)   return 3
  return 4
}

function iso(d) { return d.toISOString().slice(0, 10) }

export default function StreakHeatmap({ focusHistory = {} }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startOffset = today.getDay()
  const start = new Date(today)
  start.setDate(start.getDate() - startOffset - (WEEKS - 1) * 7)

  const columns = []
  for (let w = 0; w < WEEKS; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start)
      dt.setDate(dt.getDate() + w * 7 + d)
      if (dt > today) { col.push(null); continue }
      const key = iso(dt)
      col.push({ key, minutes: focusHistory[key] || 0, level: bucket(focusHistory[key] || 0) })
    }
    columns.push(col)
  }

  return (
    <div className="heatmap" role="img" aria-label="Focus heatmap of the last 26 weeks">
      {columns.map((col, ci) => (
        <div key={ci} className="heatmap-col">
          {col.map((cell, ri) => (
            <div
              key={ri}
              className={`heatmap-cell ${cell ? `heat-${cell.level}` : 'heat-empty'}`}
              title={cell ? `${cell.key}: ${cell.minutes} min` : ''}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
