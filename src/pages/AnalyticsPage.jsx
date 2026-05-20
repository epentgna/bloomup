import { useState } from 'react'
import { useUserData } from '../store/useUserData'
import { fmtDuration } from '../utils/format'
import { isBadApp } from '../utils/matchBadApp'
import StreakHeatmap from '../components/StreakHeatmap'

export default function AnalyticsPage({ tracked, activeApp }) {
  const u = useUserData()
  const [newBadApp, setNewBadApp] = useState('')

  const totalSeconds = Object.values(tracked).reduce((sum, s) => sum + s, 0)
  const sorted = Object.entries(tracked).sort((a, b) => b[1] - a[1])
  const maxSeconds = sorted[0]?.[1] || 1

  return (
    <div className="analytics-page">
      <h2>Analytics</h2>

      <div className="analytics-summary">
        <div className="summary-card"><span className="summary-label">Total Time</span><span className="summary-value">{fmtDuration(totalSeconds) || '0s'}</span></div>
        <div className="summary-card"><span className="summary-label">Apps Tracked</span><span className="summary-value">{sorted.length}</span></div>
        <div className="summary-card"><span className="summary-label">Top App</span><span className="summary-value">{sorted[0]?.[0] || '—'}</span></div>
      </div>

      <h3 className="section-title">🔥 Focus History</h3>
      <p className="home-sub" style={{fontSize:'0.85rem', margin:'0 0 0.8rem'}}>Last 26 weeks of logged activity.</p>
      <StreakHeatmap focusHistory={u.focusHistory} />

      <h3 className="section-title" style={{marginTop:'2rem'}}>Time Per App</h3>
      {sorted.length === 0 ? (
        <p className="tracker-empty">Use your computer and data will appear here.</p>
      ) : (
        <div className="bar-chart">
          {sorted.map(([name, seconds]) => {
            const bad = isBadApp(name, u.badApps)
            return (
              <div key={name} className="bar-row">
                <span className="bar-label">{name}{bad ? ' 📵' : ''}</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${name === activeApp ? 'bar-active' : ''} ${bad ? 'bar-bad' : ''}`}
                    style={{ width: `${(seconds / maxSeconds) * 100}%` }}
                  />
                </div>
                <span className="bar-time">{fmtDuration(seconds)}</span>
              </div>
            )
          })}
        </div>
      )}

      <h3 className="section-title" style={{marginTop:'2rem'}}>📵 Distracting Apps</h3>
      <p className="home-sub" style={{fontSize:'0.85rem', margin:'0 0 0.8rem'}}>Time on these apps drains your plant.</p>
      <div className="bad-apps-list">
        {u.badApps.map(name => (
          <span key={name} className="bad-app-chip">{name}
            <button
              aria-label={`Remove ${name}`}
              onClick={() => u.setField('badApps', prev => prev.filter(a => a !== name))}
            >✕</button>
          </span>
        ))}
      </div>
      <form
        className="add-activity-form"
        style={{marginTop:'0.8rem'}}
        onSubmit={e => {
          e.preventDefault()
          const v = newBadApp.trim()
          if (!v) return
          if (u.badApps.some(b => b.toLowerCase() === v.toLowerCase())) {
            setNewBadApp(''); return
          }
          u.setField('badApps', prev => [...prev, v])
          setNewBadApp('')
        }}
      >
        <input
          placeholder="Add distracting app..."
          value={newBadApp}
          onChange={e => setNewBadApp(e.target.value)}
          maxLength={40}
        />
        <button type="submit" className="btn btn-signup">Add</button>
      </form>
    </div>
  )
}
