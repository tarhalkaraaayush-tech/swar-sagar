// Every piece of UI text, in the priority order Marathi → English → Hindi.
// Components never hard-code text; they call t('key') from useLanguage().

export const LANGUAGES = [
  { code: 'mr', label: 'मराठी' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
]

export const strings = {
  siteName:      { mr: 'स्वरसागर', en: 'Swar Sagar', hi: 'स्वरसागर' },
  navHome:       { mr: 'मुखपृष्ठ', en: 'Home', hi: 'मुखपृष्ठ' },
  navRagas:      { mr: 'राग', en: 'Ragas', hi: 'राग' },
  navTaals:      { mr: 'ताल', en: 'Taals', hi: 'ताल' },
  navCompositions: { mr: 'बंदिशी', en: 'Compositions', hi: 'बंदिशें' },
  navClassroom:  { mr: 'वर्ग', en: 'Classroom', hi: 'कक्षा' },

  heroTagline: {
    mr: 'हिंदुस्थानी शास्त्रीय संगीताचा सागर — राग, ताल आणि बंदिशी एका ठिकाणी.',
    en: 'An ocean of Hindustani classical music — ragas, taals and compositions in one place.',
    hi: 'हिंदुस्तानी शास्त्रीय संगीत का सागर — राग, ताल और बंदिशें एक जगह।',
  },
  exploreRagas:  { mr: 'राग पहा', en: 'Explore ragas', hi: 'राग देखें' },
  comingSoon:    { mr: 'लवकरच येत आहे', en: 'Coming soon', hi: 'जल्द आ रहा है' },

  // filters
  search:        { mr: 'राग शोधा…', en: 'Search ragas…', hi: 'राग खोजें…' },
  thaat:         { mr: 'थाट', en: 'Thaat', hi: 'थाट' },
  jaati:         { mr: 'जाती', en: 'Jaati', hi: 'जाति' },
  time:          { mr: 'वेळ', en: 'Time', hi: 'समय' },
  all:           { mr: 'सर्व', en: 'All', hi: 'सभी' },
  clearFilters:  { mr: 'फिल्टर काढा', en: 'Clear filters', hi: 'फ़िल्टर हटाएँ' },
  noResults:     { mr: 'कोणताही राग सापडला नाही.', en: 'No ragas match these filters.', hi: 'कोई राग नहीं मिला।' },
  ragaCount:     { mr: 'राग', en: 'ragas', hi: 'राग' },

  // raga details
  aaroh:         { mr: 'आरोह', en: 'Aaroh', hi: 'आरोह' },
  avroh:         { mr: 'अवरोह', en: 'Avroh', hi: 'अवरोह' },
  pakad:         { mr: 'पकड', en: 'Pakad', hi: 'पकड़' },
  vadi:          { mr: 'वादी', en: 'Vadi', hi: 'वादी' },
  samvadi:       { mr: 'संवादी', en: 'Samvadi', hi: 'संवादी' },
  close:         { mr: 'बंद करा', en: 'Close', hi: 'बंद करें' },

  // taals
  matras:        { mr: 'मात्रा', en: 'matras', hi: 'मात्राएँ' },
  vibhags:       { mr: 'विभाग', en: 'vibhags', hi: 'विभाग' },
  theka:         { mr: 'ठेका', en: 'Theka', hi: 'ठेका' },
  allTaals:      { mr: '← सर्व ताल', en: '← All taals', hi: '← सभी ताल' },
  sam:           { mr: 'सम', en: 'Sam', hi: 'सम' },
  tali:          { mr: 'टाळी', en: 'Tali', hi: 'ताली' },
  khali:         { mr: 'खाली', en: 'Khali', hi: 'ख़ाली' },
  usedIn:        { mr: 'वापर', en: 'Used in', hi: 'प्रयोग' },

  // settings
  notation:      { mr: 'स्वरलिपी', en: 'Notation', hi: 'स्वरलिपि' },
  bhatkhande:    { mr: 'भातखंडे', en: 'Bhatkhande', hi: 'भातखंडे' },
  paluskar:      { mr: 'पलुस्कर', en: 'Paluskar', hi: 'पलुस्कर' },
}

// Labels for the values stored in the data files (thaat, jaati, time).
export const valueLabels = {
  thaat: {
    bilawal: { mr: 'बिलावल', en: 'Bilawal', hi: 'बिलावल' },
    kalyan:  { mr: 'कल्याण', en: 'Kalyan', hi: 'कल्याण' },
    khamaj:  { mr: 'खमाज', en: 'Khamaj', hi: 'खमाज' },
    kafi:    { mr: 'काफी', en: 'Kafi', hi: 'काफ़ी' },
    asavari: { mr: 'आसावरी', en: 'Asavari', hi: 'आसावरी' },
    bhairav: { mr: 'भैरव', en: 'Bhairav', hi: 'भैरव' },
    bhairavi:{ mr: 'भैरवी', en: 'Bhairavi', hi: 'भैरवी' },
    poorvi:  { mr: 'पूर्वी', en: 'Poorvi', hi: 'पूर्वी' },
    marwa:   { mr: 'मारवा', en: 'Marwa', hi: 'मारवा' },
    todi:    { mr: 'तोडी', en: 'Todi', hi: 'तोड़ी' },
  },
  // single words; compound jaatis like "audav-sampoorna" are built from these
  jaati: {
    audav:     { mr: 'औडव', en: 'Audav', hi: 'औडव' },
    shadav:    { mr: 'षाडव', en: 'Shadav', hi: 'षाडव' },
    sampoorna: { mr: 'संपूर्ण', en: 'Sampoorna', hi: 'संपूर्ण' },
  },
  usedFor: {
    khayal:       { mr: 'ख्याल', en: 'Khayal', hi: 'ख़याल' },
    dhrupad:      { mr: 'ध्रुपद-धमार', en: 'Dhrupad-Dhamar', hi: 'ध्रुपद-धमार' },
    thumri:       { mr: 'ठुमरी', en: 'Thumri', hi: 'ठुमरी' },
    light:        { mr: 'उपशास्त्रीय / भजन', en: 'Light classical / bhajan', hi: 'उपशास्त्रीय / भजन' },
    instrumental: { mr: 'वाद्यसंगीत', en: 'Instrumental', hi: 'वाद्य संगीत' },
  },
  time: {
    'morning':   { mr: 'सकाळ', en: 'Morning', hi: 'सुबह' },
    'afternoon': { mr: 'दुपार', en: 'Afternoon', hi: 'दोपहर' },
    'evening':   { mr: 'संध्याकाळ', en: 'Evening', hi: 'शाम' },
    'night':     { mr: 'रात्र', en: 'Night', hi: 'रात' },
    'late-night':{ mr: 'मध्यरात्र', en: 'Late night', hi: 'मध्यरात्रि' },
    'any':       { mr: 'कोणत्याही वेळी', en: 'Any time', hi: 'किसी भी समय' },
  },
}
