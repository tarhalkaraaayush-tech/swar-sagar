import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase, SUBMISSIONS_BUCKET } from '../../lib/supabase'
import { ragas } from '../../data/ragas'
import { taals } from '../../data/taals'
import AudioRecorder from '../../components/AudioRecorder'
import { BackLink, Button, ErrorText, Field, Page, Panel, useFormatDate } from '../../components/ui'

export default function AssignmentPage() {
  const { classId, assignmentId } = useParams()
  const { t, name } = useLanguage()
  const { user } = useAuth()
  const formatDate = useFormatDate()

  const [assignment, setAssignment] = useState(null)
  const [cls, setCls] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const [a, c] = await Promise.all([
        supabase.from('assignments').select('*').eq('id', assignmentId).maybeSingle(),
        supabase.from('classes').select('id, name, teacher_id').eq('id', classId).maybeSingle(),
      ])
      if (a.error || c.error) return setError((a.error ?? c.error).message)
      if (!a.data || !c.data) return setError('notFound')
      setAssignment(a.data)
      setCls(c.data)
    })()
  }, [assignmentId, classId])

  const back = <BackLink to={`/classroom/${classId}`}>{t('backToClass')}</BackLink>
  if (error) return <Page back={back}><ErrorText>{error === 'notFound' ? t('notFound') : error}</ErrorText></Page>
  if (!assignment) return <Page><p className="text-mist">{t('loading')}</p></Page>

  const isTeacher = cls.teacher_id === user.id
  const raga = ragas.find((r) => r.id === assignment.raga_id)
  const taal = taals.find((x) => x.id === assignment.taal_id)

  return (
    <Page back={back}>
      <p className="text-sm text-mist">{cls.name}</p>
      <h1 className="font-display text-4xl text-gold">{assignment.title}</h1>
      <p className="mt-2 flex flex-wrap gap-2 text-sm">
        {raga && <span className="rounded-full bg-gold/15 px-3 py-0.5 text-gold-soft">{name(raga.names)}</span>}
        {taal && <span className="rounded-full bg-ivory/10 px-3 py-0.5">{name(taal.names)}</span>}
        {assignment.due_at && <span className="text-mist">{t('dueDate')}: {formatDate(assignment.due_at)}</span>}
      </p>
      {assignment.instructions && (
        <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-ivory/90">{assignment.instructions}</p>
      )}

      <div className="mt-8">
        {isTeacher
          ? <TeacherView assignment={assignment} />
          : <StudentView assignment={assignment} classId={classId} userId={user.id} />}
      </div>
    </Page>
  )
}

// Recordings are in a *private* bucket, so there's no public link.
// createSignedUrl makes a temporary link (here: 1 hour) — and Supabase only
// makes one if the storage policies say this user may read the file.
function Recording({ path }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    supabase.storage.from(SUBMISSIONS_BUCKET).createSignedUrl(path, 3600)
      .then(({ data }) => setUrl(data?.signedUrl ?? ''))
  }, [path])
  return url ? <audio controls src={url} className="w-full max-w-md" /> : null
}

