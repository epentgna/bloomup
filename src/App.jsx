import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import { useAuth } from './auth/useAuth'
import AuthScreen from './auth/AuthScreen'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider, useToast } from './components/Toast'
import { UserDataProvider, useUserData } from './store/useUserData'
import OnboardingModal from './components/OnboardingModal'
import LevelUpBanner from './components/LevelUpBanner'
import Sidebar from './components/Sidebar'

import HomePage         from './pages/HomePage'
import ActivitiesPage   from './pages/ActivitiesPage'
import AnalyticsPage    from './pages/AnalyticsPage'
import ShopPage         from './pages/ShopPage'
import LeaderboardPage  from './pages/LeaderboardPage'
import PomodoroPage     from './pages/PomodoroPage'
import GardenPage       from './pages/GardenPage'
import AchievementsPage from './pages/AchievementsPage'

import { isBadApp } from './utils/matchBadApp'
import { IGNORED_APPS } from './data/badAppsDefaults'
import { plantHealth as calcHealth, dailyCoinCap, coinsPerSecond, HEALTHY_THRESHOLD, streakRequiredFor } from './utils/plantHealth'
import { todayKey } from './utils/storage'
import { ACHIEVEMENTS, unlockedAchievements } from './data/achievements'
import { setDoc, doc } from 'firebase/firestore'
import { db } from './firebase'

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthGate />
      </ToastProvider>
    </ErrorBoundary>
  )
}

function AuthGate() {
  const { user, authReady, signOut } = useAuth()
  if (!authReady) {
    return <div className="splash">🌿 BloomUp</div>
  }
  if (!user) return <AuthScreen />
  return (
    <UserDataProvider uid={user.uid} email={user.email}>
      <Tracker onLogout={signOut} />
    </UserDataProvider>
  )
}

