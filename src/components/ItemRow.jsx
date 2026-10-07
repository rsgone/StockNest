import { Link } from 'react-router-dom'
import { getIcon } from '../data/icons'
import { formatQty } from '../data/units'
import { useLanguage } from '../context/LanguageContext'

export function isLowStock(item) {
  return item.quantity <= item.minThreshold
}

export default function ItemRow({ item }) {
  const icon = getIcon(item.iconKey)
  const low = isLowStock(item)
  const { t } = useLanguage()

  return (
    <Link to={`/item/${item.id}`} className="item-row">
      <div className="item-icon">{icon.emoji}</div>
      <div className="item-info">
        <div className="item-name">{item.name}</div>
        <div className={`item-sub ${low ? 'low' : ''}`}>
          {low
            ? t('shoppingList.left', { qty: formatQty(item.quantity, item.unit) })
            : formatQty(item.quantity, item.unit)}
          {'  '}
          <span style={{ color: 'var(--ink-400)', fontWeight: 400 }}>
            · {t('itemRow.min')}: {formatQty(item.minThreshold, item.unit)}
          </span>
        </div>
      </div>
      <span className="chevron">›</span>
    </Link>
  )
}
