import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { taals, matraCount, flattenTaal } from '../data/taals'
import { useLanguage } from '../context/LanguageContext'
import { useTaalPlayer } from '../hooks/useTaalPlayer'
import ThekaGrid from '../components/ThekaGrid'

export default function TaalDetailPage() {
  // useParams reads the ":id" part of the route /taals/:id
  const { id } = useParams()
  const { t, name, label } = useLanguage()
  const taal = taals.find((x) => x.id === id)

  const [bpm, setBpm] = useState(80)
  // useMemo keeps the same array between renders, so the player doesn't
  // think the taal changed (and stop) every time the tempo slider moves.
  const beats = useMemo(() => (taal ? flattenTaal(taal) : []), [taal])
  const { playing, current, start, stop } = useTaalPlayer(beats, bpm)

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
        <ThekaGrid taal={taal} current={current} />
      </div>

      {/* Player controls */}
      <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-gold/20 bg-stage p-6">
        <button
          onClick={playing ? stop : start}
          className="rounded-full bg-gold px-8 py-3 text-lg font-semibold text-night transition hover:bg-gold-soft"
        >
          {playing ? `■ ${t('stop')}` : `▶ ${t('play')}`}
        </button>

        <label className="flex flex-1 items-center gap-4">
          <span className="text-mist">{t('tempo')}</span>
          <input
            type="range"
            min="30"
            max="300"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="flex-1 accent-[var(--color-gold)]"
          />
          <span className="w-28 text-right">
            <span className="font-display text-2xl text-gold">{bpm}</span>{' '}
            <span className="text-sm text-mist">{t('bpm')}</span>
          </span>
        </label>

        <p className="w-full text-sm text-mist">{t('metronomeHint')}</p>
      </div>
    </section>
  )
}
