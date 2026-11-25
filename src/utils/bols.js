// Romanize tabla bols for the English UI: 'धिंधिं' → 'DhinDhin', 'ऽधा' → '-Dha'.
// Works by greedy longest-match: at each position, try the longest known
// syllable first (so 'तिरकिट' wins over 'ति').

const SYLLABLES = {
  'तिरकिट': 'TiRaKiTa',
  'त्रक': 'Trak', 'त्ता': 'Tta', 'धागे': 'DhaGe',
  'धिं': 'Dhin', 'तिं': 'Tin', 'दिं': 'Din', 'तूं': 'Tun',
  'किट': 'KiTa', 'तिट': 'TiTa', 'कत': 'Kat', 'गदि': 'Gadi', 'गन': 'Gan',
  'धा': 'Dha', 'धी': 'Dhi', 'धि': 'Dhi', 'ना': 'Na', 'ती': 'Ti', 'ति': 'Ti',
  'ता': 'Ta', 'तू': 'Tu', 'गे': 'Ge', 'तक': 'TaK',
  'न': 'Na', 'क': 'Ka', 'ट': 'Ta', 'ग': 'Ga',
  'ऽ': '-',
}
const KEYS = Object.keys(SYLLABLES).sort((a, b) => b.length - a.length)

export function romanizeBol(bol) {
  let out = ''
  let i = 0
  while (i < bol.length) {
    const key = KEYS.find((k) => bol.startsWith(k, i))
    if (key) {
      out += SYLLABLES[key]
      i += key.length
    } else {
      out += bol[i] // unknown character: pass through
      i += 1
    }
  }
  return out
}
