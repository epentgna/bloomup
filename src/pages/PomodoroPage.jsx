import PomodoroTimer from '../components/PomodoroTimer'
import { useUserData } from '../store/useUserData'
import { useToast } from '../components/Toast'
import { todayKey } from '../utils/storage'

export default function PomodoroPage() {
  const u = useUserData()
  const { toast } = useToast()

  function onSessionComplete(coinReward) {
    u.setField('coins', c => c + coinReward)
    u.setField('pomodorosCompleted', n => n + 1)
    toast(`🍅 +${coinReward} coins`, { kind: 'good' })
  }

  function onAddFocusMinutes(min) {
    const today = todayKey()
    u.setField('focusHistory', prev => ({ ...prev, [today]: (prev[today] || 0) + min }))
    // Append a synthetic activity log entry to Pomodoro virtual activity.
    u.setField('activities', prev => {
      const existing = prev.find(a => a.id === 'pomo')
      if (existing) {
        return prev.map(a => a.id === 'pomo'
          ? { ...a, logs: [...a.logs, { minutes: min, date: today }] }
          : a)
      }
      return [...prev, { id: 'pomo', name: 'Pomodoro Focus', emoji: '🍅', logs: [{ minutes: min, date: today }] }]
    })
  }

  function notify(title, body) {
    window.electronAPI?.notify?.(title, body)
  }

  return (
    <div className="pomodoro-page">
      <h2>🍅 Pomodoro</h2>
      <p className="home-sub">
        Focus in timed blocks. Each completed session feeds your plant and earns you 25 bonus coins.
      </p>
      <div className="pomo-stats-row">
        <div className="summary-card"><span className="summary-label">Sessions ever</span><span className="summary-value">{u.pomodorosCompleted}</span></div>
      </div>
      <PomodoroTimer
        onSessionComplete={onSessionComplete}
        onAddFocusMinutes={onAddFocusMinutes}
        onNotify={notify}
      />
    </div>
  )
}