function Tracker({ onLogout }) {
  const u = useUserData()
  const { toast } = useToast()

  const [page, setPage] = useState('home')
  const [tracked, setTracked] = useState({})
  const [activeApp, setActiveApp] = useState(null)
  const [levelUpMsg, setLevelUpMsg] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const activeAppRef = useRef(null)
  const lastStreakDateRef = useRef(u.streak.lastDate)

  // First-launch onboarding (per browser, not per account — minimum friction).
  useEffect(() => {
    if (!u.loaded) return
    const seen = localStorage.getItem('bloomup:onboarded')
    if (!seen) setShowOnboarding(true)
  }, [u.loaded])

  // Surface Firestore push failures via toast.
  useEffect(() => {
    if (u.pushError) toast(`☁️ Sync issue: ${u.pushError}`, { kind: 'bad', duration: 6000 })
  }, [u.pushError])

  // Reset daily-coins bucket at midnight (local time, ISO key).
  useEffect(() => {
    const today = todayKey()
    if (u.dailyCoinsDate !== today) {
      u.setField('dailyCoinsDate', today)
      u.setField('dailyCoinsEarned', 0)
    }
  }, [u.dailyCoinsDate])

  // Electron tracking: a single subscription per mount.
  useEffect(() => {
    if (!window.electronAPI?.onActiveApp) return
    window.electronAPI.onActiveApp((appName) => {
      setActiveApp(appName)
      activeAppRef.current = appName
      if (!appName || IGNORED_APPS.includes(appName)) return
      // Active-app poll fires every 5s, so increment by 5s per sample.
      setTracked(prev => ({ ...prev, [appName]: (prev[appName] || 0) + 5 }))
    })
  }, [])

  // Derived metrics
  const totalActivityMinutes = useMemo(() =>
    u.activities.reduce((sum, a) => sum + a.logs.reduce((s, l) => s + l.minutes, 0), 0),
    [u.activities])

  const badSeconds = useMemo(() =>
    Object.entries(tracked)
      .filter(([name]) => isBadApp(name, u.badApps))
      .reduce((sum, [, s]) => sum + s, 0),
    [tracked, u.badApps])
  const badMinutes = Math.round(badSeconds / 60)

  const plantHealth = useMemo(() =>
    calcHealth({ activityMinutes: totalActivityMinutes, badMinutes }),
    [totalActivityMinutes, badMinutes])

  const streakRequired = streakRequiredFor(u.plantLevel)
  const dailyCap = dailyCoinCap(u.plantLevel)
  const dailyCoinsRemaining = Math.max(0, dailyCap - u.dailyCoinsEarned)

  // Daily streak check — runs once per day per local date, not on every health tick.
  useEffect(() => {
    if (!u.loaded) return
    const today = todayKey()
    if (lastStreakDateRef.current === today) return
    lastStreakDateRef.current = today
    const newDays = plantHealth >= HEALTHY_THRESHOLD ? u.streak.days + 1 : 0
    if (newDays >= streakRequired) {
      const newLevel = u.plantLevel + 1
      u.setField('plantLevel', newLevel)
      u.setField('streak', { days: 0, lastDate: today })
      setLevelUpMsg(`🎉 Level Up! Your plant is now Level ${newLevel}!`)
      window.electronAPI?.notify?.('🌳 Level Up!', `Your plant grew to Lv.${newLevel}.`)
    } else {
      u.setField('streak', { days: newDays, lastDate: today })
    }
  }, [u.loaded, plantHealth, u.streak.days, u.streak.lastDate, u.plantLevel, streakRequired])

  // Coin income — accrues fractional coins, flushes whole coins to state, respects daily cap.
  const fractionalRef = useRef(0)
  useEffect(() => {
    const cps = coinsPerSecond(plantHealth, u.plantLevel)
    if (cps <= 0) return
    const inc = setInterval(() => {
      if (dailyCoinsRemaining <= 0) return
      fractionalRef.current += cps
      if (fractionalRef.current >= 1) {
        const whole = Math.floor(fractionalRef.current)
        const grant = Math.min(whole, dailyCoinsRemaining)
        fractionalRef.current -= whole
        if (grant > 0) {
          u.setField('coins', c => c + grant)
          u.setField('dailyCoinsEarned', n => n + grant)
        }
      }
    }, 1000)
    return () => clearInterval(inc)
  }, [plantHealth, u.plantLevel, dailyCoinsRemaining])

  // Push tray updates to Electron whenever core stats change.
  useEffect(() => {
    window.electronAPI?.updateTray?.({
      health: plantHealth,
      level:  u.plantLevel,
      coins:  u.coins,
    })
  }, [plantHealth, u.plantLevel, u.coins])

  // Achievement unlock detection — toast new badges and persist.
  useEffect(() => {
    if (!u.loaded) return
    const stats = {
      plantLevel: u.plantLevel,
      coins: u.coins,
      totalActivityMinutes,
      streakDays: u.streak.days,
      pomodorosCompleted: u.pomodorosCompleted,
      gardenCount: u.garden.length,
      ownedAccessoriesCount: u.ownedAccessories.length,
      friendsCount: u.friends.length,
    }
    const newlyUnlocked = unlockedAchievements(stats)
      .filter(a => !u.unlockedAchievements.includes(a.id))
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(a => toast(`🏆 ${a.name} unlocked!`, { kind: 'good', duration: 5000 }))
      u.setField('unlockedAchievements', prev => [...prev, ...newlyUnlocked.map(a => a.id)])
    }
  }, [u.plantLevel, u.coins, totalActivityMinutes, u.streak.days,
      u.pomodorosCompleted, u.garden.length, u.ownedAccessories.length, u.friends.length,
      u.loaded])

  // Mirror email -> uid lookup doc so the leaderboard can find friends by email.
  useEffect(() => {
    if (!u.loaded || !u.email) return
    setDoc(doc(db, 'users-by-email', u.email.toLowerCase()), {
      email: u.email.toLowerCase(),
      uid: u.uid,
      plantLevel: u.plantLevel,
      coins: u.coins,
    }, { merge: true }).catch(() => {})
  }, [u.loaded, u.email, u.uid, u.plantLevel, u.coins])

  function finishOnboarding() {
    localStorage.setItem('bloomup:onboarded', '1')
    setShowOnboarding(false)
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        coins={u.coins}
        email={u.email}
        onLogout={onLogout}
      />

      <main className="main-content">
        <LevelUpBanner message={levelUpMsg} onDismiss={() => setLevelUpMsg(null)} />

        {page === 'home'         && <HomePage activeApp={activeApp} plantHealth={plantHealth} totalActivityMinutes={totalActivityMinutes} badMinutes={badMinutes} streakRequired={streakRequired} dailyCoinsRemaining={dailyCoinsRemaining} />}
        {page === 'activities'   && <ActivitiesPage activeApp={activeApp} />}
        {page === 'pomodoro'     && <PomodoroPage />}
        {page === 'analytics'    && <AnalyticsPage tracked={tracked} activeApp={activeApp} />}
        {page === 'shop'         && <ShopPage />}
        {page === 'garden'       && <GardenPage />}
        {page === 'achievements' && <AchievementsPage totalActivityMinutes={totalActivityMinutes} />}
        {page === 'leaderboard'  && <LeaderboardPage />}
      </main>

      {showOnboarding && <OnboardingModal onClose={finishOnboarding} />}
    </div>
  )
}
