import { useMemo, useState } from 'react'
import { ragas } from '../data/ragas'
import { useLanguage } from '../context/LanguageContext'
import FilterBar from '../components/FilterBar'
import RagaCard from '../components/RagaCard'
import RagaModal from '../components/RagaModal'

const EMPTY_FILTERS = { query: '', thaat: '', jaati: '', time: '' }

// Build each dropdown's options from the data itself, so adding a raga
// with a new thaat automatically adds that thaat to the filter.
const unique = (field) => [...new Set(ragas.map((r) => r[field]))].sort()
const OPTIONS = { thaat: unique('thaat'), jaati: unique('jaati'), time: unique('time') }

export default function RagasPage() {
  const { t, lang, name } = useLanguage()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [openRaga, setOpenRaga] = useState(null) // null = modal closed

  // useMemo re-runs this only when `filters` or the language changes, not on every render.
  const visible = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    // localeCompare sorts in the language's own alphabet order
    // (Devanagari: अ आ इ … क ख ग …), not by raw character codes.
    const sorted = [...ragas].sort((a, b) => name(a.names).localeCompare(name(b.names), lang))
    return sorted.filter((r) => {
      // search matches any of the three names
      const matchesQuery = !q || Object.values(r.names).some((n) => n.toLowerCase().includes(q))
      return (
        matchesQuery &&
        (!filters.thaat || r.thaat === filters.thaat) &&
        (!filters.jaati || r.jaati === filters.jaati) &&
        (!filters.time || r.time === filters.time)
      )
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `name` is rebuilt every render but only depends on `lang`
  }, [filters, lang])

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-display text-4xl text-gold">{t('navRagas')}</h1>

      <FilterBar
        filters={filters}
        options={OPTIONS}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      <p className="mt-4 text-sm text-mist">
        {visible.length} {t('ragaCount')}
      </p>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-mist">{t('noResults')}</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((raga) => (
            <RagaCard key={raga.id} raga={raga} onOpen={setOpenRaga} />
          ))}
        </div>
      )}

      {openRaga && <RagaModal raga={openRaga} onClose={() => setOpenRaga(null)} />}
    </section>
  )
}
