export function fmtClock(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':')
}

export function fmtDuration(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function fmtDate(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

export function daysBetween(aIso, bIso) {
  const a = new Date(aIso + 'T00:00:00Z')
  const b = new Date(bIso + 'T00:00:00Z')
  return Math.round((b - a) / 86400000)
}
