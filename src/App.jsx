import { useState, useEffect, useRef } from 'react'
import './App.css'
import { db } from './firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

function App() {
  const [tab, setTab] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [account, setAccount] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [authError, setAuthError] = useState('')

  function getAccounts() {
    try { return JSON.parse(localStorage.getItem('accounts')) || {} } catch { return {} }
  }

  function handleSignUp(e) {
    e.preventDefault()
    const accounts = getAccounts()
    if (accounts[email]) { setAuthError('An account with this email already exists.'); return }
    accounts[email] = password
    localStorage.setItem('accounts', JSON.stringify(accounts))
    setAccount(email)
    setTab(null)
    setEmail('')
    setPassword('')
    setRemember(false)
    setAuthError('')
    setLoggedIn(true)
  }

  function handleLogin(e) {
    e.preventDefault()
    const accounts = getAccounts()
    if (!accounts[email]) { setAuthError('No account found with this email.'); return }
    if (accounts[email] !== password) { setAuthError('Incorrect password.'); return }
    setAccount(email)
    setTab(null)
    setEmail('')
    setPassword('')
    setAuthError('')
    setLoggedIn(true)
  }

  function handleDemo() {
    const accounts = getAccounts()
    if (!accounts['test1@gmail.com']) {
      accounts['test1@gmail.com'] = 'demo'
      localStorage.setItem('accounts', JSON.stringify(accounts))
    }
    setAccount('test1@gmail.com')
    setLoggedIn(true)
  }

  if (loggedIn) {
    return <Tracker account={account} onLogout={() => { setLoggedIn(false); setAccount(null) }} />
  }

  return (
    <>
      <div className="auth-screen">
        <div className="auth-logo">🌿 BloomUp</div>
        <p className="auth-tagline">Grow your plant. Focus your life.</p>
        <div className="auth-buttons">
          <button className="btn btn-login auth-btn" onClick={() => setTab('login')}>Login</button>
          <button className="btn btn-signup auth-btn" onClick={() => setTab('signup')}>Sign Up</button>
        </div>
        <button className="btn btn-demo" style={{marginTop:'0.8rem', width:'260px'}} onClick={handleDemo}>Try Demo</button>
      </div>

      {tab === 'login' && (
        <div className="modal-overlay" onClick={() => { setTab(null); setAuthError('') }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="btn btn-signup" style={{width:'100%'}}>Login</button>
            </form>
            <button className="modal-close" onClick={() => { setTab(null); setAuthError('') }}>✕</button>
          </div>
        </div>
      )}

      {tab === 'signup' && (
        <div className="modal-overlay" onClick={() => { setTab(null); setAuthError('') }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create Account</h2>
            <form onSubmit={handleSignUp}>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <div className="remember">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="btn btn-signup" style={{width:'100%'}}>Create Account</button>
            </form>
            <button className="modal-close" onClick={() => { setTab(null); setAuthError('') }}>✕</button>
          </div>
        </div>
      )}
    </>
  )
}

export default App

const DEFAULT_ACTIVITIES = [
  { id: 1, name: 'Soccer', emoji: '⚽', logs: [] },
  { id: 2, name: 'Running', emoji: '🏃', logs: [] },
  { id: 3, name: 'Reading', emoji: '📖', logs: [] },
]

const ACCESSORIES = [
  { id: 'sparkles', name: 'Sparkles', emoji: '✨', price: 20 },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', price: 40 },
  { id: 'flowers', name: 'Flowers', emoji: '🌸', price: 50 },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', price: 75 },
  { id: 'sun', name: 'Sunshine', emoji: '☀️', price: 90 },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', price: 120 },
  { id: 'star', name: 'Star', emoji: '⭐', price: 150 },
  { id: 'crown', name: 'Crown', emoji: '👑', price: 200 },
]

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

function Tracker({ account, onLogout }) {
  const k = (key) => `${account}:${key}`
  const [page, setPage] = useState('home')
  const [tracked, setTracked] = useState({})
  const [activeApp, setActiveApp] = useState(null)
  const [activities, setActivities] = useState(() => load(k('activities'), DEFAULT_ACTIVITIES))
  const [newActivityName, setNewActivityName] = useState('')
  const [timers, setTimers] = useState({})
  const timerRefs = useRef({})
  const [badApps, setBadApps] = useState(() => load(k('badApps'), ['Minecraft', 'Roblox', 'Steam', 'Discord', 'TikTok', 'Instagram', 'YouTube']))
  const [newBadApp, setNewBadApp] = useState('')
  const ignored = ['Electron', 'electron', 'BloomUp', 'Finder']
  const activeAppRef = useRef(null)
  const [friends, setFriends] = useState(() => load(k('friends'), []))
  const [newFriend, setNewFriend] = useState('')
  const [friendError, setFriendError] = useState('')
  const [lbEntries, setLbEntries] = useState([])
  const [lbLoading, setLbLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { localStorage.setItem(k('friends'), JSON.stringify(friends)) }, [friends])

  // Persistent state
  const [coins, setCoins] = useState(() => load(k('coins'), 0))
  const [plantLevel, setPlantLevel] = useState(() => load(k('plantLevel'), 1))
  const [streak, setStreak] = useState(() => load(k('streak'), { days: 0, lastDate: null }))
  const [ownedAccessories, setOwnedAccessories] = useState(() => load(k('ownedAccessories'), []))
  const [accPositions, setAccPositions] = useState(() => load(k('accPositions'), {}))
  const [levelUpMsg, setLevelUpMsg] = useState(null)
  const draggingRef = useRef(null)

  // Load from Firestore on login (cross-device sync)
  useEffect(() => {
    getDoc(doc(db, 'users', account)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        if (d.coins !== undefined) setCoins(d.coins)
        if (d.plantLevel !== undefined) setPlantLevel(d.plantLevel)
        if (d.streak !== undefined) setStreak(d.streak)
        if (d.activities !== undefined) setActivities(d.activities)
        if (d.ownedAccessories !== undefined) setOwnedAccessories(d.ownedAccessories)
        if (d.badApps !== undefined) setBadApps(d.badApps)
        if (d.friends !== undefined) setFriends(d.friends)
      }
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [account])

  useEffect(() => { localStorage.setItem(k('ownedAccessories'), JSON.stringify(ownedAccessories)) }, [ownedAccessories])
  useEffect(() => { localStorage.setItem(k('accPositions'), JSON.stringify(accPositions)) }, [accPositions])

  function onAccMouseDown(e, id) {
    e.preventDefault()
    const wrap = e.currentTarget.closest('.plant-img-wrap')
    const rect = wrap.getBoundingClientRect()
    draggingRef.current = { id, wrap }
    function onMove(me) {
      const x = ((me.clientX - rect.left) / rect.width) * 100
      const y = ((me.clientY - rect.top) / rect.height) * 100
      setAccPositions(prev => ({ ...prev, [id]: { x: Math.min(90, Math.max(5, x)), y: Math.min(90, Math.max(5, y)) } }))
    }
    function onUp() {
      draggingRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Persist on change
  useEffect(() => { localStorage.setItem(k('coins'), JSON.stringify(coins)) }, [coins])
  useEffect(() => { localStorage.setItem(k('plantLevel'), JSON.stringify(plantLevel)) }, [plantLevel])
  useEffect(() => { localStorage.setItem(k('streak'), JSON.stringify(streak)) }, [streak])

  // Sync ALL data to Firestore when it changes
  useEffect(() => {
    if (!loaded) return
    setDoc(doc(db, 'users', account), {
      email: account, plantLevel, coins, streak,
      activities, ownedAccessories, badApps, friends
    }, { merge: true }).catch(() => {})
  }, [plantLevel, coins, streak, activities, ownedAccessories, badApps, friends])

  // Load leaderboard from Firestore
  useEffect(() => {
    if (page !== 'leaderboard' || !loaded) return
    setLbLoading(true)
    const roster = [account, ...friends.filter(f => f !== account)]
    Promise.all(roster.map(async em => {
      try {
        const snap = await getDoc(doc(db, 'users', em))
        return snap.exists() ? { ...snap.data(), isMe: em === account } : { email: em, plantLevel: 1, coins: 0, isMe: em === account }
      } catch { return { email: em, plantLevel: 1, coins: 0, isMe: em === account } }
    })).then(entries => {
      setLbEntries(entries.sort((a, b) => b.plantLevel - a.plantLevel || b.coins - a.coins))
      setLbLoading(false)
    })
  }, [page, friends, loaded])

  const totalActivityMinutes = activities.reduce(
    (sum, a) => sum + a.logs.reduce((s, l) => s + l.minutes, 0), 0
  )
  const badSeconds = Object.entries(tracked)
    .filter(([name]) => badApps.some(b => name.toLowerCase().includes(b.toLowerCase())))
    .reduce((sum, [, s]) => sum + s, 0)
  const badMinutes = Math.round(badSeconds / 60)
  const plantHealth = Math.min(100, Math.max(0, 50 + Math.round((totalActivityMinutes / 120) * 50) - Math.round(badMinutes / 2)))

  // Daily streak check
  const streakRequired = 4 + Math.floor(plantLevel / 2)
  useEffect(() => {
    const today = new Date().toLocaleDateString()
    if (streak.lastDate === today) return
    const newDays = plantHealth >= 80 ? streak.days + 1 : 0
    const newStreak = { days: newDays, lastDate: today }
    if (newDays >= streakRequired) {
      const newLevel = plantLevel + 1
      setPlantLevel(newLevel)
      setLevelUpMsg(`🎉 Level Up! Your plant is now Level ${newLevel}!`)
      setTimeout(() => setLevelUpMsg(null), 4000)
      setStreak({ days: 0, lastDate: today })
    } else {
      setStreak(newStreak)
    }
  }, [plantHealth])

  // Income: earn coins/sec only when health >= 80%, amount = plantLevel
  useEffect(() => {
    const inc = setInterval(() => {
      setCoins(c => plantHealth >= 80 ? c + plantLevel : c)
    }, 1000)
    return () => clearInterval(inc)
  }, [plantHealth, plantLevel])

  // Electron tracking
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onActiveApp((appName) => {
        setActiveApp(appName)
        activeAppRef.current = appName
        if (!ignored.includes(appName)) {
          setTracked(prev => ({ ...prev, [appName]: (prev[appName] || 0) + 1 }))
        }
      })
    }
  }, [])

  function startTimer(id) {
    if (timerRefs.current[id]) return
    setTimers(prev => ({ ...prev, [id]: { running: true, elapsed: prev[id]?.elapsed || 0 } }))
    timerRefs.current[id] = setInterval(() => {
      const cur = activeAppRef.current
      if (cur && ignored.includes(cur)) return
      setTimers(prev => ({ ...prev, [id]: { running: true, elapsed: (prev[id]?.elapsed || 0) + 1 } }))
    }, 1000)
  }

  function stopTimer(id) {
    clearInterval(timerRefs.current[id])
    timerRefs.current[id] = null
    const elapsed = timers[id]?.elapsed || 0
    if (elapsed < 60) { setTimers(prev => ({ ...prev, [id]: { running: false, elapsed: 0 } })); return }
    const minutes = Math.round(elapsed / 60)
    setActivities(prev => prev.map(a =>
      a.id === id ? { ...a, logs: [...a.logs, { minutes, date: new Date().toLocaleDateString() }] } : a
    ))
    setTimers(prev => ({ ...prev, [id]: { running: false, elapsed: 0 } }))
  }

  function fmtTimer(s) {
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
      .map(n => String(n).padStart(2, '0')).join(':')
  }

  function fmt(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${sec}s`
    return `${sec}s`
  }

  const totalSeconds = Object.values(tracked).reduce((sum, s) => sum + s, 0)
  const sorted = Object.entries(tracked).sort((a, b) => b[1] - a[1])
  const maxSeconds = sorted[0]?.[1] || 1
  const plantSize = 220

  const balanceTotal = totalActivityMinutes + badMinutes
  const activityPct = balanceTotal > 0 ? Math.round((totalActivityMinutes / balanceTotal) * 100) : 50
  const digitalPct = 100 - activityPct

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">🌿 BloomUp</div>
          <nav className="sidebar-nav">
            {['home','analytics','activities','shop','leaderboard'].map(p => ({
              home: '🏠 Home', analytics: '📊 Analytics',
              activities: '🏅 Activities', shop: '🛒 Shop', leaderboard: '🏆 Leaderboard'
            }[p] && (
              <button key={p} className={`nav-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                {{'home':'🏠 Home','analytics':'📊 Analytics','activities':'🏅 Activities','shop':'🛒 Shop','leaderboard':'🏆 Leaderboard'}[p]}
              </button>
            )))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-coins">🪙 {coins.toLocaleString()}</div>
          <p className="sidebar-user">{account}</p>
          <button className="btn btn-login" style={{width:'100%'}} onClick={onLogout}>Log Out</button>
        </div>
      </aside>

      <main className="main-content">
        {levelUpMsg && <div className="levelup-banner">{levelUpMsg}</div>}

        {page === 'home' && (
          <div className="home-layout">
          <div className="home-page">
            <div className="home-top-row">
              <div>
                <h2>Welcome back 👋</h2>
                <p className="home-sub">Your virtual plant grows as you stay focused.</p>
              </div>
              <div className="level-badge">Lv.{plantLevel}</div>
            </div>

            <div className="plant-container">
              <div className="plant-img-wrap" style={{ width: plantSize, height: plantSize }}>
                <img src={`./tree_${Math.min(plantLevel, 7)}.png`} alt="plant" className="plant-img" />
                <div className="plant-accessories">
                  {ownedAccessories.map(id => {
                    const acc = ACCESSORIES.find(a => a.id === id)
                    const pos = accPositions[id] || { x: 50, y: 30 }
                    return acc ? (
                      <span
                        key={id}
                        className="plant-acc-emoji draggable-acc"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        onMouseDown={e => onAccMouseDown(e, id)}
                        title="Drag to move"
                      >{acc.emoji}</span>
                    ) : null
                  })}
                </div>
              </div>
              <p className="plant-label">🌱 Level {plantLevel} Plant</p>
              <button className="btn btn-login" style={{fontSize:'0.75rem',padding:'0.3rem 0.8rem'}} onClick={() => setPlantLevel(l => l + 1)}>⬆ Level Up (test)</button>
            </div>

            {activeApp && <p className="home-active">Currently tracking: <strong>{activeApp}</strong></p>}

            <div className="plant-health-bar-wrap">
              <div className="plant-health-label"><span>Plant Health</span><span>{plantHealth}%</span></div>
              <div className="plant-health-track">
                <div className="plant-health-fill" style={{ width: `${plantHealth}%` }} />
              </div>
              <p className="plant-health-tip">
                {plantHealth === 0 ? '💀 Your plant has died! Do some activities!' :
                 plantHealth < 30 ? '🥀 Log some activities to help your plant grow!' :
                 plantHealth < 70 ? '🌿 Looking good! Keep it up.' : '🌳 Your plant is thriving!'}
              </p>
              {badMinutes > 0 && <p className="plant-drain-warning">⚠️ <strong>{badMinutes} min</strong> on distracting apps is draining your plant.</p>}
            </div>

            <div className="streak-wrap">
              <span className="streak-label">🔥 Level-up streak</span>
              <div className="streak-dots">
                {Array.from({length: streakRequired}).map((_, i) => (
                  <div key={i} className={`streak-dot ${i < streak.days ? 'filled' : ''}`} />
                ))}
              </div>
              <span className="streak-sub">{streak.days}/{streakRequired} days above 80% health to level up</span>
            </div>

            {(() => {
              const tips = []
              if (plantHealth < 30) tips.push({ icon: '🚨', text: 'Your plant is critical! Log any activity right now to recover.' })
              else if (plantHealth < 60) tips.push({ icon: '🥀', text: 'Health is low. Try logging 30+ minutes of exercise.' })
              else if (plantHealth < 80) tips.push({ icon: '💧', text: `You need ${80 - plantHealth}% more health to start earning coins. Log some activities!` })
              if (badMinutes >= 30) tips.push({ icon: '📵', text: `You've spent ${badMinutes} min on distracting apps today. Try to cut back.` })
              else if (badMinutes > 0) tips.push({ icon: '⚠️', text: `${badMinutes} min on distracting apps is hurting your plant.` })
              if (totalActivityMinutes === 0) tips.push({ icon: '🏃', text: 'No activities logged yet. Head to Activities and start a timer!' })
              else if (totalActivityMinutes < 30) tips.push({ icon: '💪', text: `Good start! ${30 - totalActivityMinutes} more minutes of activity will boost your health.` })
              if (plantHealth >= 80 && streak.days === 0) tips.push({ icon: '🔥', text: 'Great health! Keep it above 80% every day to build your streak.' })
              if (streak.days >= 2) tips.push({ icon: '⭐', text: `${streak.days} day streak! Keep going — ${streakRequired - streak.days} more days to level up.` })
              if (ownedAccessories.length === 0 && coins >= 20) tips.push({ icon: '🛒', text: 'You have enough coins to buy an accessory! Check the Shop.' })
              if (tips.length === 0) tips.push({ icon: '🌳', text: 'Your plant is thriving! Keep up the great work.' })
              return (
                <div className="tips-box">
                  <span className="tips-title">💡 Tips</span>
                  {tips.slice(0, 3).map((t, i) => (
                    <div key={i} className="tip-row"><span>{t.icon}</span><span>{t.text}</span></div>
                  ))}
                </div>
              )
            })()}
          </div>

          <div className="balance-bar-vertical">
            <div className="balance-v-top-label">
              <span className="balance-label-bad">📱</span>
              <span className="balance-label-bad">{badMinutes}m</span>
              <span className="balance-label-bad">{digitalPct}%</span>
            </div>
            <div className="balance-v-track">
              <div className="balance-v-bad" style={{ height: `${digitalPct}%` }} />
              <div className="balance-v-good" style={{ height: `${activityPct}%` }} />
            </div>
            <div className="balance-v-bottom-label">
              <span className="balance-label-good">{activityPct}%</span>
              <span className="balance-label-good">{totalActivityMinutes}m</span>
              <span className="balance-label-good">🏃</span>
            </div>
          </div>
          </div>
        )}

        {page === 'analytics' && (
          <div className="analytics-page">
            <h2>Analytics</h2>
            <div className="analytics-summary">
              <div className="summary-card"><span className="summary-label">Total Time</span><span className="summary-value">{fmt(totalSeconds) || '0s'}</span></div>
              <div className="summary-card"><span className="summary-label">Apps Tracked</span><span className="summary-value">{sorted.length}</span></div>
              <div className="summary-card"><span className="summary-label">Top App</span><span className="summary-value">{sorted[0]?.[0] || '—'}</span></div>
            </div>
            <h3 className="section-title">Time Per App</h3>
            {sorted.length === 0 ? (
              <p className="tracker-empty">Use your computer and data will appear here.</p>
            ) : (
              <div className="bar-chart">
                {sorted.map(([name, seconds]) => (
                  <div key={name} className="bar-row">
                    <span className="bar-label">{name}{badApps.some(b => name.toLowerCase().includes(b.toLowerCase())) ? ' 📵' : ''}</span>
                    <div className="bar-track">
                      <div className={`bar-fill ${name === activeApp ? 'bar-active' : ''} ${badApps.some(b => name.toLowerCase().includes(b.toLowerCase())) ? 'bar-bad' : ''}`}
                        style={{ width: `${(seconds / maxSeconds) * 100}%` }} />
                    </div>
                    <span className="bar-time">{fmt(seconds)}</span>
                  </div>
                ))}
              </div>
            )}
            <h3 className="section-title" style={{marginTop:'2rem'}}>📵 Distracting Apps</h3>
            <p className="home-sub" style={{fontSize:'0.85rem', margin:'0 0 0.8rem'}}>Time on these apps drains your plant.</p>
            <div className="bad-apps-list">
              {badApps.map(name => (
                <span key={name} className="bad-app-chip">{name}
                  <button onClick={() => setBadApps(prev => prev.filter(a => a !== name))}>✕</button>
                </span>
              ))}
            </div>
            <form className="add-activity-form" style={{marginTop:'0.8rem'}} onSubmit={e => {
              e.preventDefault()
              if (!newBadApp.trim() || badApps.includes(newBadApp.trim())) return
              setBadApps(prev => [...prev, newBadApp.trim()])
              setNewBadApp('')
            }}>
              <input placeholder="Add distracting app..." value={newBadApp} onChange={e => setNewBadApp(e.target.value)} />
              <button type="submit" className="btn btn-signup">Add</button>
            </form>
          </div>
        )}

        {page === 'activities' && (
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
                        <span className="activity-timer-display">{fmtTimer(timer.elapsed)}</span>
                        {!timer.running
                          ? <button className="timer-btn timer-start" onClick={() => startTimer(a.id)}>▶ Start</button>
                          : <button className="timer-btn timer-stop" onClick={() => stopTimer(a.id)}>■ Stop & Log</button>}
                        <button className="timer-btn" style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:'1rem',padding:'0 0.2rem'}} onClick={() => {
                          clearInterval(timerRefs.current[a.id])
                          timerRefs.current[a.id] = null
                          setActivities(prev => prev.filter(act => act.id !== a.id))
                          setTimers(prev => { const n = {...prev}; delete n[a.id]; return n })
                        }}>🗑</button>
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
            <form className="add-activity-form" onSubmit={e => {
              e.preventDefault()
              const name = newActivityName.trim()
              if (!name) return
                const gameKeywords = ['game','minecraft','roblox','steam','fortnite','valorant','call of duty','league of legends','apex legends','overwatch','fifa','nba 2k','grand theft auto','warzone','counter-strike','dota','world of warcraft','zelda','mario','pokemon','xbox','playstation','elden ring','cyberpunk','battlefield','rocket league','among us','fall guys','terraria','stardew','sims','baldurs gate','diablo','subway surfers','clash royale','brawl stars','clash of clans','candy crush','angry birds','temple run','fruit ninja','geometry dash','mobile legends','free fire','honor of kings','garena','pubg','roblox','stumble guys','my talking tom','dragon city','hay day','boom beach','coin master','slither','agar','8 ball pool','mini militia','shadow fight','hill climb','crossy road','jetpack joyride','cut the rope','plants vs zombies','tower defense','bubble shooter']
              const isGame = gameKeywords.some(k => name.toLowerCase().includes(k))
              if (isGame) {
                if (!badApps.some(b => b.toLowerCase() === name.toLowerCase())) {
                  setBadApps(prev => [...prev, name])
                }
                setNewActivityName('')
                return
              }
              setActivities(prev => [...prev, { id: Date.now(), name, emoji: '🏆', logs: [] }])
              setNewActivityName('')
            }}>
              <input placeholder="Add a new activity..." value={newActivityName} onChange={e => setNewActivityName(e.target.value)} />
              <button type="submit" className="btn btn-signup">Add</button>
              {(() => {
              const gameKeywords = ['game','minecraft','roblox','steam','fortnite','valorant','call of duty','league of legends','apex legends','overwatch','fifa','nba 2k','grand theft auto','warzone','counter-strike','dota','world of warcraft','zelda','mario','pokemon','xbox','playstation','elden ring','cyberpunk','battlefield','rocket league','among us','fall guys','terraria','stardew','sims','baldurs gate','diablo','subway surfers','clash royale','brawl stars','clash of clans','candy crush','angry birds','temple run','fruit ninja','geometry dash','mobile legends','free fire','honor of kings','garena','pubg','stumble guys','my talking tom','dragon city','hay day','boom beach','coin master','slither','agar','8 ball pool','mini militia','shadow fight','hill climb','crossy road','jetpack joyride','cut the rope','plants vs zombies','tower defense','bubble shooter']
                const isGame = gameKeywords.some(k => newActivityName.toLowerCase().includes(k))
                return isGame ? <p className="auth-error" style={{margin:'0.4rem 0 0'}}>⚠️ That looks like a game — it'll be added as a distracting app instead.</p> : null
              })()}
            </form>
          </div>
        )}

        {page === 'shop' && (
          <div className="shop-page">
            <h2>🛒 Shop</h2>
            <p className="home-sub">Spend your coins on accessories for your plant.</p>
            <div className="shop-balance">🪙 <strong>{coins.toLocaleString()}</strong> coins</div>
            <div className="shop-grid">
              {ACCESSORIES.map(acc => {
                const owned = ownedAccessories.includes(acc.id)
                return (
                  <div key={acc.id} className={`shop-card ${owned ? 'owned' : ''}`}>
                    <span className="shop-emoji">{acc.emoji}</span>
                    <span className="shop-name">{acc.name}</span>
                    <span className="shop-price">🪙 {acc.price}</span>
                    {owned ? (
                      <button className="timer-btn timer-stop" style={{fontSize:'0.78rem'}} onClick={() =>
                        setOwnedAccessories(prev => prev.filter(id => id !== acc.id))
                      }>Remove</button>
                    ) : (
                      <button
                        className="timer-btn timer-start"
                        style={{fontSize:'0.78rem'}}
                        disabled={coins < acc.price}
                        onClick={() => {
                          if (coins < acc.price) return
                          setCoins(c => c - acc.price)
                          setOwnedAccessories(prev => [...prev, acc.id])
                        }}
                      >Buy</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {page === 'leaderboard' && (
          <div className="leaderboard-page">
            <h2>🏆 Leaderboard</h2>
            <p className="home-sub">Add friends by email to compare progress across devices.</p>
            <div className="lb-list">
              {lbLoading ? <p style={{color:'#888'}}>Loading...</p> : lbEntries.map((e, i) => (
                <div key={e.email} className={`lb-row ${e.isMe ? 'lb-me' : ''}`}>
                  <span className="lb-rank">#{i + 1}</span>
                  <span className="lb-email">{e.email}{e.isMe ? ' (you)' : ''}</span>
                  <span className="lb-lv">Lv.{e.plantLevel}</span>
                  <span className="lb-coins">🪙 {(e.coins||0).toLocaleString()}</span>
                  {!e.isMe && (
                    <button className="lb-remove" onClick={() => setFriends(prev => prev.filter(f => f !== e.email))}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <form className="add-activity-form" style={{marginTop:'1.5rem'}} onSubmit={async e => {
              e.preventDefault()
              const f = newFriend.trim().toLowerCase()
              if (!f) return
              if (f === account) { setFriendError("That's you!"); return }
              if (friends.includes(f)) { setFriendError('Already added.'); return }
              try {
                const snap = await getDoc(doc(db, 'users', f))
                if (!snap.exists()) { setFriendError('No FocusApp account found for that email.'); return }
                setFriends(prev => [...prev, f])
                setNewFriend('')
                setFriendError('')
              } catch { setFriendError('Error checking account. Try again.') }
            }}>
              <input placeholder="Friend's email..." value={newFriend} onChange={e => { setNewFriend(e.target.value); setFriendError('') }} />
              <button type="submit" className="btn btn-signup">Add</button>
            </form>
            {friendError && <p className="auth-error">{friendError}</p>}
          </div>
        )}
      </main>
    </div>
  )
}
