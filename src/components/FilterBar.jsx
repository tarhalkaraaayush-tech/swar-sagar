import { useLanguage } from '../context/LanguageContext'

// The parent (RagasPage) owns the filter state; FilterBar just shows it
// and reports changes back up through onChange. This is "lifting state up".
export default function FilterBar({ filters, options, onChange, onClear }) {
  const { t, label } = useLanguage()

  const select = (field) => (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-mist">{t(field)}</span>
      <select
        value={filters[field]}
        onChange={(e) => onChange({ ...filters, [field]: e.target.value })}
        className="rounded-md border border-gold/25 bg-stage px-3 py-2 text-ivory"
      >
        <option value="">{t('all')}</option>
        {options[field].map((v) => (
          <option key={v} value={v}>{label(field, v)}</option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="grid gap-3 rounded-xl border border-gold/15 bg-stage/60 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
      <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-1">
        <span className="sr-only">{t('search')}</span>
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder={t('search')}
          className="rounded-md border border-gold/25 bg-stage px-3 py-2 text-ivory placeholder:text-mist"
        />
      </label>
      {select('thaat')}
      {select('jaati')}
      {select('time')}
      <button onClick={onClear} className="rounded-md px-3 py-2 text-sm text-gold hover:bg-gold/10">
        {t('clearFilters')}
      </button>
    </div>
  )
}