// ------------------------------------------------------------------ student
function StudentView({ assignment, classId, userId }) {
  const { t } = useLanguage()
  const formatDate = useFormatDate()
  const [mine, setMine] = useState(undefined) // undefined = loading, null = none yet
  const [audio, setAudio] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('submissions').select('*')
      .eq('assignment_id', assignment.id).eq('student_id', userId).maybeSingle()
    setMine(data)
    setNote(data?.note ?? '')
  }, [assignment.id, userId])

  useEffect(() => { load() }, [load])

  async function submit() {
    setBusy(true)
    setError('')

    // 1) Upload the audio. The folder layout is what the storage policies check:
    //    <class>/<assignment>/<student>/<timestamp>.<ext>
    const type = audio.type || 'audio/webm'
    const ext = /mp4|m4a|aac/.test(type) ? 'm4a' : type.includes('ogg') ? 'ogg' : type.includes('mpeg') ? 'mp3'
      : type.includes('wav') ? 'wav' : 'webm'
    const path = `${classId}/${assignment.id}/${userId}/${Date.now()}.${ext}`
    const upload = await supabase.storage.from(SUBMISSIONS_BUCKET).upload(path, audio, { contentType: type })
    if (upload.error) {
      setBusy(false)
      return setError(upload.error.message)
    }

    // 2) Save (or replace) the submission row that points at the file.
    const { error } = mine
      ? await supabase.from('submissions').update({ audio_path: path, note }).eq('id', mine.id)
      : await supabase.from('submissions').insert({ assignment_id: assignment.id, audio_path: path, note })

    if (error) {
      await supabase.storage.from(SUBMISSIONS_BUCKET).remove([path]) // don't leave an orphan file
      setBusy(false)
      return setError(error.message)
    }

    // 3) A re-submission replaces the old file, so delete it.
    if (mine) await supabase.storage.from(SUBMISSIONS_BUCKET).remove([mine.audio_path])

    setBusy(false)
    setAudio(null)
    load()
  }

  if (mine === undefined) return <p className="text-mist">{t('loading')}</p>

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {mine && (
        <Panel>
          <h2 className="mb-3 font-display text-2xl text-gold-soft">{t('yourSubmission')}</h2>
          <p className="mb-3 text-sm text-mist">{t('submitted')}: {formatDate(mine.submitted_at)}</p>
          <Recording path={mine.audio_path} />
          {mine.note && <p className="mt-3 whitespace-pre-line text-sm text-ivory/85">{mine.note}</p>}
          {mine.feedback && (
            <div className="mt-4 rounded-lg border border-gold/30 bg-gold/10 p-4">
              <p className="text-sm text-gold">{t('feedback')}</p>
              <p className="whitespace-pre-line">{mine.feedback}</p>
            </div>
          )}
        </Panel>
      )}

      <Panel>
        <h2 className="mb-3 font-display text-2xl text-gold-soft">{mine ? t('resubmit') : t('submitRecording')}</h2>
        {mine && <p className="mb-3 text-sm text-mist">{t('resubmitHint')}</p>}
        <div className="flex flex-col gap-4">
          <AudioRecorder onChange={setAudio} />
          <Field as="textarea" rows={2} label={`${t('noteToTeacher')} ${t('optional')}`} value={note}
            onChange={(e) => setNote(e.target.value)} />
          <ErrorText>{error}</ErrorText>
          <Button onClick={submit} disabled={!audio || busy}>
            {busy ? t('uploading') : mine ? t('resubmit') : t('submitRecording')}
          </Button>
        </div>
      </Panel>
    </div>
  )
}

// ------------------------------------------------------------------ teacher
function TeacherView({ assignment }) {
  const { t } = useLanguage()
  const [roster, setRoster] = useState(null)
  const [subs, setSubs] = useState([])

  const load = useCallback(async () => {
    const [m, s] = await Promise.all([
      supabase.from('class_members').select('student_id, profiles(display_name)').eq('class_id', assignment.class_id),
      supabase.from('submissions').select('*').eq('assignment_id', assignment.id),
    ])
    setRoster(m.data ?? [])
    setSubs(s.data ?? [])
  }, [assignment.class_id, assignment.id])

  useEffect(() => { load() }, [load])

  if (roster === null) return <p className="text-mist">{t('loading')}</p>

  return (
    <section>
      <h2 className="mb-3 font-display text-2xl text-gold-soft">
        {t('submissions')} ({subs.length}/{roster.length})
      </h2>
      {roster.length === 0 && <p className="text-mist">{t('noStudents')}</p>}
      <div className="flex flex-col gap-4">
        {roster.map((m) => (
          <StudentSubmission
            key={m.student_id}
            studentName={m.profiles?.display_name}
            submission={subs.find((s) => s.student_id === m.student_id)}
            onSaved={load}
          />
        ))}
      </div>
    </section>
  )
}

function StudentSubmission({ studentName, submission, onSaved }) {
  const { t } = useLanguage()
  const formatDate = useFormatDate()
  const [feedback, setFeedback] = useState(submission?.feedback ?? '')
  const [error, setError] = useState('')

  async function send(e) {
    e.preventDefault()
    // The database trigger only lets the teacher change feedback (and stamps reviewed_at).
    const { error } = await supabase.from('submissions').update({ feedback }).eq('id', submission.id)
    if (error) return setError(error.message)
    setError('')
    onSaved()
  }

  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-xl">{studentName}</p>
        <span className={`rounded-full px-3 py-0.5 text-sm ${submission ? 'bg-gold/15 text-gold-soft' : 'bg-ivory/10 text-mist'}`}>
          {!submission ? t('notSubmitted') : submission.reviewed_at ? t('reviewed') : t('submitted')}
        </span>
      </div>
      {submission && (
        <>
          <p className="text-sm text-mist">{formatDate(submission.submitted_at)}</p>
          <Recording path={submission.audio_path} />
          {submission.note && <p className="whitespace-pre-line text-sm text-ivory/85">{submission.note}</p>}
          <form onSubmit={send} className="flex flex-col gap-2">
            <Field as="textarea" rows={2} label={t('feedback')} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            <ErrorText>{error}</ErrorText>
            <Button type="submit" className="self-start">{t('sendFeedback')}</Button>
          </form>
        </>
      )}
    </Panel>
  )
}
