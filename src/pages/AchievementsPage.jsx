import { useMemo } from 'react'
import { useUserData } from '../store/useUserData'
import { ACHIEVEMENTS, unlockedAchievements } from '../data/achievements'
import StreakHeatmap from '../components/StreakHeatmap'

export default function AchievementsPage({ totalActivityMinutes }) {
  const u = useUserData()

  const stats = useMemo(() => ({
    plantLevel:             u.plantLevel,
    coins:                  u.coins,
    totalActivityMinutes,
    streakDays:             u.streak.days,
    pomodorosCompleted:     u.pomodorosCompleted,
    gardenCount:            u.garden.length,
    ownedAccessoriesCount:  u.ownedAccessories.length,
    friendsCount:           u.friends.length,
  }), [u.plantLevel, u.coins, totalActivityMinutes, u.streak.days, u.pomodorosCompleted,
       u.garden.length, u.ownedAccessories.length, u.friends.length])

  const unlocked = unlockedAchievements(stats)
  const unlockedIds = new Set(unlocked.map(a => a.id))

  return (
    <div className="achievements-page">
      <h2>🏆 Achievements</h2>
      <p className="home-sub">
        {unlocked.length} of {ACHIEVEMENTS.length} unlocked
      </p>

      <h3 className="section-title">🔥 Focus Heatmap</h3>
      <StreakHeatmap focusHistory={u.focusHistory} />

      <h3 className="section-title" style={{marginTop:'2rem'}}>Badges</h3>
      <div className="ach-grid">
        {ACHIEVEMENTS.map(a => {
          const got = unlockedIds.has(a.id)
          return (
            <div key={a.id} className={`ach-card ${got ? 'unlocked' : 'locked'}`}>
              <span className="ach-emoji">{got ? a.emoji : '🔒'}</span>
              <span className="ach-name">{a.name}</span>
              <span className="ach-desc">{a.description}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
