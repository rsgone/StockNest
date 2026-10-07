import { LANGUAGES } from '../i18n/translations'
import { useLanguage } from '../context/LanguageContext'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="chip-row" style={{ justifyContent: 'center', overflow: 'visible' }}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`chip ${language === lang.code ? 'active' : ''}`}
          onClick={() => setLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
