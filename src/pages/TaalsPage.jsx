import { Link } from 'react-router-dom'
import { taals, matraCount } from '../data/taals'
import { useLanguage } from '../context/LanguageContext'

// Sorted by number of matras, shortest first.
const SORTED = [...taals].sort((a, b) => matraCount(a) - matraCount(b))

export default function TaalsPage() {
  const { t, lang, name, label } = useLanguage()

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-display text-4xl text-gold">{t('navTaals')}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SORTED.map((taal) => (
          // Each card links to /taals/<id>; TaalDetailPage reads that id from the URL.
          <Link
            key={taal.id}
            to={`/taals/${taal.id}`}
            className="group flex flex-col gap-3 rounded-xl border border-gold/15 bg-stage p-5 transition hover:-translate-y-0.5 hover:border-gold/50 hover:bg-curtain"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-2xl text-gold-soft group-hover:text-gold">{name(taal.names)}</h3>
              {lang !== 'en' && <span className="text-sm text-mist">{taal.names.en}</span>}
            </div>
            <p className="text-ivory/90">
              <span className="font-display text-3xl text-gold">{matraCount(taal)}</span>{' '}
              {t('matras')} · {taal.vibhags.length} {t('vibhags')}
            </p>
            <p className="text-sm text-mist">
              {taal.vibhags.map((v) => v.bols.length).join(' | ')}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {taal.usedFor.map((u) => (
                <span key={u} className="rounded-full bg-ivory/10 px-2 py-0.5">{label('usedFor', u)}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
