import { Link, useParams } from 'react-router-dom'
import { taals, matraCount } from '../data/taals'
import { useLanguage } from '../context/LanguageContext'
import ThekaGrid from '../components/ThekaGrid'

export default function TaalDetailPage() {
  // useParams reads the ":id" part of the route /taals/:id
  const { id } = useParams()
  const { t, name, label } = useLanguage()
  const taal = taals.find((x) => x.id === id)

  if (!taal) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-24 text-center">
        <Link to="/taals" className="text-gold">{t('allTaals')}</Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/taals" className="text-sm text-gold hover:text-gold-soft">{t('allTaals')}</Link>

      <h1 className="mt-4 font-display text-5xl text-gold">{name(taal.names)}</h1>
      <p className="mt-2 text-lg text-ivory/85">
        {matraCount(taal)} {t('matras')} · {taal.vibhags.length} {t('vibhags')} ·{' '}
        <span className="text-mist">{taal.vibhags.map((v) => v.bols.length).join(' | ')}</span>
      </p>
      <p className="mt-1 text-sm text-mist">
        {t('usedIn')}: {taal.usedFor.map((u) => label('usedFor', u)).join(', ')}
      </p>
      {taal.note && <p className="mt-3 text-ivory/85">{name(taal.note)}</p>}

      <div className="mt-8 rounded-2xl border border-gold/20 bg-stage p-6">
        <h2 className="mb-4 font-display text-2xl text-gold-soft">{t('theka')}</h2>
        <ThekaGrid taal={taal} />
      </div>
    </section>
  )
}
