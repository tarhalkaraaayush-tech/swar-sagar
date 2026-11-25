import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { LANGUAGES } from '../i18n/strings'

// The paths here must match the <Route path="..."> entries in App.jsx.
const LINKS = [
  { to: '/', key: 'navHome' },
  { to: '/ragas', key: 'navRagas' },
  { to: '/taals', key: 'navTaals' },
  { to: '/compositions', key: 'navCompositions' },
  { to: '/classroom', key: 'navClassroom' },
]

export default function Navbar() {
  const { t, lang, setLang } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false) // mobile menu

  // NavLink passes { isActive } so we can highlight the current page.
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md transition-colors ${
      isActive ? 'text-gold' : 'text-mist hover:text-ivory'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-night/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-2xl font-bold text-gold">
          {t('siteName')}
        </Link>

        {/* Desktop links (hidden below the md breakpoint) */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            // `end` stops "/" from counting as active on every page
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {t(l.key)}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
            className="rounded-md border border-gold/30 bg-stage px-2 py-1 text-sm text-ivory"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          {/* Hamburger, only on small screens */}
          <button
            className="rounded-md p-2 text-gold md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="flex flex-col border-t border-gold/15 px-4 pb-3 md:hidden">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              {t(l.key)}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
