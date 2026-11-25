import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { Button, ErrorText, Field, NotConfigured, Page, Panel } from '../components/ui'

export default function LoginPage() {
  const { t } = useLanguage()
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const goTo = location.state?.from ?? '/classroom' // where RequireAuth sent us from

  const [mode, setMode] = useState('signIn') // 'signIn' | 'signUp'
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isSupabaseConfigured) return <Page title={t('signIn')}><NotConfigured /></Page>
  if (user) return <Navigate to={goTo} replace />

  // One handler for every input: the input's `name` says which field to update.
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser's default full-page form submit
    setError('')
    setInfo('')
    setBusy(true)
    const { data, error } =
      mode === 'signIn'
        ? await signIn(form.email, form.password)
        : await signUp(form.email, form.password, form.displayName.trim())
    setBusy(false)

    if (error) return setError(error.message)
    // If email confirmation is on in Supabase, sign-up returns no session yet.
    if (mode === 'signUp' && !data.session) return setInfo(t('checkEmail'))
    navigate(goTo, { replace: true })
  }

  return (
    <Page>
      <Panel className="mx-auto max-w-md">
        <h1 className="mb-6 font-display text-3xl text-gold">{t(mode)}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signUp' && (
            <Field label={t('displayName')} name="displayName" value={form.displayName}
              onChange={update} required maxLength={80} autoComplete="name" />
          )}
          <Field label={t('email')} name="email" type="email" value={form.email}
            onChange={update} required autoComplete="email" />
          <Field label={t('password')} name="password" type="password" value={form.password}
            onChange={update} required minLength={6}
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} />

          <ErrorText>{error}</ErrorText>
          {info && <p className="rounded-md bg-gold/15 px-3 py-2 text-sm text-gold-soft">{info}</p>}

          <Button type="submit" disabled={busy}>{busy ? t('loading') : t(mode)}</Button>
        </form>

        <button
          onClick={() => { setMode(mode === 'signIn' ? 'signUp' : 'signIn'); setError(''); setInfo('') }}
          className="mt-4 w-full text-center text-sm text-gold hover:text-gold-soft"
        >
          {mode === 'signIn' ? t('needAccount') : t('haveAccount')}
        </button>
      </Panel>
    </Page>
  )
}
