import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../context/HouseholdContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'

const APP_INSTALL_URL = 'https://stocknest-rk.web.app'

export default function Settings() {
  const {
    name,
    saveName,
    householdId,
    household,
    leaveHousehold,
    lowStockAlertEnabled,
    setLowStockAlertEnabled,
  } = useHousehold()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(name)

  function copyCode() {
    navigator.clipboard?.writeText(householdId)
  }

  function handleSaveName(e) {
    e.preventDefault()
    if (!nameDraft.trim()) return
    saveName(nameDraft.trim())
    setEditingName(false)
  }

  function handleShareApp() {
    const message = t('settings.shareAppMessage', { link: APP_INSTALL_URL })
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_system')
  }

  function handleChangeHousehold() {
    if (confirm(t('settings.changeConfirm'))) {
      leaveHousehold()
      navigate('/household-setup', { replace: true })
    }
  }

  const memberCount = household ? Object.keys(household.members || {}).length : 0

  return (
    <div className="screen">
      <div className="topbar">
        <h1>{t('settings.title')}</h1>
        <button className="icon-btn" onClick={handleShareApp} title={t('settings.shareApp')}>
          <FontAwesomeIcon icon={faWhatsapp} size="lg" style={{ color: '#25D366' }} />
        </button>
      </div>

      <div className="section-header">
        <h2>{t('settings.profile')}</h2>
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        {!editingName ? (
          <div
            className="item-row"
            style={{ boxShadow: 'none', padding: 0, cursor: 'pointer' }}
            onClick={() => {
              setNameDraft(name)
              setEditingName(true)
            }}
          >
            <div className="item-icon">👤</div>
            <div className="item-info">
              <div className="item-sub">{t('settings.name')}</div>
              <div className="item-name">{name}</div>
            </div>
            <span className="chevron">›</span>
          </div>
        ) : (
          <form onSubmit={handleSaveName} style={{ display: 'flex', gap: 8 }}>
            <input autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
            <button className="btn btn-primary" type="submit" style={{ width: 'auto', padding: '10px 16px' }}>
              {t('settings.save')}
            </button>
          </form>
        )}
      </div>

      <div className="section-header">
        <h2>{t('settings.household')}</h2>
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="detail-row">
          <span className="label-text">{t('settings.householdId')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="value-text">{householdId}</span>
            <button className="copy-btn" onClick={copyCode}>
              {t('household.copy')}
            </button>
          </div>
        </div>
        <div className="detail-row">
          <span className="label-text">{t('settings.members')}</span>
          <span className="value-text">{memberCount}</span>
        </div>
        <p className="hint-text" style={{ marginBottom: 12 }}>
          {t('settings.shareHint')}
        </p>
        <button className="btn btn-secondary" onClick={() => navigate('/household')}>
          {t('settings.viewHousehold')}
        </button>
        <div style={{ height: 10 }} />
        <button className="btn btn-ghost" onClick={handleChangeHousehold}>
          {t('settings.changeHousehold')}
        </button>
      </div>

      <div className="section-header">
        <h2>{t('settings.preferences')}</h2>
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>{t('settings.language')}</label>
          <LanguageToggle />
        </div>
        <div className="detail-row">
          <span className="label-text">{t('settings.units')}</span>
          <span className="value-text">{t('settings.unitsValue')}</span>
        </div>
        <div className="detail-row">
          <span className="label-text">{t('settings.lowStockAlert')}</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={lowStockAlertEnabled}
              onChange={(e) => setLowStockAlertEnabled(e.target.checked)}
            />
            <span className="value-text">{lowStockAlertEnabled ? t('settings.on') : t('settings.off')}</span>
          </label>
        </div>
      </div>

      <div className="section-header">
        <h2>{t('settings.about')}</h2>
      </div>
      <div className="card">
        <div className="detail-row">
          <span className="label-text">{t('settings.appVersion')}</span>
          <span className="value-text">1.0.0</span>
        </div>
      </div>
    </div>
  )
}
