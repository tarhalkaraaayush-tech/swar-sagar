import { useLanguage } from '../context/LanguageContext'
import SwaraText from './SwaraText'

export default function RagaCard({ raga, onOpen }) {
  const { lang, name, label } = useLanguage()

  return (
    <button
      onClick={() => onOpen(raga)}
      className="group flex flex-col gap-3 rounded-xl border border-gold/15 bg-stage p-5 text-left transition hover:-translate-y-0.5 hover:border-gold/50 hover:bg-curtain"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl text-gold-soft group-hover:text-gold">
          {name(raga.names)}
        </h3>
        {/* show the English name too when browsing in mr/hi (not in English — it'd repeat) */}
        {lang !== 'en' && <span className="text-sm text-mist">{raga.names.en}</span>}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-gold-soft">{label('thaat', raga.thaat)}</span>
        <span className="rounded-full bg-ivory/10 px-2 py-0.5">{label('jaati', raga.jaati)}</span>
        <span className="rounded-full bg-ivory/10 px-2 py-0.5">{label('time', raga.time)}</span>
      </div>

      <SwaraText notation={raga.aaroh} className="text-lg text-ivory/90" />
    </button>
  )
}
