import { Link, Navigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

// Small shared building blocks so every form and page looks the same.

export function Page({ title, children, back }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {back}
      {title && <h1 className="mb-6 font-display text-4xl text-gold">{title}</h1>}
      {children}
    </section>
  )
}

export function Panel({ children, className = '' }) {
  return <div className={`rounded-2xl border border-gold/20 bg-stage p-6 ${className}`}>{children}</div>
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-gold text-night hover:bg-gold-soft',
    ghost: 'text-gold hover:bg-gold/10',
    danger: 'text-red-300 hover:bg-red-500/15',
  }
  return (
    <button
      className={`rounded-full px-5 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

// A labelled input. Pass `as="textarea"` or `as="select"` for other controls.
export function Field({ label, as: Tag = 'input', className = '', children, ...props }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="text-mist">{label}</span>
      <Tag
        className="rounded-md border border-gold/25 bg-night/60 px-3 py-2 text-base text-ivory placeholder:text-mist/60"
        {...props}
      >
        {children}
      </Tag>
    </label>
  )
}

export function ErrorText({ children }) {
  if (!children) return null
  return <p role="alert" className="rounded-md bg-red-500/15 px-3 py-2 text-sm text-red-200">{children}</p>
}

export function BackLink({ to, children }) {
  return <Link to={to} className="mb-4 inline-block text-sm text-gold hover:text-gold-soft">{children}</Link>
}

export function NotConfigured() {
  const { t } = useLanguage()
  return <Panel className="text-center text-mist">{t('notConfigured')}</Panel>
}

// Wrap a page that needs a signed-in user. Sends visitors to /login and
// remembers where they were going, so login can send them back.
export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  if (!isSupabaseConfigured) return <Page><NotConfigured /></Page>
  if (loading) return <Page><p className="text-mist">{t('loading')}</p></Page>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

// "2026-11-24T…" → a short local date in the current language
export function useFormatDate() {
  const { lang } = useLanguage()
  const locale = { mr: 'mr-IN', en: 'en-US', hi: 'hi-IN' }[lang]
  return (iso) =>
    iso ? new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : ''
}
