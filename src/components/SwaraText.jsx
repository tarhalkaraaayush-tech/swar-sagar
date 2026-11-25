import { useLanguage } from '../context/LanguageContext'
import { useSettings } from '../context/SettingsContext'

// Turns a notation string like "N' R G m D N S\"" into styled swaras.
// The data is always written in our ASCII notation; this component decides
// how to draw it based on two settings:
//   • language  → Latin letters (en) or Devanagari सा रे ग … (mr/hi)
//   • notation  → Bhatkhande or Paluskar marks (see the .bk / .pal rules in index.css)
//
//                 Bhatkhande            Paluskar
//   komal         line below            halant (्) below
//   tivra Ma      vertical line above   inverted halant below
//   mandra        dot below             dot above
//   taar          dot above             vertical line above

const KOMAL = new Set(['r', 'g', 'd', 'n'])

const DEVANAGARI = { S: 'सा', R: 'रे', G: 'ग', M: 'म', P: 'प', D: 'ध', N: 'नि' }

function parseSwara(token) {
  // token examples: "S", "m", "N'", "S\""
  const letter = token[0]
  const marks = []
  if (KOMAL.has(letter)) marks.push('komal')
  if (letter === 'm') marks.push('tivra')
  if (token.endsWith("'")) marks.push('mandra')
  if (token.endsWith('"')) marks.push('taar')
  return { base: letter.toUpperCase(), marks }
}

export default function SwaraText({ notation: text, className = '' }) {
  const { lang } = useLanguage()
  const { notation } = useSettings()
  const system = notation === 'paluskar' ? 'pal' : 'bk'

  // Split on commas first (phrase breaks), then on spaces (individual swaras).
  const phrases = text.split(',').map((p) => p.trim().split(/\s+/).filter(Boolean))

  return (
    <span className={`font-semibold tracking-wide ${className}`}>
      {phrases.map((phrase, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2 text-mist">,</span>}
          {phrase.map((token, j) => {
            const { base, marks } = parseSwara(token)
            const display = lang === 'en' ? base : DEVANAGARI[base] ?? base
            return (
              <span key={j} className={`swara ${system} ${marks.join(' ')} mx-[0.2em]`}>
                {display}
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}
