import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthReady(true)
    })
    return () => unsub()
  }, [])

  return {
    user,
    authReady,
    signUp:   (email, pw) => createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), pw),
    signIn:   (email, pw) => signInWithEmailAndPassword(auth, email.toLowerCase().trim(), pw),
    signOut:  () => signOut(auth),
    resetPw:  (email) => sendPasswordResetEmail(auth, email.toLowerCase().trim()),
  }
}

/*
 * Friendly error messages for Firebase auth codes.
 */
export function authErrorMessage(err) {
  const code = err?.code || ''
  switch (code) {
    case 'auth/invalid-email':         return 'That email doesn’t look right.'
    case 'auth/user-not-found':        return 'No account found for that email.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':    return 'Wrong email or password.'
    case 'auth/email-already-in-use':  return 'An account with that email already exists.'
    case 'auth/weak-password':         return 'Password must be at least 6 characters.'
    case 'auth/too-many-requests':     return 'Too many attempts. Try again in a moment.'
    case 'auth/network-request-failed':return 'Network error. Check your connection.'
    default:                           return err?.message || 'Something went wrong.'
  }
}
