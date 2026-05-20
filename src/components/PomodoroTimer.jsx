import { useEffect, useRef, useState } from 'react'
import { fmtClock } from '../utils/format'

const PRESETS = [
  { id: '25-5',  focus: 25,  break: 5,  name: 'Classic'  },
  { id: '50-10', focus: 50,  break: 10, name: 'Deep'     },
  { id: '90-15', focus: 90,  break: 15, name: 'Flow'     },
  { id: 'demo',  focus: 0.1, break: 0.1, name: 'Demo'    },
]

const COIN_REWARD = 25

export default function PomodoroTimer({ onSessionComplete, onAddFocusMinutes, onNotify }) {
  const [presetId, setPresetId] = useState('25-5')
  const preset = PRESETS.find(p => p.id === presetId)
  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  const [remaining, setRemaining] = useState(preset.focus * 60)
  const [running, setRunning] = useState(false)
  const [cyclesToday, setCyclesToday] = useState(0)
  const intervalRef = useRef(null)
  const startedAt = useRef(null)
  const lastTick = useRef(null)

  useEffect(() => {
    if (running) return
    setRemaining((mode === 'focus' ? preset.focus : preset.break) * 60)
  }, [presetId, mode, preset.focus, preset.break, running])

  useEffect(() => {
    if (!running) return
    lastTick.current = Date.now()
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const dt = Math.floor((now - lastTick.current) / 1000)
      if (dt < 1) return
      lastTick.current = now
      setRemaining(r => {
        const next = r - dt
        if (next <= 0) {
          handleComplete()
          return 0
        }
        return next
      })
    }, 250)
    return () => clearInterval(intervalRef.current)
  }, [running])

  function handleComplete() {
    clearInterval(intervalRef.current)
    setRunning(false)
    if (mode === 'focus') {
      const focusMin = preset.focus
      onAddFocusMinutes?.(focusMin)
      onSessionComplete?.(COIN_REWARD)
      onNotify?.('🍅 Focus complete', `Great work — take a ${preset.break} min break.`)
      setCyclesToday(c => c + 1)
      setMode('break')
      setRemaining(preset.break * 60)
    } else {
      onNotify?.('☕ Break over', 'Ready for another focus block?')
      setMode('focus')
      setRemaining(preset.focus * 60)
    }
  }

  function toggle() {
    if (!running) startedAt.current = Date.now()
    setRunning(r => !r)
  }

  function reset() {
    setRunning(false)
    setMode('focus')
    setRemaining(preset.focus * 60)
  }

  const total = (mode === 'focus' ? preset.focus : preset.break) * 60
  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0
  const circumference = 2 * Math.PI * 90
  const dashOffset = circumference * (1 - pct / 100)

  return (
    <div className="pomodoro-wrap">
      <div className="pomodoro-presets">
        {PRESETS.filter(p => p.id !== 'demo' || import.meta.env.DEV).map(p => (
          <button
            key={p.id}
            disabled={running}
            className={`pomo-preset ${p.id === presetId ? 'active' : ''}`}
            onClick={() => { setPresetId(p.id); setMode('focus') }}
          >
            <strong>{p.name}</strong>
            <span>{p.focus}/{p.break}</span>
          </button>
        ))}
      </div>

      <div className={`pomodoro-circle ${mode === 'break' ? 'break-mode' : ''}`}>
        <svg viewBox="0 0 200 200" width="220" height="220" aria-hidden="true">
          <circle cx="100" cy="100" r="90" className="pomo-ring-bg" />
          <circle
            cx="100" cy="100" r="90"
            className="pomo-ring-fg"
            style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="pomodoro-display">
          <div className="pomo-mode">{mode === 'focus' ? '🍅 Focus' : '☕ Break'}</div>
          <div className="pomo-time">{fmtClock(remaining)}</div>
          <div className="pomo-cycles">Sessions today: {cyclesToday}</div>
        </div>
      </div>

      <div className="pomodoro-controls">
        <button className="btn btn-signup" onClick={toggle}>
          {running ? '⏸ Pause' : remaining < total ? '▶ Resume' : '▶ Start'}
        </button>
        <button className="btn btn-login" onClick={reset}>↺ Reset</button>
      </div>
    </div>
  )
}
