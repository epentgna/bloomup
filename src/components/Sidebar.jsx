const NAV = [
  { id: 'home',         label: '🏠 Home' },
  { id: 'activities',   label: '🏅 Activities' },
  { id: 'pomodoro',     label: '🍅 Pomodoro' },
  { id: 'analytics',    label: '📊 Analytics' },
  { id: 'shop',         label: '🛒 Shop' },
  { id: 'garden',       label: '🪴 Garden' },
  { id: 'achievements', label: '🏆 Achievements' },
  { id: 'leaderboard',  label: '👥 Leaderboard' },
]

export default function Sidebar({ page, setPage, coins, email, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">🌿 BloomUp</div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-btn ${page === n.id ? 'active' : ''}`}
              onClick={() => setPage(n.id)}
              aria-current={page === n.id ? 'page' : undefined}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-coins" aria-label="coin balance">🪙 {coins.toLocaleString()}</div>
        <p className="sidebar-user" title={email}>{email}</p>
        <button className="btn btn-login" style={{width:'100%'}} onClick={onLogout}>Log Out</button>
      </div>
    </aside>
  )
}
