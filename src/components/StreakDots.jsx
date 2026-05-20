export default function StreakDots({ days, required }) {
  return (
    <div className="streak-wrap">
      <span className="streak-label">🔥 Level-up streak</span>
      <div className="streak-dots" aria-label={`${days} of ${required} streak days`}>
        {Array.from({ length: required }).map((_, i) => (
          <div key={i} className={`streak-dot ${i < days ? 'filled' : ''}`} />
        ))}
      </div>
      <span className="streak-sub">{days}/{required} days above 80% health to level up</span>
    </div>
  )
}
