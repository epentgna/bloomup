import Plant from '../components/Plant'
import HealthBar from '../components/HealthBar'
import StreakDots from '../components/StreakDots'
import { useUserData } from '../store/useUserData'

export default function HomePage({
  activeApp, plantHealth, totalActivityMinutes, badMinutes,
  streakRequired, dailyCoinsRemaining,
}) {
  const u = useUserData()

  const balanceTotal = totalActivityMinutes + badMinutes
  const activityPct  = balanceTotal > 0 ? Math.round((totalActivityMinutes / balanceTotal) * 100) : 50
  const digitalPct   = 100 - activityPct

  const tips = []
  if (plantHealth < 30) tips.push({ icon: '🚨', text: 'Your plant is critical! Log any activity right now to recover.' })
  else if (plantHealth < 60) tips.push({ icon: '🥀', text: 'Health is low. Try logging 30+ minutes of exercise.' })
  else if (plantHealth < 80) tips.push({ icon: '💧', text: `You need ${80 - Math.round(plantHealth)}% more health to start earning coins.` })
  if (badMinutes >= 30) tips.push({ icon: '📵', text: `You've spent ${badMinutes} min on distracting apps today.` })
  else if (badMinutes > 0) tips.push({ icon: '⚠️', text: `${badMinutes} min on distracting apps is hurting your plant.` })
  if (totalActivityMinutes === 0) tips.push({ icon: '🏃', text: 'No activities logged yet. Head to Activities and start a timer!' })
  else if (totalActivityMinutes < 30) tips.push({ icon: '💪', text: `Good start! ${30 - totalActivityMinutes} more minutes of activity will boost your health.` })
  if (plantHealth >= 80 && u.streak.days === 0) tips.push({ icon: '🔥', text: 'Great health! Keep it above 80% every day to build your streak.' })
  if (u.streak.days >= 2) tips.push({ icon: '⭐', text: `${u.streak.days} day streak! Keep going — ${streakRequired - u.streak.days} more days to level up.` })
  if (u.ownedAccessories.length === 0 && u.coins >= 20) tips.push({ icon: '🛒', text: 'You have enough coins to buy an accessory! Check the Shop.' })
  if (dailyCoinsRemaining <= 0 && plantHealth >= 80) tips.push({ icon: '🛑', text: 'Daily coin cap reached. Resets at midnight — try a Pomodoro session for bonus coins!' })
  if (tips.length === 0) tips.push({ icon: '🌳', text: 'Your plant is thriving! Keep up the great work.' })

  return (
    <div className="home-layout">
      <div className="home-page">
        <div className="home-top-row">
          <div>
            <h2>Welcome back 👋</h2>
            <p className="home-sub">Your virtual plant grows as you stay focused.</p>
          </div>
          <div className="level-badge">Lv.{u.plantLevel}</div>
        </div>

        <div className="plant-container">
          <Plant
            level={u.plantLevel}
            speciesId={u.selectedSpecies}
            accessories={u.ownedAccessories}
            accPositions={u.accPositions}
            onMoveAccessory={(id, pos) => u.setField('accPositions', p => ({ ...p, [id]: pos }))}
          />
          <p className="plant-label">🌱 Level {u.plantLevel} {u.selectedSpecies}</p>
          {import.meta.env.DEV && (
            <button
              className="btn btn-login dev-only-btn"
              onClick={() => u.setField('plantLevel', l => l + 1)}
            >⬆ Level Up (dev)</button>
          )}
        </div>

        {activeApp && <p className="home-active">Currently tracking: <strong>{activeApp}</strong></p>}

        <HealthBar health={plantHealth} badMinutes={badMinutes} />

        <StreakDots days={u.streak.days} required={streakRequired} />

        <div className="tips-box">
          <span className="tips-title">💡 Tips</span>
          {tips.slice(0, 3).map((t, i) => (
            <div key={i} className="tip-row"><span>{t.icon}</span><span>{t.text}</span></div>
          ))}
        </div>
      </div>

      <div className="balance-bar-vertical">
        <div className="balance-v-top-label">
          <span className="balance-label-bad">📱</span>
          <span className="balance-label-bad">{badMinutes}m</span>
          <span className="balance-label-bad">{digitalPct}%</span>
        </div>
        <div className="balance-v-track">
          <div className="balance-v-bad"  style={{ height: `${digitalPct}%` }} />
          <div className="balance-v-good" style={{ height: `${activityPct}%` }} />
        </div>
        <div className="balance-v-bottom-label">
          <span className="balance-label-good">{activityPct}%</span>
          <span className="balance-label-good">{totalActivityMinutes}m</span>
          <span className="balance-label-good">🏃</span>
        </div>
      </div>
    </div>
  )
}
