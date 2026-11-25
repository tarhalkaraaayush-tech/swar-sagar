import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { ragas } from '../data/ragas'
import { taals } from '../data/taals'
import { Button, ErrorText, Field } from './ui'

const LAYAS = ['vilambit', 'madhya', 'drut']
const LAYA_LABEL = {
  vilambit: { mr: 'विलंबित', en: 'Vilambit', hi: 'विलंबित' },
  madhya: { mr: 'मध्य', en: 'Madhya', hi: 'मध्य' },
  drut: { mr: 'द्रुत', en: 'Drut', hi: 'द्रुत' },
}
export const layaLabel = (laya, lang) => LAYA_LABEL[laya]?.[lang] ?? ''

const EMPTY = { title: '', raga_id: 'yaman', taal_id: 'teentaal', laya: '', composer: '', sthayi: '', antara: '', notes: '' }

// Used for both "new" (initial = null) and "edit" (initial = existing row).
// onSave receives the cleaned values and returns a Supabase { error }.
export default function CompositionForm({ initial, onSave, onCancel }) {
  const { t, lang, name } = useLanguage()
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial, laya: initial?.laya ?? '' }))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const values = {
      title: form.title.trim(),
      raga_id: form.raga_id,
      taal_id: form.taal_id,
      laya: form.laya || null, // empty select → NULL in the database
      composer: form.composer.trim(),
      sthayi: form.sthayi,
      antara: form.antara,
      notes: form.notes,
    }
    const { error } = await onSave(values)
    setBusy(false)
    if (error) setError(error.message)
  }

  const byName = (list) => [...list].sort((a, b) => name(a.names).localeCompare(name(b.names), lang))

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label={t('title')} name="title" value={form.title} onChange={update} required maxLength={200} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field as="select" label={t('raga')} name="raga_id" value={form.raga_id} onChange={update}>
          {byName(ragas).map((r) => <option key={r.id} value={r.id}>{name(r.names)}</option>)}
        </Field>
        <Field as="select" label={t('taal')} name="taal_id" value={form.taal_id} onChange={update}>
          {byName(taals).map((x) => <option key={x.id} value={x.id}>{name(x.names)}</option>)}
        </Field>
        <Field as="select" label={t('laya')} name="laya" value={form.laya} onChange={update}>
          <option value="">{t('none')}</option>
          {LAYAS.map((l) => <option key={l} value={l}>{layaLabel(l, lang)}</option>)}
        </Field>
      </div>
      <Field label={t('composer')} name="composer" value={form.composer} onChange={update} />
      <Field as="textarea" rows={4} label={t('sthayi')} name="sthayi" value={form.sthayi} onChange={update} />
      <Field as="textarea" rows={4} label={t('antara')} name="antara" value={form.antara} onChange={update} />
      <Field as="textarea" rows={2} label={t('notes')} name="notes" value={form.notes} onChange={update} />
      <ErrorText>{error}</ErrorText>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>{t('cancel')}</Button>
        <Button type="submit" disabled={busy}>{busy ? t('loading') : t('save')}</Button>
      </div>
    </form>
  )
}
