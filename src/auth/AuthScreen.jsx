import { useState } from 'react'
import { useAuth, authErrorMessage } from './useAuth'

export default function AuthScreen() {
  const { signIn, signUp, resetPw } = useAuth()
  const [tab, setTab] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setBusy(true); setAuthError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setAuthError(authErrorMessage(err))
    } finally { setBusy(false) }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    if (password.length < 6) { setAuthError('Password must be at least 6 characters.'); return }
    setBusy(true); setAuthError('')
    try {
      await signUp(email, password)
    } catch (err) {
      setAuthError(authErrorMessage(err))
    } finally { setBusy(false) }
  }

  async function handleReset() {
    if (!email.trim()) { setAuthError('Enter your email first.'); return }
    setBusy(true); setAuthError('')
    try {
      await resetPw(email)
      setResetSent(true)
    } catch (err) {
      setAuthError(authErrorMessage(err))
    } finally { setBusy(false) }
  }

  function close() {
    setTab(null); setAuthError(''); setResetSent(false)
  }

  return (
    <>
      <div className="auth-screen">
        <div className="auth-logo">🌿 BloomUp</div>
        <p className="auth-tagline">Grow your plant. Focus your life.</p>
        <div className="auth-buttons">
          <button className="btn btn-login auth-btn"  onClick={() => setTab('login')}>Login</button>
          <button className="btn btn-signup auth-btn" onClick={() => setTab('signup')}>Sign Up</button>
        </div>
      </div>

      {tab && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{tab === 'login' ? 'Login' : 'Create Account'}</h2>
            <form onSubmit={tab === 'login' ? handleLogin : handleSignUp}>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
                disabled={busy}
              />
              <label>Password</label>
              <input
                type="password"
                placeholder={tab === 'signup' ? 'At least 6 characters' : 'Password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
                disabled={busy}
              />
              {authError  && <p className="auth-error">{authError}</p>}
              {resetSent  && <p className="auth-success">📬 Reset email sent. Check your inbox.</p>}
              <button type="submit" className="btn btn-signup" style={{width:'100%'}} disabled={busy}>
                {busy ? '...' : tab === 'login' ? 'Login' : 'Create Account'}
              </button>
              {tab === 'login' && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={handleReset}
                  disabled={busy}
                >Forgot password?</button>
              )}
            </form>
            <button className="modal-close" onClick={close}>✕</button>
          </div>
        </div>
      )}
    </>
  )
}
