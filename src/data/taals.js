// Each taal is a list of vibhags. Each vibhag has:
//   mark: 'X' = sam (tali), '0' = khali, '2' '3' '4' = later talis,
//         'X0' = sam that is also khali (Roopak)
//   bols: one string per matra (Devanagari). A matra holding several bols
//         is written joined, e.g. 'धिंधिं'. 'ऽ' = a held/silent beat.
// The total matra count is computed from the bols, so it can't drift out of sync.

export const taals = [
  {
    id: 'dadra',
    names: { mr: 'दादरा', en: 'Dadra', hi: 'दादरा' },
    usedFor: ['light'],
    vibhags: [
      { mark: 'X', bols: ['धा', 'धी', 'ना'] },
      { mark: '0', bols: ['धा', 'ती', 'ना'] },
    ],
  },
  {
    id: 'roopak',
    names: { mr: 'रूपक', en: 'Roopak', hi: 'रूपक' },
    usedFor: ['khayal', 'light', 'instrumental'],
    note: {
      mr: 'सम हाच खाली — रूपकचे वैशिष्ट्य.',
      en: 'The sam itself is khali — Roopak\'s signature.',
      hi: 'सम ही खाली है — रूपक की पहचान।',
    },
    vibhags: [
      { mark: 'X0', bols: ['ती', 'ती', 'ना'] },
      { mark: '2', bols: ['धी', 'ना'] },
      { mark: '3', bols: ['धी', 'ना'] },
    ],
  },
  {
    id: 'bhajani',
    names: { mr: 'भजनी', en: 'Bhajani', hi: 'भजनी' },
    usedFor: ['light'],
    vibhags: [
      { mark: 'X', bols: ['धिं', 'ना', 'धिं', 'धिंना'] },
      { mark: '0', bols: ['धिं', 'ना', 'तिं', 'तिंना'] },
    ],
  },
  {
    id: 'keherava',
    names: { mr: 'केहरवा', en: 'Keherava', hi: 'कहरवा' },
    usedFor: ['light'],
    vibhags: [
      { mark: 'X', bols: ['धा', 'गे', 'न', 'ति'] },
      { mark: '0', bols: ['न', 'क', 'धि', 'न'] },
    ],
  },
  {
    id: 'matta',
    names: { mr: 'मत्त ताल', en: 'Matta Taal', hi: 'मत्त ताल' },
    usedFor: ['instrumental'],
    vibhags: [
      { mark: 'X', bols: ['धिं', 'तिरकिट'] },
      { mark: '2', bols: ['धिं', 'ना'] },
      { mark: '0', bols: ['तूं', 'ना'] },
      { mark: '3', bols: ['धिंधिं', 'नाधिं', 'धिंना'] },
    ],
  },
  {
    id: 'jhaptaal',
    names: { mr: 'झपताल', en: 'Jhaptaal', hi: 'झपताल' },
    usedFor: ['khayal', 'instrumental'],
    vibhags: [
      { mark: 'X', bols: ['धी', 'ना'] },
      { mark: '2', bols: ['धी', 'धी', 'ना'] },
      { mark: '0', bols: ['ती', 'ना'] },
      { mark: '3', bols: ['धी', 'धी', 'ना'] },
    ],
  },
  {
    id: 'ektaal',
    names: { mr: 'एकताल', en: 'Ektaal', hi: 'एकताल' },
    usedFor: ['khayal'],
    vibhags: [
      { mark: 'X', bols: ['धिं', 'धिं'] },
      { mark: '0', bols: ['धागे', 'तिरकिट'] },
      { mark: '2', bols: ['तू', 'ना'] },
      { mark: '0', bols: ['क', 'त्ता'] },
      { mark: '3', bols: ['धागे', 'तिरकिट'] },
      { mark: '4', bols: ['धी', 'ना'] },
    ],
  },
  {
    id: 'chautaal',
    names: { mr: 'चौताल', en: 'Chautaal', hi: 'चौताल' },
    usedFor: ['dhrupad'],
    vibhags: [
      { mark: 'X', bols: ['धा', 'धा'] },
      { mark: '0', bols: ['दिं', 'ता'] },
      { mark: '2', bols: ['किट', 'धा'] },
      { mark: '0', bols: ['दिं', 'ता'] },
      { mark: '3', bols: ['तिट', 'कत'] },
      { mark: '4', bols: ['गदि', 'गन'] },
    ],
  },
  {
    id: 'ada-chautaal',
    names: { mr: 'आडा चौताल', en: 'Ada Chautaal', hi: 'आड़ा चौताल' },
    usedFor: ['khayal'],
    vibhags: [
      { mark: 'X', bols: ['धी', 'त्रक'] },
      { mark: '2', bols: ['धी', 'ना'] },
      { mark: '0', bols: ['तू', 'ना'] },
      { mark: '3', bols: ['क', 'त्ता'] },
      { mark: '0', bols: ['त्रक', 'धी'] },
      { mark: '4', bols: ['ना', 'धी'] },
      { mark: '0', bols: ['धी', 'ना'] },
    ],
  },
  {
    id: 'deepchandi',
    names: { mr: 'दीपचंदी', en: 'Deepchandi', hi: 'दीपचंदी' },
    usedFor: ['thumri', 'light'],
    vibhags: [
      { mark: 'X', bols: ['धा', 'धिं', 'ऽ'] },
      { mark: '2', bols: ['धा', 'धा', 'तिं', 'ऽ'] },
      { mark: '0', bols: ['ता', 'तिं', 'ऽ'] },
      { mark: '3', bols: ['धा', 'धा', 'धिं', 'ऽ'] },
    ],
  },
  {
    id: 'dhamaar',
    names: { mr: 'धमार', en: 'Dhamaar', hi: 'धमार' },
    usedFor: ['dhrupad'],
    vibhags: [
      { mark: 'X', bols: ['क', 'धि', 'ट', 'धि', 'ट'] },
      { mark: '2', bols: ['धा', 'ऽ'] },
      { mark: '0', bols: ['ग', 'ति', 'ट'] },
      { mark: '3', bols: ['ति', 'ट', 'ता', 'ऽ'] },
    ],
  },
  {
    id: 'jhoomra',
    names: { mr: 'झूमरा', en: 'Jhoomra', hi: 'झूमरा' },
    usedFor: ['khayal'],
    vibhags: [
      { mark: 'X', bols: ['धिं', 'ऽधा', 'तिरकिट'] },
      { mark: '2', bols: ['धिं', 'धिं', 'धागे', 'तिरकिट'] },
      { mark: '0', bols: ['तिं', 'ऽता', 'तिरकिट'] },
      { mark: '3', bols: ['धिं', 'धिं', 'धागे', 'तिरकिट'] },
    ],
  },
  {
    id: 'pancham-sawari',
    names: { mr: 'पंचम सवारी', en: 'Pancham Sawari', hi: 'पंचम सवारी' },
    usedFor: ['instrumental'],
    vibhags: [
      { mark: 'X', bols: ['धिं', 'ना', 'धिंधिं'] },
      { mark: '2', bols: ['क', 'धिंधिं', 'नाधिं', 'धिंना'] },
      { mark: '0', bols: ['ति', 'तिना', 'तक', 'तिना'] },
      { mark: '3', bols: ['क', 'धिंधिं', 'नाधिं', 'धिंना'] },
    ],
  },
  {
    id: 'addha',
    names: { mr: 'अद्धा', en: 'Addha', hi: 'अद्धा' },
    usedFor: ['thumri', 'light'],
    vibhags: [
      { mark: 'X', bols: ['धा', 'धिं', 'ऽधा', 'धा'] },
      { mark: '2', bols: ['धा', 'धिं', 'ऽधा', 'धा'] },
      { mark: '0', bols: ['धा', 'तिं', 'ऽता', 'ता'] },
      { mark: '3', bols: ['ता', 'धिं', 'ऽधा', 'धा'] },
    ],
  },
  {
    id: 'teentaal',
    names: { mr: 'त्रिताल', en: 'Teentaal', hi: 'तीनताल' },
    usedFor: ['khayal', 'instrumental'],
    vibhags: [
      { mark: 'X', bols: ['धा', 'धिं', 'धिं', 'धा'] },
      { mark: '2', bols: ['धा', 'धिं', 'धिं', 'धा'] },
      { mark: '0', bols: ['धा', 'तिं', 'तिं', 'ता'] },
      { mark: '3', bols: ['ता', 'धिं', 'धिं', 'धा'] },
    ],
  },
  {
    id: 'tilwada',
    names: { mr: 'तिलवाडा', en: 'Tilwada', hi: 'तिलवाड़ा' },
    usedFor: ['khayal'],
    vibhags: [
      { mark: 'X', bols: ['धा', 'तिरकिट', 'धिं', 'धिं'] },
      { mark: '2', bols: ['धा', 'धा', 'तिं', 'तिं'] },
      { mark: '0', bols: ['ता', 'तिरकिट', 'धिं', 'धिं'] },
      { mark: '3', bols: ['धा', 'धा', 'धिं', 'धिं'] },
    ],
  },
]

// Helpers --------------------------------------------------------------

export const matraCount = (taal) => taal.vibhags.reduce((sum, v) => sum + v.bols.length, 0)
