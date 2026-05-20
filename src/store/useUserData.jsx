import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { load, save, todayKey } from '../utils/storage'
import { DEFAULT_ACTIVITIES } from '../data/defaultActivities'
import { DEFAULT_BAD_APPS } from '../data/badAppsDefaults'

const UserDataCtx = createContext(null)

const SYNC_FIELDS = [
  'plantLevel', 'coins', 'streak', 'activities', 'ownedAccessories',
  'badApps', 'friends', 'accPositions', 'selectedSpecies', 'garden',
  'pomodorosCompleted', 'focusHistory', 'unlockedAchievements',
  'dailyCoinsEarned', 'dailyCoinsDate', 'timers',
]

export function UserDataProvider({ uid, email, children }) {
  const k = useCallback((key) => `${uid}:${key}`, [uid])
  const ready = useRef(false)
  const [loaded, setLoaded] = useState(false)
  const [pushError, setPushError] = useState(null)

  // Per-user state (initialized from localStorage; overwritten by Firestore on first snapshot).
  const [state, setState] = useState(() => ({
    plantLevel:           load(`${uid}:plantLevel`, 1),
    coins:                load(`${uid}:coins`, 0),
    streak:               load(`${uid}:streak`, { days: 0, lastDate: null }),
    activities:           load(`${uid}:activities`, DEFAULT_ACTIVITIES),
    ownedAccessories:     load(`${uid}:ownedAccessories`, []),
    badApps:              load(`${uid}:badApps`, DEFAULT_BAD_APPS),
    friends:              load(`${uid}:friends`, []),
    accPositions:         load(`${uid}:accPositions`, {}),
    selectedSpecies:      load(`${uid}:selectedSpecies`, 'sprout'),
    garden:               load(`${uid}:garden`, []),
    pomodorosCompleted:   load(`${uid}:pomodorosCompleted`, 0),
    focusHistory:         load(`${uid}:focusHistory`, {}),
    unlockedAchievements: load(`${uid}:unlockedAchievements`, []),
    dailyCoinsEarned:     load(`${uid}:dailyCoinsEarned`, 0),
    dailyCoinsDate:       load(`${uid}:dailyCoinsDate`, todayKey()),
    timers:               load(`${uid}:timers`, {}),
  }))

  // Live Firestore subscription: merge remote state on changes from other devices.
  useEffect(() => {
    if (!uid) return
    const ref = doc(db, 'users', uid)
    let didFirstLoad = false
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data()
        setState(prev => {
          const next = { ...prev }
          for (const f of SYNC_FIELDS) {
            if (d[f] !== undefined) next[f] = d[f]
          }
          return next
        })
      } else if (!didFirstLoad) {
        // First time for this account: bootstrap a minimal doc so friends can find them.
        setDoc(ref, { email, uid, plantLevel: 1, coins: 0 }, { merge: true }).catch(() => {})
      }
      didFirstLoad = true
      setLoaded(true)
      ready.current = true
    }, (err) => {
      console.error('[firestore] snapshot error', err)
      setPushError(err.message)
      setLoaded(true)
    })
    return () => unsub()
  }, [uid, email])

  // Persist every state change to localStorage AND push to Firestore (debounced).
  const pushTimer = useRef(null)
  useEffect(() => {
    if (!ready.current) return
    for (const f of SYNC_FIELDS) save(k(f), state[f])
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      const payload = { email, uid }
      for (const f of SYNC_FIELDS) payload[f] = state[f]
      setDoc(doc(db, 'users', uid), payload, { merge: true })
        .then(() => setPushError(null))
        .catch(err => {
          console.error('[firestore] push error', err)
          setPushError(err.message)
        })
    }, 600)
    return () => clearTimeout(pushTimer.current)
  }, [state, uid, email, k])

  // Helper: produce a setter for any field.
  const setField = useCallback((field, valueOrFn) => {
    setState(prev => ({
      ...prev,
      [field]: typeof valueOrFn === 'function' ? valueOrFn(prev[field]) : valueOrFn,
    }))
  }, [])

  const value = {
    uid, email, loaded, pushError, ...state, setField,
  }

  return <UserDataCtx.Provider value={value}>{children}</UserDataCtx.Provider>
}

export function useUserData() {
  const ctx = useContext(UserDataCtx)
  if (!ctx) throw new Error('useUserData must be inside <UserDataProvider>')
  return ctx
}
