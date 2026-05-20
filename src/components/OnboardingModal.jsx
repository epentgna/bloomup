import { useState } from 'react'

const STEPS = [
  {
    emoji: '🌱',
    title: 'Welcome to BloomUp',
    body: 'Your virtual plant grows when you stay focused on real-life activities — and wilts when you scroll distracting apps.',
  },
  {
    emoji: '🏅',
    title: 'Log activities',
    body: 'Open the Activities tab and start a timer for whatever you’re doing — reading, running, writing. Logged minutes feed your plant.',
  },
  {
    emoji: '🍅',
    title: 'Try Pomodoro mode',
    body: 'Built-in 25/5 focus cycles auto-log your time and earn you bonus coins for completed sessions.',
  },
  {
    emoji: '🪙',
    title: 'Earn and spend',
    body: 'Keep your plant above 80% health to earn coins. Spend them in the Shop on accessories you can drag onto your plant.',
  },
  {
    emoji: '🏆',
    title: 'Climb the leaderboard',
    body: 'Add friends by email and compete to grow the biggest plant. There’s achievements and a streak heatmap waiting too.',
  },
]

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0)
  const s = STEPS[step]

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal onboarding-modal">
        <div className="onboarding-emoji">{s.emoji}</div>
        <h2>{s.title}</h2>
        <p>{s.body}</p>
        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
        <div className="onboarding-actions">
          {step > 0 && (
            <button className="btn btn-login" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-signup" onClick={() => setStep(s => s + 1)}>Next</button>
          ) : (
            <button className="btn btn-signup" onClick={onClose}>Let’s grow 🌱</button>
          )}
        </div>
        <button className="link-btn skip-onboarding" onClick={onClose}>Skip tour</button>
      </div>
    </div>
  )
}
