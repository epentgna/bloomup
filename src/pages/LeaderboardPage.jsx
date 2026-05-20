import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useUserData } from '../store/useUserData'
import { useToast } from '../components/Toast'

export default function LeaderboardPage() {
  const u = useUserData()
  const { toast } = useToast()
  const [newFriend, setNewFriend] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const me = u.email.toLowerCase()
      const roster = [me, ...u.friends.filter(f => f !== me).map(f => f.toLowerCase())]
      // Lookup by email field rather than doc ID, so the case mismatch bug
      // can't bite us. We attempt doc-by-email first (legacy) then fall back.
      const results = await Promise.all(roster.map(async em => {
        try {
          const snap = await getDoc(doc(db, 'users-by-email', em))
          if (snap.exists()) return { ...snap.data(), email: em }
          // Legacy fallback: case-sensitive direct lookup by email.
          const direct = await getDoc(doc(db, 'users', em))
          if (direct.exists()) return { ...direct.data(), email: em }
        } catch {}
        return { email: em, plantLevel: 1, coins: 0 }
      }))
      if (cancelled) return
      const withMe = results.map(r => ({ ...r, isMe: r.email === me }))
      setEntries(withMe.sort((a, b) => (b.plantLevel || 0) - (a.plantLevel || 0) || (b.coins || 0) - (a.coins || 0)))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [u.friends, u.email, u.plantLevel, u.coins])

  async function addFriend(e) {
    e.preventDefault()
    const f = newFriend.trim().toLowerCase()
    if (!f) return
    if (f === u.email.toLowerCase()) { toast("That's you!", { kind: 'warn' }); return }
    if (u.friends.some(x => x.toLowerCase() === f)) { toast('Already added.', { kind: 'warn' }); return }
    try {
      const direct = await getDoc(doc(db, 'users-by-email', f))
      const legacy = direct.exists() ? null : await getDoc(doc(db, 'users', f))
      if (!direct.exists() && !legacy?.exists()) {
        toast('No BloomUp account found for that email.', { kind: 'bad' })
        return
      }
      u.setField('friends', prev => [...prev, f])
      setNewFriend('')
      toast('👥 Friend added!', { kind: 'good' })
    } catch {
      toast('Error checking account. Try again.', { kind: 'bad' })
    }
  }

  function removeFriend(email) {
    u.setField('friends', prev => prev.filter(f => f.toLowerCase() !== email.toLowerCase()))
  }

  return (
    <div className="leaderboard-page">
      <h2>🏆 Leaderboard</h2>
      <p className="home-sub">Add friends by email to compare progress across devices.</p>
      <div className="lb-list">
        {loading ? <p style={{color:'#888'}}>Loading...</p> : entries.map((e, i) => (
          <div key={e.email} className={`lb-row ${e.isMe ? 'lb-me' : ''}`}>
            <span className="lb-rank">#{i + 1}</span>
            <span className="lb-email">{e.email}{e.isMe ? ' (you)' : ''}</span>
            <span className="lb-lv">Lv.{e.plantLevel || 1}</span>
            <span className="lb-coins">🪙 {(e.coins || 0).toLocaleString()}</span>
            {!e.isMe && (
              <button
                className="lb-remove"
                onClick={() => removeFriend(e.email)}
                aria-label={`Remove ${e.email}`}
              >✕</button>
            )}
          </div>
        ))}
      </div>
      <form className="add-activity-form" style={{marginTop:'1.5rem'}} onSubmit={addFriend}>
        <input
          type="email"
          placeholder="Friend's email..."
          value={newFriend}
          onChange={e => setNewFriend(e.target.value)}
        />
        <button type="submit" className="btn btn-signup">Add</button>
      </form>
    </div>
  )
}
