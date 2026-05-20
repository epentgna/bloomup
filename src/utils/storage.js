export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    if (v === null) return fallback
    return JSON.parse(v)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage may be unavailable (private mode, quota); ignore.
  }
}

export function remove(key) {
  try { localStorage.removeItem(key) } catch {}
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}
