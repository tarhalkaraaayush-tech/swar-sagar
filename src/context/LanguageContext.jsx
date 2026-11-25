import { createContext, useContext, useEffect, useState } from 'react'
import { strings, valueLabels } from '../i18n/strings'

// Context = a value any component can read without passing props down
// through every level (like a global variable, but React re-renders
// readers when it changes).
const LanguageContext = createContext(null)

function loadSavedLang() {
  try {
    return localStorage.getItem('swar-sagar-lang') || 'mr'
  } catch {
    return 'mr' // storage can be blocked (private mode etc.)
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(loadSavedLang)

  // Remember the choice and tell the browser which language the page is in.
  useEffect(() => {
    try { localStorage.setItem('swar-sagar-lang', lang) } catch { /* ignore */ }
    document.documentElement.lang = lang
  }, [lang])

  // t('aaroh') → the UI string in the current language
  const t = (key) => strings[key]?.[lang] ?? key

  // name({ mr, en, hi }) → picks the right one, falling back to English
  const name = (obj) => obj?.[lang] ?? obj?.en ?? ''

  // label('thaat', 'kalyan') → "कल्याण" / "Kalyan"
  const label = (group, value) => {
    if (group === 'jaati') {
      // "audav-sampoorna" → "औडव-संपूर्ण"
      return value.split('-').map((part) => valueLabels.jaati[part]?.[lang] ?? part).join('-')
    }
    return valueLabels[group]?.[value]?.[lang] ?? value
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, name, label }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook so components just write: const { t } = useLanguage()
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
