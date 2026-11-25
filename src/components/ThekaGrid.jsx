import { useLanguage } from '../context/LanguageContext'
import { romanizeBol } from '../utils/bols'

// Shows a theka laid out by vibhag, Bhatkhande style:
//   mark (X / 0 / 2 …) above, bols in the middle, matra numbers below.
// `current` is the matra index being played (for highlighting), or -1.

const markText = (mark) => (mark === 'X0' ? 'X/0' : mark)

export default function ThekaGrid({ taal, current = -1 }) {
  const { lang } = useLanguage()
  let matra = 0 // running matra number across vibhags

  return (
    <div className="flex flex-wrap gap-y-4">
      {taal.vibhags.map((v, vi) => (
        // the left border acts as the vibhag divider "|"
        <div key={vi} className="flex border-l-2 border-gold/40 pl-1 pr-2">
          {v.bols.map((bol, bi) => {
            const index = matra++
            const active = index === current
            const isKhali = v.mark === '0' || v.mark === 'X0'
            return (
              <div
                key={bi}
                className={`flex min-w-14 flex-col items-center rounded-lg px-2 py-2 transition-colors duration-75 ${
                  active ? 'bg-gold text-night' : ''
                }`}
              >
                <span
                  className={`h-5 text-sm font-bold ${
                    active ? 'text-night' : isKhali ? 'text-mist' : 'text-gold'
                  }`}
                >
                  {bi === 0 ? markText(v.mark) : ''}
                </span>
                <span className="text-lg font-semibold">{lang === 'en' ? romanizeBol(bol) : bol}</span>
                <span className={`text-xs ${active ? 'text-night/70' : 'text-mist/70'}`}>{index + 1}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
