import { createContext, useContext, useEffect, useState } from 'react'

// Display settings that aren't about language. Right now just the
// notation system; later this is where light/dark mode can live.
const SettingsContext = createContext(null)

const STORAGE_KEY = 'swar-sagar-notation'

function loadNotation() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'bhatkhande'
  } catch {
    return 'bhatkhande'
  }
}

export function SettingsProvider({ children }) {
  // 'bhatkhande' | 'paluskar'
  const [notation, setNotation] = useState(loadNotation)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, notation) } catch { /* ignore */ }
  }, [notation])

  return (
    <SettingsContext.Provider value={{ notation, setNotation }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}
