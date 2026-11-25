// Swara notation used throughout Swar Sagar:
//   Uppercase  S R G M P D N  → shuddha
//   Lowercase  r g d n        → komal
//   Lowercase  m              → tivra Ma
//   Suffix  '  → mandra saptak (lower octave)   e.g. N'
//   Suffix  "  → taar saptak  (upper octave)    e.g. S"
// Swaras are separated by spaces; a comma marks a short phrase break.

export const ragas = [
  {
    id: 'yaman',
    names: { mr: 'यमन', en: 'Yaman', hi: 'यमन' },
    thaat: 'kalyan',
    jaati: 'sampoorna-sampoorna',
    time: 'night',
    vadi: 'G',
    samvadi: 'N',
    aaroh: "N' R G m D N S\"",
    avroh: "S\" N D P m G R S",
    pakad: "N' R G R, P' R N' R S",
    description: {
      mr: 'कल्याण थाटाचा आश्रय राग. तीव्र मध्यम हे याचे वैशिष्ट्य; रात्रीच्या पहिल्या प्रहरी गायला जातो.',
      en: 'The defining raga of Kalyan thaat, built around tivra Ma. Sung in the first part of the night.',
      hi: 'कल्याण थाट का आश्रय राग, तीव्र मध्यम इसकी पहचान है। रात के पहले प्रहर में गाया जाता है।',
    },
  },
  {
    id: 'bhoopali',
    names: { mr: 'भूपाळी', en: 'Bhoopali', hi: 'भूपाली' },
    thaat: 'kalyan',
    jaati: 'audav-audav',
    time: 'night',
    vadi: 'G',
    samvadi: 'D',
    aaroh: 'S R G P D S"',
    avroh: 'S" D P G R S',
    pakad: "G R S D', S R G, P G, D P G R S",
    description: {
      mr: 'म आणि नि वर्ज्य असलेला पंचस्वरी (पेंटाटोनिक) राग. शांत, प्रसन्न भाव.',
      en: 'A pentatonic raga that omits Ma and Ni, with a calm, serene mood.',
      hi: 'म और नि वर्जित पाँच स्वरों का राग, शांत और प्रसन्न भाव।',
    },
  },
  {
    id: 'kafi',
    names: { mr: 'काफी', en: 'Kafi', hi: 'काफ़ी' },
    thaat: 'kafi',
    jaati: 'sampoorna-sampoorna',
    time: 'late-night',
    vadi: 'P',
    samvadi: 'S',
    aaroh: 'S R g M P D n S"',
    avroh: 'S" n D P M g R S',
    pakad: 'S S R R g g M M P',
    description: {
      mr: 'कोमल ग आणि कोमल नि असलेला राग. होरी, ठुमरी आणि लोकसंगीतात खूप वापरला जातो.',
      en: 'Uses komal Ga and komal Ni. Very common in hori, thumri and folk-inspired music.',
      hi: 'कोमल ग और कोमल नि वाला राग; होरी, ठुमरी और लोकसंगीत में बहुत प्रचलित।',
    },
  },
  {
    id: 'des',
    names: { mr: 'देस', en: 'Des', hi: 'देस' },
    thaat: 'khamaj',
    jaati: 'audav-sampoorna',
    time: 'night',
    vadi: 'R',
    samvadi: 'P',
    aaroh: 'S R M P N S"',
    avroh: "S\" n D P M G R G N' S",
    pakad: 'R M P N S", R" n D P, M G R G S',
    description: {
      mr: 'आरोहात शुद्ध नि, अवरोहात कोमल नि. पावसाळी, रोमँटिक भावासाठी प्रसिद्ध.',
      en: 'Shuddha Ni going up, komal Ni coming down. Known for its romantic, monsoon feel.',
      hi: 'आरोह में शुद्ध नि, अवरोह में कोमल नि। वर्षा ऋतु और श्रृंगार भाव के लिए प्रसिद्ध।',
    },
  },
]
