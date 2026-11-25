import { useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import SwaraText from './SwaraText'

export default function RagaModal({ raga, onClose }) {
  const { t, name, label } = useLanguage()

  // Close on Escape. The cleanup function removes the listener when the
  // modal closes, so listeners don't pile up.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const row = (key, content) => (
    <div className="grid grid-cols-[6rem_1fr] items-center gap-3 border-b border-gold/10 py-3">
      <dt className="text-sm text-mist">{t(key)}</dt>
      <dd>{content}</dd>
    </div>
  )

  return (
    // Clicking the dark backdrop closes; clicks inside the panel are stopped.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name(raga.names)}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gold/30 bg-stage p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-4xl text-gold">{name(raga.names)}</h2>
            <p className="mt-1 text-mist">
              {label('thaat', raga.thaat)} · {label('jaati', raga.jaati)} · {label('time', raga.time)}
            </p>
          </div>
          <button onClick={onClose} aria-label={t('close')} className="rounded-md px-2 text-2xl text-mist hover:text-gold">
            ×
          </button>
        </div>

        <p className="mb-4 leading-relaxed text-ivory/90">{name(raga.description)}</p>

        <dl className="text-lg">
          {row('aaroh', <SwaraText notation={raga.aaroh} />)}
          {row('avroh', <SwaraText notation={raga.avroh} />)}
          {row('pakad', <SwaraText notation={raga.pakad} />)}
          {row('vadi', <SwaraText notation={raga.vadi} />)}
          {row('samvadi', <SwaraText notation={raga.samvadi} />)}
        </dl>
      </div>
    </div>
  )
}
