import { useUserData } from '../store/useUserData'
import { useToast } from '../components/Toast'
import { PLANT_SPECIES, unlockedSpecies } from '../data/plantSpecies'
import Plant from '../components/Plant'

export default function GardenPage() {
  const u = useUserData()
  const { toast } = useToast()
  const available = unlockedSpecies(u.plantLevel)

  function selectSpecies(id) {
    u.setField('selectedSpecies', id)
    toast(`🌱 Now growing a ${PLANT_SPECIES.find(p => p.id === id)?.name}.`, { kind: 'good' })
  }

  function archive() {
    if (u.plantLevel < 5) {
      toast('Reach at least Lv.5 before archiving.', { kind: 'warn' })
      return
    }
    const entry = {
      id: Date.now(),
      speciesId: u.selectedSpecies,
      finalLevel: u.plantLevel,
      finishedAt: new Date().toISOString(),
      accessories: [...u.ownedAccessories],
    }
    u.setField('garden', prev => [entry, ...prev])
    u.setField('plantLevel', 1)
    u.setField('streak', { days: 0, lastDate: null })
    toast('🪴 Plant added to your garden! Starting fresh.', { kind: 'good' })
  }

  return (
    <div className="garden-page">
      <h2>🪴 Garden</h2>
      <p className="home-sub">
        Switch species, see what you’ve unlocked, and retire mature plants to your garden.
      </p>

      <h3 className="section-title">Active Species</h3>
      <div className="species-grid">
        {PLANT_SPECIES.map(s => {
          const unlocked = available.some(x => x.id === s.id)
          const active   = u.selectedSpecies === s.id
          return (
            <button
              key={s.id}
              className={`species-card ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
              onClick={() => unlocked && selectSpecies(s.id)}
              disabled={!unlocked}
              title={unlocked ? '' : `Reach Lv.${s.unlockLevel} to unlock`}
            >
              <span className="species-emoji">{unlocked ? s.emoji : '🔒'}</span>
              <span className="species-name">{s.name}</span>
              <span className="species-sub">
                {unlocked ? (active ? 'Growing' : 'Available') : `Lv.${s.unlockLevel}`}
              </span>
            </button>
          )
        })}
      </div>

      <h3 className="section-title" style={{marginTop:'2rem'}}>Archive Plant</h3>
      <p className="home-sub" style={{fontSize:'0.85rem'}}>
        Retire your current plant to start fresh with a clean streak. The plant joins your garden below.
      </p>
      <button className="btn btn-signup" onClick={archive} disabled={u.plantLevel < 5}>
        🪴 Archive current plant
      </button>

      <h3 className="section-title" style={{marginTop:'2rem'}}>Your Garden ({u.garden.length})</h3>
      {u.garden.length === 0 ? (
        <p className="tracker-empty">No plants archived yet. Grow to Lv.5+ and retire your first.</p>
      ) : (
        <div className="garden-grid">
          {u.garden.map(p => (
            <div key={p.id} className="garden-card">
              <Plant
                level={Math.min(p.finalLevel, 7)}
                speciesId={p.speciesId}
                accessories={p.accessories || []}
                accPositions={{}}
                interactive={false}
                size={140}
              />
              <span className="garden-card-title">Lv.{p.finalLevel} {PLANT_SPECIES.find(s => s.id === p.speciesId)?.name || p.speciesId}</span>
              <span className="garden-card-date">{p.finishedAt.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
