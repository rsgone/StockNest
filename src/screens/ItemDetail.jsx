import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHousehold } from '../context/HouseholdContext'
import { useLanguage } from '../context/LanguageContext'
import { getIcon, categoryLabel, ICONS, DEFAULT_ICON } from '../data/icons'
import { formatQty, quickDeltasFor, ALL_UNITS } from '../data/units'
import { isLowStock } from '../components/ItemRow'
import Icon from '../components/Icon'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, updateItemQuantity, updateItemDetails, deleteItem } = useHousehold()
  const { t } = useLanguage()
  const item = items.find((i) => i.id === id)
  const [exactValue, setExactValue] = useState('')
  const [showExact, setShowExact] = useState(false)
  const [draftQty, setDraftQty] = useState(item?.quantity ?? 0)
  const [saving, setSaving] = useState(false)

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // Intentionally keyed on `id` only: this should reset the draft when
  // navigating to a different item, but must NOT re-fire on every remote
  // quantity change, or an in-progress unsaved edit would get clobbered.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setDraftQty(item?.quantity ?? 0)
    setShowExact(false)
    setExactValue('')
    setEditing(false)
    setEditForm(null)
  }, [id])

  if (!item) {
    return (
      <div className="screen">
        <p>{t('itemDetail.notFound')}</p>
      </div>
    )
  }

  const icon = getIcon(item.iconKey)
  const low = isLowStock(item)
  const deltas = quickDeltasFor(item.unit)
  const dirty = draftQty !== item.quantity

  function applyDelta(delta) {
    setDraftQty((prev) => Math.max(0, Math.round((prev + delta) * 100) / 100))
  }

  function handleSetExact(e) {
    e.preventDefault()
    if (exactValue === '') return
    setDraftQty(Math.max(0, Number(exactValue)))
    setExactValue('')
    setShowExact(false)
  }

  function handleDiscard() {
    setDraftQty(item.quantity)
  }

  async function handleSaveQuantity() {
    setSaving(true)
    try {
      await updateItemQuantity(item, draftQty)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (confirm(t('itemDetail.removeItemConfirm', { name: item.name }))) {
      await deleteItem(item.id)
      navigate('/home', { replace: true })
    }
  }

  function startEditing() {
    setEditForm({
      name: item.name,
      iconKey: item.iconKey,
      unit: item.unit,
      minThreshold: String(item.minThreshold),
    })
    setEditing(true)
  }

  function updateEditField(field, value) {
    setEditForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!editForm.name.trim() || editForm.minThreshold === '') return
    setSavingEdit(true)
    try {
      await updateItemDetails(item.id, {
        name: editForm.name.trim(),
        category: editForm.iconKey,
        iconKey: editForm.iconKey,
        unit: editForm.unit,
        minThreshold: Number(editForm.minThreshold),
      })
      setEditing(false)
      setEditForm(null)
    } finally {
      setSavingEdit(false)
    }
  }

  const lastUpdated = item.updatedAt?.toDate
    ? item.updatedAt.toDate().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    : '—'

  if (editing) {
    const selectedEditIcon = getIcon(editForm.iconKey)
    return (
      <div className="screen">
        <div className="topbar">
          <button className="icon-btn" onClick={() => setEditing(false)}>
            ‹
          </button>
          <h1>{t('itemDetail.editTitle')}</h1>
          <span style={{ width: 24 }} />
        </div>

        <form onSubmit={handleSaveEdit}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div className="item-icon" style={{ width: 60, height: 60, fontSize: 30 }}>
              {selectedEditIcon.emoji}
            </div>
          </div>

          <div className="field">
            <label>{t('addItem.nameLabel')}</label>
            <input
              autoFocus
              value={editForm.name}
              onChange={(e) => updateEditField('name', e.target.value)}
            />
          </div>

          <div className="field">
            <label>{t('addItem.categoryLabel')}</label>
            <input readOnly value={t(`icon.${editForm.iconKey}`)} />
          </div>

          <div className="field">
            <label>{t('addItem.step1')}</label>
            <div className="icon-grid">
              {ICONS.map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  className={`icon-tile ${editForm.iconKey === opt.key ? 'selected' : ''}`}
                  onClick={() => updateEditField('iconKey', opt.key)}
                >
                  <span className="emoji">{opt.emoji}</span>
                  <span className="label">{t(`icon.${opt.key}`)}</span>
                </button>
              ))}
              <button
                type="button"
                className={`icon-tile ${editForm.iconKey === 'other' ? 'selected' : ''}`}
                onClick={() => updateEditField('iconKey', 'other')}
              >
                <span className="emoji">{DEFAULT_ICON.emoji}</span>
                <span className="label">{t('icon.other')}</span>
              </button>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>{t('addItem.unitLabel')}</label>
              <select value={editForm.unit} onChange={(e) => updateEditField('unit', e.target.value)}>
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t('addItem.minThresholdLabel')}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={editForm.minThreshold}
                onChange={(e) => updateEditField('minThreshold', e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={savingEdit} style={{ marginBottom: 10 }}>
            {savingEdit ? t('addItem.saving') : t('addItem.save')}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>
            {t('addItem.cancel')}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          ‹
        </button>
        <h1>{t('itemDetail.title')}</h1>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" onClick={startEditing} title={t('itemDetail.editTitle')}>
            <Icon name="edit" size={18} />
          </button>
          <button className="icon-btn" onClick={handleDelete} title={t('itemDetail.removeTitle')}>
            <Icon name="trash" size={18} />
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div className="item-icon" style={{ width: 56, height: 56, fontSize: 28 }}>
            {icon.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{item.name}</div>
            <div style={{ color: 'var(--ink-400)', fontSize: 13 }}>{categoryLabel(item.category, t)}</div>
          </div>
          {low && <span className="badge badge-low">{t('itemDetail.lowStockBadge')}</span>}
        </div>

        <div className="detail-row">
          <span className="label-text">{t('itemDetail.currentQuantity')}</span>
          <span className="value-text">{formatQty(item.quantity, item.unit)}</span>
        </div>
        <div className="detail-row">
          <span className="label-text">{t('itemDetail.minThreshold')}</span>
          <span className="value-text">{formatQty(item.minThreshold, item.unit)}</span>
        </div>
        <div className="detail-row">
          <span className="label-text">{t('itemDetail.unit')}</span>
          <span className="value-text">{item.unit}</span>
        </div>
        <div className="detail-row">
          <span className="label-text">{t('itemDetail.lastUpdated')}</span>
          <span className="value-text">{lastUpdated}</span>
        </div>
        <div className="detail-row">
          <span className="label-text">{t('itemDetail.updatedBy')}</span>
          <span className="value-text">{item.updatedBy || '—'}</span>
        </div>
      </div>

      <div className="section-header">
        <h2>{t('itemDetail.updateQuantity')}</h2>
      </div>
      <div className="card">
        <div className="qty-controls">
          <button className="qty-btn dec" onClick={() => applyDelta(deltas[0])}>
            {deltas[0]}
          </button>
          <button className="qty-btn dec" onClick={() => applyDelta(deltas[1])}>
            {deltas[1]}
          </button>
          <span className="qty-display">{formatQty(draftQty, item.unit)}</span>
          <button className="qty-btn" onClick={() => applyDelta(deltas[2])}>
            +{deltas[2]}
          </button>
          <button className="qty-btn" onClick={() => applyDelta(deltas[3])}>
            +{deltas[3]}
          </button>
        </div>

        {!showExact ? (
          <button className="btn btn-secondary" onClick={() => setShowExact(true)} style={{ marginBottom: dirty ? 14 : 0 }}>
            {t('itemDetail.setExactQuantity')}
          </button>
        ) : (
          <form onSubmit={handleSetExact} style={{ display: 'flex', gap: 8, marginBottom: dirty ? 14 : 0 }}>
            <input
              autoFocus
              type="number"
              min="0"
              step="any"
              placeholder={t('itemDetail.exactPlaceholder', { unit: item.unit })}
              value={exactValue}
              onChange={(e) => setExactValue(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" style={{ width: 'auto', padding: '10px 16px' }}>
              {t('itemDetail.set')}
            </button>
          </form>
        )}

        {dirty && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleSaveQuantity} disabled={saving}>
              {saving
                ? t('itemDetail.saving')
                : t('itemDetail.save', {
                    from: formatQty(item.quantity, item.unit),
                    to: formatQty(draftQty, item.unit),
                  })}
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleDiscard}
              disabled={saving}
              style={{ width: 'auto', padding: '14px 12px' }}
            >
              {t('itemDetail.discard')}
            </button>
          </div>
        )}

        <p className="hint-text" style={{ textAlign: 'center' }}>
          {t('itemDetail.lastUpdatedFooter', { name: item.updatedBy || t('itemDetail.someone'), time: lastUpdated })}
        </p>
      </div>
    </div>
  )
}
