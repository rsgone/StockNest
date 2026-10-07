import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHousehold } from '../context/HouseholdContext'
import { useLanguage } from '../context/LanguageContext'
import ItemRow, { isLowStock } from '../components/ItemRow'
import Icon from '../components/Icon'

const SORT_MODES = ['name', 'low', 'recent']

function sortItems(items, mode) {
  const byName = (a, b) => a.name.localeCompare(b.name)
  if (mode === 'recent') {
    return [...items].sort(
      (a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0)
    )
  }
  if (mode === 'low') {
    const low = items.filter(isLowStock).sort(byName)
    const rest = items.filter((i) => !isLowStock(i)).sort(byName)
    return [...low, ...rest]
  }
  return [...items].sort(byName)
}

export default function Home() {
  const { name, items, lowStockAlertEnabled } = useHousehold()
  const { t } = useLanguage()

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState('low')

  const categories = new Set(items.map((i) => i.category)).size

  const sortedItems = useMemo(() => sortItems(items, sortMode), [items, sortMode])
  const lowStockItems = lowStockAlertEnabled ? sortedItems.filter(isLowStock) : []

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return sortedItems.filter((i) => i.name.toLowerCase().includes(q))
  }, [sortedItems, query])

  function sortLabel(mode) {
    return t(`home.sort${mode === 'name' ? 'Name' : mode === 'low' ? 'Low' : 'Recent'}`)
  }

  function toggleSearch() {
    setSearchOpen((prev) => {
      if (prev) setQuery('')
      return !prev
    })
  }

  return (
    <div className="screen">
      <div className="topbar">
        <h1>{t('home.title')}</h1>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" onClick={toggleSearch} title={t('home.searchPlaceholder')}>
            <Icon name="search" />
          </button>
          <span className="topbar-sort-icon-wrap" title={sortLabel(sortMode)}>
            <Icon name="sort" size={18} className="topbar-sort-icon" />
            <select
              className="topbar-sort-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              aria-label={sortLabel(sortMode)}
            >
              {SORT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {sortLabel(mode)}
                </option>
              ))}
            </select>
          </span>
        </div>
      </div>

      <p style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 600 }}>
        {t('home.greeting', { name })}
      </p>

      {searchOpen && (
        <div className="field">
          <input
            autoFocus
            placeholder={t('home.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {searchResults ? (
        <>
          <div className="section-header">
            <h2>{t('home.allItems')}</h2>
          </div>
          {searchResults.length === 0 ? (
            <p style={{ color: 'var(--ink-400)', fontSize: 14 }}>{t('home.noResults', { query })}</p>
          ) : (
            <div className="item-list">
              {searchResults.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-value">{items.length}</div>
              <div className="stat-label">{t('home.totalItems')}</div>
            </div>
            <Link to="/shopping-list" className="stat-card low" title={t('home.viewAll')}>
              <div className="stat-value">{lowStockItems.length}</div>
              <div className="stat-label">{t('home.lowStock')}</div>
            </Link>
            <div className="stat-card">
              <div className="stat-value">{categories}</div>
              <div className="stat-label">{t('home.categories')}</div>
            </div>
          </div>

          <p className="hint-text" style={{ marginTop: -10 }}>
            {t('home.sortedBy', { mode: sortLabel(sortMode) })}
          </p>

          <div className="section-header">
            <h2>{t('home.allItems')}</h2>
          </div>
          {sortedItems.length === 0 ? (
            <p style={{ color: 'var(--ink-400)', fontSize: 14 }}>{t('home.emptyState')}</p>
          ) : (
            <div className="item-list">
              {sortedItems.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
