import { useUserData } from '../store/useUserData'
import { useToast } from '../components/Toast'
import { ACCESSORIES } from '../data/accessories'

export default function ShopPage() {
  const u = useUserData()
  const { toast } = useToast()

  function buy(acc) {
    if (u.coins < acc.price) return
    u.setField('coins', c => c - acc.price)
    u.setField('ownedAccessories', prev => [...prev, acc.id])
    toast(`🛒 Bought ${acc.name}!`, { kind: 'good' })
  }

  function remove(acc) {
    u.setField('ownedAccessories', prev => prev.filter(id => id !== acc.id))
  }

  return (
    <div className="shop-page">
      <h2>🛒 Shop</h2>
      <p className="home-sub">Spend your coins on accessories for your plant.</p>
      <div className="shop-balance">🪙 <strong>{u.coins.toLocaleString()}</strong> coins</div>
      <div className="shop-grid">
        {ACCESSORIES.map(acc => {
          const owned = u.ownedAccessories.includes(acc.id)
          const cantAfford = !owned && u.coins < acc.price
          return (
            <div key={acc.id} className={`shop-card ${owned ? 'owned' : ''}`}>
              <span className="shop-emoji">{acc.emoji}</span>
              <span className="shop-name">{acc.name}</span>
              <span className="shop-price">🪙 {acc.price}</span>
              {owned ? (
                <button className="timer-btn timer-stop" style={{fontSize:'0.78rem'}} onClick={() => remove(acc)}>
                  Remove
                </button>
              ) : (
                <button
                  className="timer-btn timer-start"
                  style={{fontSize:'0.78rem'}}
                  disabled={cantAfford}
                  onClick={() => buy(acc)}
                  title={cantAfford ? `Need ${acc.price - u.coins} more coins` : ''}
                >Buy</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
