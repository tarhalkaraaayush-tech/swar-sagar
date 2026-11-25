// Turns a notation string like "N' R G m D N S\"" into styled swaras:
// komal → underlined, tivra → stroke above, mandra → dot below, taar → dot above.

const KOMAL = new Set(['r', 'g', 'd', 'n'])

function parseSwara(token) {
  // token examples: "S", "m", "N'", "S\""
  const letter = token[0]
  const octave = token.endsWith("'") ? 'mandra' : token.endsWith('"') ? 'taar' : null
  const classes = ['swara']
  if (KOMAL.has(letter)) classes.push('komal')
  if (letter === 'm') classes.push('tivra')
  if (octave) classes.push(octave)
  return { display: letter.toUpperCase(), className: classes.join(' ') }
}

export default function SwaraText({ notation, className = '' }) {
  // Split on commas first (phrase breaks), then on spaces (individual swaras).
  const phrases = notation.split(',').map((p) => p.trim().split(/\s+/).filter(Boolean))

  return (
    <span className={`font-semibold tracking-wide ${className}`}>
      {phrases.map((phrase, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2 text-mist">,</span>}
          {phrase.map((token, j) => {
            const { display, className: c } = parseSwara(token)
            return (
              <span key={j} className={`${c} mx-[0.2em]`}>
                {display}
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}
