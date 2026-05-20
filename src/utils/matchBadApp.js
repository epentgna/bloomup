/*
 * Match by whole-word boundary instead of plain substring so "Discord"
 * doesn't match "discordjs" and "YouTube" doesn't match "YouTube Music"
 * unless that's the user's intent. The pattern is anchored on word
 * boundaries (\b) but allows the user's keyword to contain spaces.
 */
export function isBadApp(appName, badApps) {
  if (!appName) return false
  const target = appName.toLowerCase()
  return badApps.some(b => {
    const k = b.toLowerCase().trim()
    if (!k) return false
    // Build a word-boundary regex; escape regex specials in the user's keyword.
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(^|\\b)${escaped}(\\b|$)`)
    return re.test(target)
  })
}
