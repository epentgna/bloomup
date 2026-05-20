/*
 * Each achievement gets a `check(stats)` that returns true when unlocked.
 * `stats` shape: { plantLevel, coins, totalActivityMinutes, streakDays,
 *                  pomodorosCompleted, gardenCount, ownedAccessoriesCount,
 *                  friendsCount, focusDaysHistory }
 */
export const ACHIEVEMENTS = [
  { id: 'first-bloom',     name: 'First Bloom',      emoji: '🌱', description: 'Reach plant level 2',
    check: s => s.plantLevel >= 2 },
  { id: 'green-thumb',     name: 'Green Thumb',      emoji: '🌿', description: 'Reach plant level 5',
    check: s => s.plantLevel >= 5 },
  { id: 'gardener',        name: 'Gardener',         emoji: '🌳', description: 'Reach plant level 10',
    check: s => s.plantLevel >= 10 },
  { id: 'arborist',        name: 'Arborist',         emoji: '🎄', description: 'Reach plant level 20',
    check: s => s.plantLevel >= 20 },
  { id: 'first-hour',      name: 'First Hour',       emoji: '⏰', description: 'Log 60 minutes of activity',
    check: s => s.totalActivityMinutes >= 60 },
  { id: 'marathon',        name: 'Marathon',         emoji: '🏃', description: 'Log 600 minutes of activity',
    check: s => s.totalActivityMinutes >= 600 },
  { id: 'iron-mind',       name: 'Iron Mind',        emoji: '🧠', description: 'Log 3000 minutes of activity',
    check: s => s.totalActivityMinutes >= 3000 },
  { id: 'streak-3',        name: 'Three Day Streak', emoji: '🔥', description: 'Maintain a 3-day focus streak',
    check: s => s.streakDays >= 3 },
  { id: 'streak-7',        name: 'Week Warrior',     emoji: '🔥', description: 'Maintain a 7-day focus streak',
    check: s => s.streakDays >= 7 },
  { id: 'streak-30',       name: 'Iron Habit',       emoji: '💎', description: 'Maintain a 30-day focus streak',
    check: s => s.streakDays >= 30 },
  { id: 'pomo-1',          name: 'First Tomato',     emoji: '🍅', description: 'Complete your first Pomodoro',
    check: s => s.pomodorosCompleted >= 1 },
  { id: 'pomo-10',         name: 'Tomato Farmer',    emoji: '🍅', description: 'Complete 10 Pomodoros',
    check: s => s.pomodorosCompleted >= 10 },
  { id: 'pomo-50',         name: 'Tomato Master',    emoji: '🍅', description: 'Complete 50 Pomodoros',
    check: s => s.pomodorosCompleted >= 50 },
  { id: 'rich',            name: 'Coin Collector',   emoji: '🪙', description: 'Earn 500 coins',
    check: s => s.coins >= 500 },
  { id: 'richer',          name: 'Saver',            emoji: '💰', description: 'Earn 2000 coins',
    check: s => s.coins >= 2000 },
  { id: 'dressed-up',      name: 'Dressed Up',       emoji: '👗', description: 'Own 5 accessories',
    check: s => s.ownedAccessoriesCount >= 5 },
  { id: 'social',          name: 'Social',           emoji: '👥', description: 'Add 3 friends',
    check: s => s.friendsCount >= 3 },
  { id: 'collector',       name: 'Garden Keeper',    emoji: '🪴', description: 'Grow 3 plants in your garden',
    check: s => s.gardenCount >= 3 },
]

export function unlockedAchievements(stats) {
  return ACHIEVEMENTS.filter(a => a.check(stats))
}
