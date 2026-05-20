import { useRef } from 'react'
import { ACCESSORIES } from '../data/accessories'
import { speciesFor } from '../data/plantSpecies'

export default function Plant({
  level, speciesId, accessories, accPositions, onMoveAccessory,
  size = 240, interactive = true,
}) {
  const species = speciesFor(speciesId)
  const dragging = useRef(null)

  function onAccMouseDown(e, id) {
    if (!interactive || !onMoveAccessory) return
    e.preventDefault()
    const wrap = e.currentTarget.closest('.plant-img-wrap')
    const rect = wrap.getBoundingClientRect()
    dragging.current = { id }

    function onMove(me) {
      const x = ((me.clientX - rect.left) / rect.width)  * 100
      const y = ((me.clientY - rect.top)  / rect.height) * 100
      onMoveAccessory(id, {
        x: Math.min(92, Math.max(8, x)),
        y: Math.min(92, Math.max(8, y)),
      })
    }
    function onUp() {
      dragging.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const stage = Math.min(7, Math.max(1, level))
  const filter = species.tint > 0 ? `hue-rotate(${species.tint}deg) saturate(1.05)` : 'none'

  return (
    <div className="plant-img-wrap" style={{ width: size, height: size }}>
      <img
        src={`./tree_${stage}.png`}
        alt={`${species.name} plant, level ${level}`}
        className="plant-img"
        style={{ filter }}
        draggable={false}
      />
      <div className="plant-accessories">
        {accessories.map(id => {
          const acc = ACCESSORIES.find(a => a.id === id)
          if (!acc) return null
          const pos = accPositions[id] || { x: 50, y: 30 }
          return (
            <span
              key={id}
              className={`plant-acc-emoji ${interactive ? 'draggable-acc' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onMouseDown={e => onAccMouseDown(e, id)}
              title={interactive ? 'Drag to move' : acc.name}
            >{acc.emoji}</span>
          )
        })}
      </div>
    </div>
  )
}
