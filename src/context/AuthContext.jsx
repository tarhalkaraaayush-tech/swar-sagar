import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Holds who is signed in, and their profile row (display name + role).
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [loading, setLoading] = useState(Boolean(supabase)) // nothing to load if not configured

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data ?? null)
    setProfileError(error ? error.message : '')
  }, [])

  useEffect(() => {
    if (!supabase) return

    // 1) Is someone already signed in from a previous visit?
    // finally() makes sure "loading" ends even if something goes wrong.
    supabase.auth.getSession()
      .then(async ({ data }) => {
        setSession(data.session)
        await loadProfile(data.session?.user.id)
      })
      .catch((err) => console.error('Auth start-up failed:', err))
      .finally(() => setLoading(false))

    // 2) Listen for sign-in / sign-out from now on.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      // Supabase advises not awaiting other Supabase calls inside this callback,
      // so the profile fetch is pushed to the next tick.
      setTimeout(() => loadProfile(newSession?.user.id), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    profileError, // set if the profile couldn't be loaded (e.g. missing permissions)
    loading,
    isModerator: profile?.role === 'moderator' || profile?.role === 'admin',

    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),

    // display_name travels in user metadata; the database trigger copies it into profiles.
    signUp: (email, password, displayName) =>
      supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } }),

    signOut: () => supabase.auth.signOut(),

    refreshProfile: () => loadProfile(session?.user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
