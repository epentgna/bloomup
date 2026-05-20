export default function HealthBar({ health, badMinutes }) {
  const tip =
    health === 0   ? '💀 Your plant has died! Do some activities!' :
    health < 30    ? '🥀 Log some activities to help your plant grow!' :
    health < 70    ? '🌿 Looking good! Keep it up.' :
                     '🌳 Your plant is thriving!'

  return (
    <div className="plant-health-bar-wrap">
      <div className="plant-health-label">
        <span>Plant Health</span>
        <span>{Math.round(health)}%</span>
      </div>
      <div className="plant-health-track" role="progressbar" aria-valuenow={Math.round(health)} aria-valuemin="0" aria-valuemax="100">
        <div className="plant-health-fill" style={{ width: `${health}%` }} />
      </div>
      <p className="plant-health-tip">{tip}</p>
      {badMinutes > 0 && (
        <p className="plant-drain-warning">⚠️ <strong>{badMinutes} min</strong> on distracting apps is draining your plant.</p>
      )}
    </div>
  )
}
