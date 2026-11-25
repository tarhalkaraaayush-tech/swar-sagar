import { useLanguage } from '../context/LanguageContext'

// Placeholder for sections we haven't built yet (Taals, Compositions, Classroom).
export default function ComingSoonPage({ titleKey }) {
  const { t } = useLanguage()
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="font-display text-5xl text-gold">{t(titleKey)}</h1>
      <p className="mt-4 text-mist">{t('comingSoon')}</p>
    </section>
  )
}
