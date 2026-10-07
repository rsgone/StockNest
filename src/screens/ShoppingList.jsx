import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../context/HouseholdContext'
import { useLanguage } from '../context/LanguageContext'
import { isLowStock } from '../components/ItemRow'
import { getIcon } from '../data/icons'
import { formatQty } from '../data/units'

export default function ShoppingList() {
  const { items, setPurchased } = useHousehold()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [tab, setTab] = useState('toBuy')
  const [selected, setSelected] = useState(new Set())

  const lowStock = items.filter(isLowStock)
  const toBuy = lowStock.filter((i) => !i.purchased)
  const purchased = lowStock.filter((i) => i.purchased)
  const list = tab === 'toBuy' ? toBuy : purchased

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleMark() {
    if (selected.size === 0) return
    await setPurchased(Array.from(selected), tab === 'toBuy')
    setSelected(new Set())
  }

  return (
    <div className="screen">
      <div className="topbar">
        <h1>{t('shoppingList.title')}</h1>
        <span style={{ width: 24 }} />
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'toBuy' ? 'active' : ''}`}
          onClick={() => {
            setTab('toBuy')
            setSelected(new Set())
          }}
        >
          {t('shoppingList.toBuy', { count: toBuy.length })}
        </button>
        <button
          className={`tab ${tab === 'purchased' ? 'active' : ''}`}
          onClick={() => {
            setTab('purchased')
            setSelected(new Set())
          }}
        >
          {t('shoppingList.purchased', { count: purchased.length })}
        </button>
      </div>

      {list.length === 0 ? (
        <p style={{ color: 'var(--ink-400)', fontSize: 14, textAlign: 'center', marginTop: 30 }}>
          {tab === 'toBuy' ? t('shoppingList.emptyToBuy') : t('shoppingList.emptyPurchased')}
        </p>
      ) : (
        <div className="item-list" style={{ marginBottom: 18 }}>
          {list.map((item) => {
            const icon = getIcon(item.iconKey)
            return (
              <label key={item.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                />
                <div className="item-icon">{icon.emoji}</div>
                <div className="item-info" onClick={() => navigate(`/item/${item.id}`)}>
                  <div className="item-name">{item.name}</div>
                  <div className="item-sub low">
                    {t('shoppingList.left', { qty: formatQty(item.quantity, item.unit) })}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      )}

      {list.length > 0 && (
        <button className="btn btn-primary" onClick={handleMark} disabled={selected.size === 0}>
          {tab === 'toBuy' ? t('shoppingList.markPurchased') : t('shoppingList.moveToBuy')}
        </button>
      )}
    </div>
  )
}
