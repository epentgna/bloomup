import { useEffect, useRef, useState } from 'react'
import { useUserData } from '../store/useUserData'
import { useToast } from '../components/Toast'
import { fmtClock } from '../utils/format'
import { looksLikeGame } from '../data/gameKeywords'
import { IGNORED_APPS } from '../data/badAppsDefaults'
import { todayKey } from '../utils/storage'

const EMOJI_CHOICES = ['🏆','📖','🏃','💪','🎨','🎵','🧘','✍️','🍳','🌳','🧹','💼','📚','⚽','🚴','🏊','🧠','💻']

export default function ActivitiesPage({ activeApp }) {
  const u = useUserData()
  const { toast } = useToast()
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🏆')
  const timerRefs = useRef({})

  const activities = u.activities
  const timers     = u.timers

  // Cleanup any orphaned intervals on unmount.
  useEffect(() => () => {
    Object.values(timerRefs.current).forEach(h => h && clearInterval(h))
  }, [])

  function setTimer(id, value) {
    u.setField('timers', t => ({
      ...t,
      [id]: typeof value === 'function' ? value(t[id]) : value,
    }))
  }

  function startTimer(id) {
    if (timerRefs.current[id]) return
    setTimer(id, prev => ({ running: true, elapsed: prev?.elapsed || 0, startedAt: Date.now() }))
    timerRefs.current[id] = setInterval(() => {
      const cur = activeApp
      if (cur && IGNORED_APPS.includes(cur)) return
      setTimer(id, prev => ({ ...prev, running: true, elapsed: (prev?.elapsed || 0) + 1 }))
    }, 1000)
  }

  function stopTimer(id) {
    clearInterval(timerRefs.current[id])
    timerRefs.current[id] = null
    const elapsed = timers[id]?.elapsed || 0
    if (elapsed < 60) {
      setTimer(id, { running: false, elapsed: 0 })
      toast('Too short to log (need at least 60s).', { kind: 'warn' })
      return
    }
    const minutes = Math.round(elapsed / 60)
    const today = todayKey()
    u.setField('activities', prev => prev.map(a =>
      a.id === id ? { ...a, logs: [...a.logs, { minutes, date: today }] } : a
    ))
    u.setField('focusHistory', prev => ({
      ...prev,
      [today]: (prev[today] || 0) + minutes,
    }))
    setTimer(id, { running: false, elapsed: 0 })
    toast(`✅ Logged ${minutes} min`, { kind: 'good' })
  }

  function deleteActivity(id) {
    clearInterval(timerRefs.current[id])
    timerRefs.current[id] = null
    u.setField('activities', prev => prev.filter(a => a.id !== id))
    u.setField('timers',     prev => { const n = { ...prev }; delete n[id]; return n })
  }

  function addActivity(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (looksLikeGame(name)) {
      if (!u.badApps.some(b => b.toLowerCase() === name.toLowerCase())) {
        u.setField('badApps', prev => [...prev, name])
      }
      toast(`⚠️ "${name}" looks like a game — added to distracting apps.`, { kind: 'warn' })
      setNewName('')
      return
    }
    u.setField('activities', prev => [...prev, { id: Date.now(), name, emoji: newEmoji, logs: [] }])
    setNewName('')
  }

  return (
    <div className="activities-page">
      <h2>Activities</h2>
      <p className="home-sub">Log real-life activities to boost your plant! 🌱</p>

      <div className="activity-list">
        {activities.map(a => {
          const totalMins = a.logs.reduce((s, l) => s + l.minutes, 0)
          const timer = timers[a.id] || { running: false, elapsed: 0 }
          return (
            <div key={a.id} className={`activity-card ${timer.running ? 'activity-running' : ''}`}>
              <div className="activity-card-top">
                <span className="activity-emoji">{a.emoji}</span>
                <div className="activity-info">
                  <span className="activity-name">{a.name}</span>
                  <span className="activity-total">{totalMins} min logged</span>
                </div>
                <div className="activity-timer-wrap">
                  <span className="activity-timer-display">{fmtClock(timer.elapsed)}</span>
                  {!timer.running
                    ? <button className="timer-btn timer-start" onClick={() => startTimer(a.id)}>▶ Start</button>
                    : <button className="timer-btn timer-stop"  onClick={() => stopTimer(a.id)}>■ Stop & Log</button>
                  }
                  <button
                    className="timer-btn icon-btn"
                    onClick={() => deleteActivity(a.id)}
                    aria-label={`Delete ${a.name}`}
                    title="Delete"
                  >🗑</button>
                </div>
              </div>
              {a.logs.length > 0 && (
                <div className="activity-log-history">
                  {a.logs.slice(-3).reverse().map((l, i) => (
                    <span key={i} className="log-chip">{l.date}: {l.minutes}m</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <form className="add-activity-form" onSubmit={addActivity}>
        <select
          aria-label="emoji"
          value={newEmoji}
          onChange={e => setNewEmoji(e.target.value)}
          className="emoji-select"
        >
          {EMOJI_CHOICES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <input
          placeholder="Add a new activity..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          maxLength={40}
        />
        <button type="submit" className="btn btn-signup">Add</button>
      </form>

      {newName && looksLikeGame(newName) && (
        <p className="auth-error" style={{margin:'0.4rem 0 0'}}>
          ⚠️ That looks like a game — it’ll be added as a distracting app instead.
        </p>
      )}
    </div>
  )
}
