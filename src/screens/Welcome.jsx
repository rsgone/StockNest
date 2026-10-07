import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../context/HouseholdContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'
import appIcon from '../assets/app-icon-web.png'

export default function Welcome() {
  const { saveName } = useHousehold()
  const { t } = useLanguage()
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  function handleContinue(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    saveName(trimmed)
    navigate('/household-setup')
  }

  return (
    <div className="center-screen">
      <img src={appIcon} alt="" width={112} height={112} style={{ margin: '0 auto 8px' }} />
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.subtitle')}</p>

      <div className="field" style={{ textAlign: 'left' }}>
        <label>{t('welcome.languageLabel')}</label>
        <LanguageToggle />
      </div>

      <form onSubmit={handleContinue}>
        <div className="field" style={{ textAlign: 'left' }}>
          <label>{t('welcome.nameLabel')}</label>
          <input
            autoFocus
            placeholder={t('welcome.namePlaceholder')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={!value.trim()}>
          {t('welcome.continue')}
        </button>
      </form>
      <p className="hint-text">{t('welcome.hint')}</p>
    </div>
  )
}
