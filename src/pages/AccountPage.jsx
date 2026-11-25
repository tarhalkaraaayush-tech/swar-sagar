import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import { Button, ErrorText, Field, Page, Panel } from '../components/ui'

const ROLE_KEY = { user: 'roleUser', moderator: 'roleModerator', admin: 'roleAdmin' }

// The profile loads a moment after sign-in. Rendering the form only once it
// exists means the name box starts with the real name, not an empty string.
export default function AccountPage() {
  const { t } = useLanguage()
  const { profile } = useAuth()
  if (!profile) return <Page><p className="text-mist">{t('loading')}</p></Page>
  return <AccountForm profile={profile} />
}

function AccountForm({ profile }) {
  const { t } = useLanguage()
  const { user, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile.display_name)
  const [status, setStatus] = useState('') // '', 'saved', or an error message

  async function save(e) {
    e.preventDefault()
    // The database only lets users change display_name on their own row.
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() })
      .eq('id', user.id)
    if (error) return setStatus(error.message)
    await refreshProfile()
    setStatus('saved')
  }

  return (
    <Page title={t('account')}>
      <Panel className="max-w-lg">
        <form onSubmit={save} className="flex flex-col gap-4">
          <p className="text-sm text-mist">{t('email')}: <span className="text-ivory">{user.email}</span></p>
          <p className="text-sm text-mist">
            {t('role')}: <span className="text-gold">{t(ROLE_KEY[profile.role])}</span>
          </p>
          <Field label={t('displayName')} value={name} maxLength={80} required
            onChange={(e) => { setName(e.target.value); setStatus('') }} />
          {status === 'saved' ? <p className="text-sm text-gold">{t('saved')}</p> : <ErrorText>{status}</ErrorText>}
          <div className="flex gap-3">
            <Button type="submit">{t('save')}</Button>
            <Button type="button" variant="ghost" onClick={async () => { await signOut(); navigate('/') }}>
              {t('signOut')}
            </Button>
          </div>
        </form>
      </Panel>
    </Page>
  )
}
