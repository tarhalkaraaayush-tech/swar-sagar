import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../lib/supabase'
import { ragas } from '../../data/ragas'
import { taals } from '../../data/taals'
import { BackLink, Button, ErrorText, Field, Page, Panel, useFormatDate } from '../../components/ui'

// One class. Teachers see the join code, roster and an "add assignment" form;
// students see the assignments and whether they've submitted each one.
export default function ClassPage() {
  const { classId } = useParams()
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const formatDate = useFormatDate()

  const [cls, setCls] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([]) // RLS: teacher gets all, student gets own
  const [roster, setRoster] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data: c, error } = await supabase
      .from('classes').select('*, profiles(display_name)').eq('id', classId).maybeSingle()
    if (error) return setError(error.message)
    if (!c) return setError('notFound') // doesn't exist, or you're not in it
    setCls(c)

    const { data: a } = await supabase
      .from('assignments').select('*').eq('class_id', classId).order('created_at', { ascending: false })
    setAssignments(a ?? [])

    const ids = (a ?? []).map((x) => x.id)
    const { data: s } = ids.length
      ? await supabase.from('submissions').select('assignment_id, student_id, reviewed_at').in('assignment_id', ids)
      : { data: [] }
    setSubmissions(s ?? [])

    if (c.teacher_id === user.id) {
      const { data: m } = await supabase
        .from('class_members').select('student_id, joined_at, profiles(display_name)').eq('class_id', classId)
      setRoster(m ?? [])
    }
  }, [classId, user.id])

  useEffect(() => { load() }, [load])

  if (error) return <Page back={<BackLink to="/classroom">{t('allClasses')}</BackLink>}><ErrorText>{error === 'notFound' ? t('notFound') : error}</ErrorText></Page>
  if (!cls) return <Page><p className="text-mist">{t('loading')}</p></Page>

  const isTeacher = cls.teacher_id === user.id

  async function removeStudent(studentId) {
    await supabase.from('class_members').delete().eq('class_id', classId).eq('student_id', studentId)
    load()
  }

  async function leave() {
    if (!window.confirm(t('confirmLeave'))) return
    await supabase.from('class_members').delete().eq('class_id', classId).eq('student_id', user.id)
    navigate('/classroom')
  }

  // Status text shown next to each assignment
  function status(assignmentId) {
    const forThis = submissions.filter((s) => s.assignment_id === assignmentId)
    if (isTeacher) return `${forThis.length}/${roster.length} ${t('submitted')}`
    const mine = forThis[0]
    if (!mine) return t('notSubmitted')
    return mine.reviewed_at ? t('reviewed') : t('submitted')
  }

  return (
    <Page back={<BackLink to="/classroom">{t('allClasses')}</BackLink>}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-gold">{cls.name}</h1>
          <p className="mt-1 text-mist">{t('teacher')}: {cls.profiles?.display_name}</p>
          {cls.description && <p className="mt-2 max-w-2xl whitespace-pre-line text-ivory/85">{cls.description}</p>}
        </div>
        {isTeacher ? (
          <Panel className="text-center">
            <p className="text-sm text-mist">{t('shareCode')}</p>
            <p className="font-mono text-3xl tracking-[0.3em] text-gold">{cls.join_code}</p>
          </Panel>
        ) : (
          <Button variant="danger" onClick={leave}>{t('leaveClass')}</Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="mb-3 font-display text-2xl text-gold-soft">{t('assignments')}</h2>
          {assignments.length === 0 ? (
            <p className="text-mist">{t('noAssignments')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {assignments.map((a) => (
                <Link key={a.id} to={`/classroom/${classId}/assignments/${a.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gold/15 bg-stage p-4 transition hover:border-gold/50 hover:bg-curtain">
                  <div>
                    <p className="font-display text-xl text-gold-soft">{a.title}</p>
                    {a.due_at && <p className="text-sm text-mist">{t('dueDate')}: {formatDate(a.due_at)}</p>}
                  </div>
                  <span className="shrink-0 rounded-full bg-ivory/10 px-3 py-1 text-sm">{status(a.id)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {isTeacher && (
          <div className="flex flex-col gap-6">
            <NewAssignment classId={classId} onCreated={load} />
            <Panel>
              <h2 className="mb-3 font-display text-xl text-gold-soft">{t('students')} ({roster.length})</h2>
              {roster.length === 0 ? (
                <p className="text-sm text-mist">{t('noStudents')}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {roster.map((m) => (
                    <li key={m.student_id} className="flex items-center justify-between">
                      <span>{m.profiles?.display_name}</span>
                      <Button variant="danger" className="px-3 py-1 text-sm" onClick={() => removeStudent(m.student_id)}>
                        {t('remove')}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        )}
      </div>
    </Page>
  )
}

function NewAssignment({ classId, onCreated }) {
  const { t, lang, name } = useLanguage()
  const empty = { title: '', instructions: '', raga_id: '', taal_id: '', due_at: '' }
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const byName = (list) => [...list].sort((a, b) => name(a.names).localeCompare(name(b.names), lang))

  async function submit(e) {
    e.preventDefault()
    const { error } = await supabase.from('assignments').insert({
      class_id: classId,
      title: form.title.trim(),
      instructions: form.instructions,
      raga_id: form.raga_id || null,
      taal_id: form.taal_id || null,
      // <input type="datetime-local"> gives local time with no zone; convert to a real timestamp
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
    })
    if (error) return setError(error.message)
    setForm(empty)
    setError('')
    onCreated()
  }

  return (
    <Panel>
      <h2 className="mb-4 font-display text-xl text-gold-soft">{t('newAssignment')}</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label={t('title')} name="title" value={form.title} onChange={update} required maxLength={200} />
        <Field as="textarea" rows={3} label={t('instructions')} name="instructions" value={form.instructions} onChange={update} />
        <div className="grid grid-cols-2 gap-3">
          <Field as="select" label={`${t('raga')} ${t('optional')}`} name="raga_id" value={form.raga_id} onChange={update}>
            <option value="">{t('none')}</option>
            {byName(ragas).map((r) => <option key={r.id} value={r.id}>{name(r.names)}</option>)}
          </Field>
          <Field as="select" label={`${t('taal')} ${t('optional')}`} name="taal_id" value={form.taal_id} onChange={update}>
            <option value="">{t('none')}</option>
            {byName(taals).map((x) => <option key={x.id} value={x.id}>{name(x.names)}</option>)}
          </Field>
        </div>
        <Field type="datetime-local" label={`${t('dueDate')} ${t('optional')}`} name="due_at" value={form.due_at} onChange={update} />
        <ErrorText>{error}</ErrorText>
        <Button type="submit">{t('create')}</Button>
      </form>
    </Panel>
  )
}
