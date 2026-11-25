import { useLanguage } from '../context/LanguageContext'
import { romanizeBol } from '../utils/bols'

// Shows a theka laid out by vibhag, Bhatkhande style:
//   mark (X / 0 / 2 …) above, bols in the middle, matra numbers below.

const markText = (mark) => (mark === 'X0' ? 'X/0' : mark)

export default function ThekaGrid({ taal }) {
  const { lang } = useLanguage()

  // Where each vibhag starts in the overall count: Teentaal → [0, 4, 8, 12].
  // Computed up front instead of mutating a counter while rendering.
  const starts = taal.vibhags.map((_, vi) =>
    taal.vibhags.slice(0, vi).reduce((sum, v) => sum + v.bols.length, 0),
  )

  return (
    <div className="flex flex-wrap gap-y-4">
      {taal.vibhags.map((v, vi) => (
        // the left border acts as the vibhag divider "|"
        <div key={vi} className="flex border-l-2 border-gold/40 pl-1 pr-2">
          {v.bols.map((bol, bi) => {
            const index = starts[vi] + bi
            const isKhali = v.mark === '0' || v.mark === 'X0'
            return (
              <div
                key={bi}
                className="flex min-w-14 flex-col items-center px-2 py-2"
              >
                <span className={`h-5 text-sm font-bold ${isKhali ? 'text-mist' : 'text-gold'}`}>
                  {bi === 0 ? markText(v.mark) : ''}
                </span>
                <span className="text-lg font-semibold">{lang === 'en' ? romanizeBol(bol) : bol}</span>
                <span className="text-xs text-mist/70">{index + 1}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
