import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../lib/supabase'
import { Button, ErrorText, Field, Page, Panel } from '../../components/ui'

// Lists the classes you teach and the classes you're in,
// plus forms to create a class or join one with a code.
export default function ClassroomPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [teaching, setTeaching] = useState(null)
  const [enrolled, setEnrolled] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    // Two queries run in parallel; Promise.all waits for both.
    const [mine, joined] = await Promise.all([
      supabase.from('classes').select('*').eq('teacher_id', user.id).order('created_at'),
      // "classes(*, profiles(display_name))" follows the foreign keys:
      // class_members → classes → profiles (the teacher), all in one request.
      supabase.from('class_members').select('classes(*, profiles(display_name))').eq('student_id', user.id),
    ])
    if (mine.error || joined.error) return setError((mine.error ?? joined.error).message)
    setTeaching(mine.data)
    setEnrolled(joined.data.map((row) => row.classes))
  }, [user.id])

  useEffect(() => { load() }, [load])

  return (
    <Page title={t('myClasses')}>
      <ErrorText>{error}</ErrorText>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
          <ClassList title={t('teaching')} classes={teaching} showCode />
          <ClassList title={t('enrolled')} classes={enrolled} />
        </div>

        <div className="flex flex-col gap-6">
          <CreateClass onCreated={(id) => navigate(`/classroom/${id}`)} />
          <JoinClass onJoined={(id) => navigate(`/classroom/${id}`)} />
        </div>
      </div>
    </Page>
  )
}

function ClassList({ title, classes, showCode }) {
  const { t } = useLanguage()
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl text-gold-soft">{title}</h2>
      {classes === null ? (
        <p className="text-mist">{t('loading')}</p>
      ) : classes.length === 0 ? (
        <p className="text-mist">{t('noClasses')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((c) => (
            <Link key={c.id} to={`/classroom/${c.id}`}
              className="rounded-xl border border-gold/15 bg-stage p-4 transition hover:border-gold/50 hover:bg-curtain">
              <p className="font-display text-xl text-gold-soft">{c.name}</p>
              {c.profiles && <p className="text-sm text-mist">{t('teacher')}: {c.profiles.display_name}</p>}
              {showCode && <p className="mt-1 font-mono text-sm tracking-widest text-gold">{c.join_code}</p>}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function CreateClass({ onCreated }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    // teacher_id defaults to the signed-in user in the database.
    // .select().single() asks Supabase to send back the new row (we need its id).
    const { data, error } = await supabase
      .from('classes')
      .insert({ name: name.trim(), description })
      .select()
      .single()
    if (error) return setError(error.message)
    onCreated(data.id)
  }

  return (
    <Panel>
      <h2 className="mb-4 font-display text-xl text-gold-soft">{t('createClass')}</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label={t('className')} value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
        <Field as="textarea" rows={2} label={`${t('description')} ${t('optional')}`} value={description}
          onChange={(e) => setDescription(e.target.value)} />
        <ErrorText>{error}</ErrorText>
        <Button type="submit">{t('create')}</Button>
      </form>
    </Panel>
  )
}

function JoinClass({ onJoined }) {
  const { t } = useLanguage()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    // .rpc() calls a Postgres function — join_class() in schema.sql.
    const { data, error } = await supabase.rpc('join_class', { code })
    if (error) return setError(error.message)
    onJoined(data)
  }

  return (
    <Panel>
      <h2 className="mb-4 font-display text-xl text-gold-soft">{t('joinClass')}</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label={t('joinCode')} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
          required maxLength={6} className="font-mono tracking-widest" placeholder="ABC123" />
        <ErrorText>{error}</ErrorText>
        <Button type="submit">{t('join')}</Button>
      </form>
    </Panel>
  )
}
