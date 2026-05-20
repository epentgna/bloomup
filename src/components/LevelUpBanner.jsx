import { useEffect } from 'react'

export default function LevelUpBanner({ message, onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [message, onDismiss, duration])

  if (!message) return null
  return <div className="levelup-banner" role="status">{message}</div>
}
