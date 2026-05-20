/*
 * Plant health model
 *
 * Starts at 100% each day. Distracting-app time drains the plant; logged
 * activity restores it and unlocks coin income. This is friendlier than the
 * original "starts at 50%" model — new users see a thriving plant rather
 * than a sickly one with no obvious reason.
 */
export const HEALTHY_THRESHOLD = 80
export const DAILY_COIN_CAP_BASE = 200

export function plantHealth({ activityMinutes, badMinutes }) {
  const drain = badMinutes * 0.8        // 1.25 min of bad time = 1% lost
  const restore = activityMinutes * 0.5 // 2 min of activity = 1% gained
  return Math.min(100, Math.max(0, 100 - drain + restore))
}

export function dailyCoinCap(plantLevel) {
  // Caps idle farming. Scales gently with level.
  return DAILY_COIN_CAP_BASE + plantLevel * 50
}

export function coinsPerSecond(plantHealthPct, plantLevel) {
  if (plantHealthPct < HEALTHY_THRESHOLD) return 0
  // 1 coin every 5s at level 1, faster at higher levels.
  return plantLevel / 5
}

export function streakRequiredFor(plantLevel) {
  return 4 + Math.floor(plantLevel / 2)
}
