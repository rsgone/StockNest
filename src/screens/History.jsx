import { useMemo, useState } from 'react'
import { useHousehold } from '../context/HouseholdContext'
import { useLanguage } from '../context/LanguageContext'
import { formatQty } from '../data/units'
import Icon from '../components/Icon'

const PAGE_SIZE = 10

function dayKey(date) {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (sameDay(date, today)) return 'today'
  if (sameDay(date, yesterday)) return 'yesterday'
  return date.toLocaleDateString('en-CA') // stable YYYY-MM-DD grouping key
}

export default function History() {
  const { history, household } = useHousehold()
  const { t } = useLanguage()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterPerson, setFilterPerson] = useState(null)

  const people = useMemo(() => {
    const names = Object.values(household?.members || {}).map((m) => m.name)
    return Array.from(new Set(names))
  }, [household])

  const filteredHistory = filterPerson
    ? history.filter((e) => e.updatedBy?.trim().toLowerCase() === filterPerson.trim().toLowerCase())
    : history
  const visibleHistory = filteredHistory.slice(0, visibleCount)
  const hasMore = filteredHistory.length > visibleCount

  const groups = useMemo(() => {
    const map = new Map()
    for (const entry of visibleHistory) {
      const date = entry.updatedAt?.toDate ? entry.updatedAt.toDate() : new Date()
      const key = dayKey(date)
      if (!map.has(key)) map.set(key, { date, entries: [] })
      map.get(key).entries.push({ ...entry, _date: date })
    }
    return Array.from(map.values())
  }, [visibleHistory])

  function dayLabel(key, date) {
    if (key === 'today') return t('history.today')
    if (key === 'yesterday') return t('history.yesterday')
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  function selectPerson(name) {
    setFilterPerson(name)
    setVisibleCount(PAGE_SIZE)
    setFilterOpen(false)
  }

  return (
    <div className="screen">
      <div className="topbar">
        <h1>{t('history.title')}</h1>
        <button
          className="icon-btn"
          style={{ color: filterPerson ? 'var(--green-700)' : 'var(--ink-400)' }}
          onClick={() => setFilterOpen((prev) => !prev)}
          title={t('history.filterByPerson')}
        >
          <Icon name="filter" size={18} />
        </button>
      </div>

      {filterOpen && (
        <div className="chip-row">
          <button className={`chip ${!filterPerson ? 'active' : ''}`} onClick={() => selectPerson(null)}>
            {t('history.filterAll')}
          </button>
          {people.map((name) => (
            <button
              key={name}
              className={`chip ${filterPerson?.trim().toLowerCase() === name.trim().toLowerCase() ? 'active' : ''}`}
              onClick={() => selectPerson(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {groups.length === 0 && (
        <p style={{ color: 'var(--ink-400)', fontSize: 14, textAlign: 'center', marginTop: 30 }}>
          {t('history.empty')}
        </p>
      )}

      {groups.map(({ date, entries }) => {
        const key = dayKey(date)
        return (
          <div key={key}>
            <div className="history-day">{dayLabel(key, date)}</div>
            {entries.map((entry) => {
              const isIncrease =
                entry.changeType === 'increase' ||
                (entry.changeType === 'set' && entry.newQty > (entry.oldQty ?? 0))
              const isCreated = entry.changeType === 'created'
              return (
                <div key={entry.id} className="history-entry">
                  <div className="history-time">
                    {entry._date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <span className={`history-badge ${isCreated ? 'new' : isIncrease ? 'up' : 'down'}`}>
                    {isCreated ? <Icon name="plus" size={16} /> : isIncrease ? '↑' : '↓'}
                  </span>
                  <div className="history-main">
                    <div className="item-name">{entry.itemName}</div>
                    <div className="item-sub">
                      {isCreated
                        ? t('history.added', { qty: formatQty(entry.newQty, entry.unit) })
                        : `${formatQty(entry.oldQty, entry.unit)} → ${formatQty(entry.newQty, entry.unit)}`}
                    </div>
                    <div className="item-sub">{t('history.updatedBy', { name: entry.updatedBy })}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {hasMore && (
        <button
          className="btn btn-secondary"
          style={{ marginTop: 8 }}
          onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
        >
          {t('history.seeMore')}
        </button>
      )}
    </div>
  )
}
