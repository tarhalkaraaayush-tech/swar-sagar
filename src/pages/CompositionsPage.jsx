import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { ragas } from '../data/ragas'
import { taals } from '../data/taals'
import CompositionForm, { layaLabel } from '../components/CompositionForm'
import { Button, ErrorText, Field, NotConfigured, Page, Panel } from '../components/ui'

const ragaById = Object.fromEntries(ragas.map((r) => [r.id, r]))
const taalById = Object.fromEntries(taals.map((x) => [x.id, x]))

export default function CompositionsPage() {
  const { t } = useLanguage()
  if (!isSupabaseConfigured) return <Page title={t('navCompositions')}><NotConfigured /></Page>
  return <Compositions />
}

function Compositions() {
  const { t, lang, name } = useLanguage()
  const { isModerator } = useAuth()

  const [items, setItems] = useState(null) // null = still loading
  const [error, setError] = useState('')
  const [ragaFilter, setRagaFilter] = useState('')
  // editing: null = form closed, 'new' = adding, or the composition being edited
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('compositions').select('*').order('title')
    if (error) setError(error.message)
    else setItems(data)
  }, [])

  useEffect(() => { load() }, [load])

  // The database enforces moderator-only writes; the UI just hides the buttons.
  async function save(values) {
    const query =
      editing === 'new'
        ? supabase.from('compositions').insert(values)
        : supabase.from('compositions').update(values).eq('id', editing.id)
    const { error } = await query
    if (!error) {
      setEditing(null)
      load()
    }
    return { error }
  }

  async function remove(c) {
    if (!window.confirm(t('confirmDelete'))) return
    const { error } = await supabase.from('compositions').delete().eq('id', c.id)
    if (error) setError(error.message)
    else load()
  }

  const visible = (items ?? []).filter((c) => !ragaFilter || c.raga_id === ragaFilter)
  const ragasInUse = [...new Set((items ?? []).map((c) => c.raga_id))]
    .map((id) => ragaById[id])
    .filter(Boolean)
    .sort((a, b) => name(a.names).localeCompare(name(b.names), lang))

  return (
    <Page title={t('navCompositions')}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <Field as="select" label={t('raga')} value={ragaFilter} onChange={(e) => setRagaFilter(e.target.value)} className="w-56">
          <option value="">{t('all')}</option>
          {ragasInUse.map((r) => <option key={r.id} value={r.id}>{name(r.names)}</option>)}
        </Field>
        {isModerator && !editing && <Button onClick={() => setEditing('new')}>{t('addComposition')}</Button>}
      </div>

      <ErrorText>{error}</ErrorText>

      {editing && (
        <Panel className="mb-6">
          <h2 className="mb-4 font-display text-2xl text-gold-soft">
            {editing === 'new' ? t('addComposition') : t('editComposition')}
          </h2>
          {/* key forces a fresh form when switching between compositions */}
          <CompositionForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? null : editing}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </Panel>
      )}

      {items === null ? (
        <p className="text-mist">{t('loading')}</p>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-center text-mist">{t('noCompositions')}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((c) => (
            <Panel key={c.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl text-gold-soft">{c.title}</h3>
                {isModerator && (
                  <div className="flex shrink-0 gap-1 text-sm">
                    <Button variant="ghost" className="px-3 py-1" onClick={() => setEditing(c)}>{t('edit')}</Button>
                    <Button variant="danger" className="px-3 py-1" onClick={() => remove(c)}>{t('delete')}</Button>
                  </div>
                )}
              </div>
              <p className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-gold-soft">{name(ragaById[c.raga_id]?.names) || c.raga_id}</span>
                <span className="rounded-full bg-ivory/10 px-2 py-0.5">{name(taalById[c.taal_id]?.names) || c.taal_id}</span>
                {c.laya && <span className="rounded-full bg-ivory/10 px-2 py-0.5">{layaLabel(c.laya, lang)}</span>}
              </p>
              {c.composer && <p className="text-sm text-mist">{t('composer')}: {c.composer}</p>}
              {/* whitespace-pre-line keeps the line breaks typed into the textarea */}
              {c.sthayi && <Section label={t('sthayi')} text={c.sthayi} />}
              {c.antara && <Section label={t('antara')} text={c.antara} />}
              {c.notes && <p className="whitespace-pre-line text-sm text-mist">{c.notes}</p>}
            </Panel>
          ))}
        </div>
      )}
    </Page>
  )
}

function Section({ label, text }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gold/80">{label}</p>
      <p className="whitespace-pre-line leading-relaxed">{text}</p>
    </div>
  )
}
