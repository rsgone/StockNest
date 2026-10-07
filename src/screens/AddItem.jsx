import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../context/HouseholdContext'
import { useLanguage } from '../context/LanguageContext'
import { ICONS, ICON_CATEGORIES, DEFAULT_ICON } from '../data/icons'
import { ALL_UNITS } from '../data/units'

export default function AddItem() {
  const { addItem } = useHousehold()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [search, setSearch] = useState('')
  const [iconCategory, setIconCategory] = useState('all')
  const [iconKey, setIconKey] = useState(null)

  const [form, setForm] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    minThreshold: '',
    thresholdUnit: 'kg',
  })
  const [saving, setSaving] = useState(false)

  const filteredIcons = useMemo(() => {
    return ICONS.filter((icon) => {
      const matchesCategory = iconCategory === 'all' || icon.category === iconCategory
      const matchesSearch = t(`icon.${icon.key}`).toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, iconCategory, t])

  const selectedIcon = iconKey ? ICONS.find((i) => i.key === iconKey) || DEFAULT_ICON : DEFAULT_ICON

  function chooseIcon(key) {
    setIconKey(key)
    setStep(2)
  }

  function update(field, value) {
    setForm((f) => (field === 'unit' ? { ...f, unit: value, thresholdUnit: value } : { ...f, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim() || form.quantity === '' || form.minThreshold === '') return
    setSaving(true)
    try {
      const finalIconKey = iconKey || 'other'
      await addItem({
        name: form.name.trim(),
        category: finalIconKey,
        iconKey: finalIconKey,
        quantity: Number(form.quantity),
        unit: form.unit,
        minThreshold: Number(form.minThreshold),
      })
      navigate('/home')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={() => (step === 1 ? navigate(-1) : setStep(1))}>
          ‹
        </button>
        <h1>{t('addItem.title')}</h1>
        <span style={{ width: 24 }} />
      </div>

      <div className="stepper">
        <span className={`step ${step === 1 ? 'active' : ''}`}>1 {t('addItem.step1')}</span>
        <span>—</span>
        <span className={`step ${step === 2 ? 'active' : ''}`}>2 {t('addItem.step2')}</span>
      </div>

      {step === 1 && (
        <>
          <div className="field">
            <input
              placeholder={t('addItem.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="chip-row">
            {ICON_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`chip ${iconCategory === cat ? 'active' : ''}`}
                onClick={() => setIconCategory(cat)}
              >
                {t(`iconCategory.${cat}`)}
              </button>
            ))}
          </div>
          <div className="icon-grid">
            {filteredIcons.map((icon) => (
              <button
                key={icon.key}
                className={`icon-tile ${iconKey === icon.key ? 'selected' : ''}`}
                onClick={() => chooseIcon(icon.key)}
              >
                <span className="emoji">{icon.emoji}</span>
                <span className="label">{t(`icon.${icon.key}`)}</span>
              </button>
            ))}
          </div>
          <button
            className="icon-tile"
            style={{ width: '100%', marginTop: 14, flexDirection: 'row', gap: 10, justifyContent: 'center' }}
            onClick={() => chooseIcon('other')}
          >
            <span className="emoji">{DEFAULT_ICON.emoji}</span>
            <span className="label">{t('icon.other')}</span>
          </button>
        </>
      )}

      {step === 2 && (
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div className="item-icon" style={{ width: 60, height: 60, fontSize: 30 }}>
              {selectedIcon.emoji}
            </div>
          </div>

          <div className="field">
            <label>{t('addItem.nameLabel')}</label>
            <input
              autoFocus
              placeholder={t('addItem.namePlaceholder')}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>

          <div className="field">
            <label>{t('addItem.categoryLabel')}</label>
            <input readOnly value={t(`icon.${iconKey || 'other'}`)} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>{t('addItem.quantityLabel')}</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="5"
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t('addItem.unitLabel')}</label>
              <select value={form.unit} onChange={(e) => update('unit', e.target.value)}>
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>{t('addItem.minThresholdLabel')}</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="2"
                value={form.minThreshold}
                onChange={(e) => update('minThreshold', e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t('addItem.unitLabel')}</label>
              <select value={form.thresholdUnit} disabled>
                <option value={form.unit}>{form.unit}</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginBottom: 10 }}>
            {saving ? t('addItem.saving') : t('addItem.save')}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
            {t('addItem.cancel')}
          </button>
        </form>
      )}
    </div>
  )
}
