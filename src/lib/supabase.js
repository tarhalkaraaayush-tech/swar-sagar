import { createClient } from '@supabase/supabase-js'

// Vite exposes variables that start with VITE_ from .env.local as import.meta.env.*
const url = import.meta.env.VITE_SUPABASE_URL
// Supabase's newer dashboards call this the "publishable" key (sb_publishable_…);
// older ones call it the "anon" key (eyJ…). Both are public and work the same way.
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// If the keys aren't set yet, the rest of the site (ragas, taals) still works;
// pages that need the database show a "not set up yet" message instead of crashing.
export const isSupabaseConfigured = Boolean(url && key)

export const supabase = isSupabaseConfigured ? createClient(url, key) : null

// Name of the private storage bucket for recordings (created in supabase/schema.sql)
export const SUBMISSIONS_BUCKET = 'submissions'
