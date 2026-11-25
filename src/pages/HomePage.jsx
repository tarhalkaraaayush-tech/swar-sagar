import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const SECTIONS = [
  { to: '/ragas', key: 'navRagas', glyph: 'सा' },
  { to: '/taals', key: 'navTaals', glyph: 'धा' },
  { to: '/compositions', key: 'navCompositions', glyph: '♪' },
  { to: '/classroom', key: 'navClassroom', glyph: '✎' },
]

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-gold sm:text-7xl">{t('siteName')}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ivory/85">{t('heroTagline')}</p>
        <Link
          to="/ragas"
          className="mt-8 inline-block rounded-full bg-gold px-7 py-3 font-semibold text-night transition hover:bg-gold-soft"
        >
          {t('exploreRagas')}
        </Link>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="flex flex-col items-center gap-3 rounded-xl border border-gold/15 bg-stage p-8 transition hover:border-gold/50 hover:bg-curtain"
          >
            <span className="font-display text-4xl text-gold">{s.glyph}</span>
            <span className="text-lg">{t(s.key)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
