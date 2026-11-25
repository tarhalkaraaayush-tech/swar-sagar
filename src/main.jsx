import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { SettingsProvider } from './context/SettingsContext'
import App from './App'
import './index.css'

// Providers wrap the whole app so every component can use routing and language.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
