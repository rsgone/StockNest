import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { translations, DEFAULT_LANGUAGE } from '../i18n/translations'

const LanguageContext = createContext(null)
const LANG_KEY = 'stocknest_language'

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem(LANG_KEY) || DEFAULT_LANGUAGE
  )

  const setLanguage = useCallback((lang) => {
    localStorage.setItem(LANG_KEY, lang)
    setLanguageState(lang)
  }, [])

  const t = useCallback(
    (key, vars) => {
      const dict = translations[language] || translations[DEFAULT_LANGUAGE]
      let str = dict[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, v)
        }
      }
      return str
    },
    [language]
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
