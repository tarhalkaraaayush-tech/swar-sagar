# Swar Sagar · स्वरसागर

A Hindustani classical music platform: raga dictionary, taal library, compositions, and a teacher/student classroom.
Built with React, Vite and Tailwind CSS (Supabase coming later).

## Run it on your computer

You need [Node.js](https://nodejs.org) (version 20 or newer).

```bash
git clone https://github.com/tarhalkaraaayush-tech/swar-sagar.git
cd swar-sagar
npm install      # downloads the libraries listed in package.json (first time only)
npm run dev      # starts a local server, usually at http://localhost:5173
```

Open the address it prints. Edits to files in `src/` show up in the browser instantly. Stop the server with `Ctrl + C`.

`npm run build` makes a production version in `dist/`.

## Connecting accounts and the database (Supabase)

Ragas and taals work without this. Accounts, compositions and the classroom need a free Supabase project.

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query**, paste all of `supabase/schema.sql`, click **Run**.
   This creates the tables, the security rules and the private `submissions` bucket for recordings.
3. **Project Settings → API**: copy the **Project URL** and the **publishable** (or older **anon**) key — **Connect → App Frameworks → React** shows both.
4. In this folder, copy `.env.example` to `.env.local` and paste those two values in.
   (Never use the `service_role` / secret key in this app.)
5. Restart `npm run dev`.

**Make someone a moderator** (they can add, edit and delete compositions) — in the SQL Editor:

```sql
update public.profiles set role = 'moderator'
where id = (select id from auth.users where email = 'their@email.com');
```

Optional: by default Supabase asks new users to confirm their email before they can sign in.
To skip that while testing: **Authentication → Sign In / Providers → Email → turn off "Confirm email"**.

### Who can do what

| | Visitor | Member | Moderator | Class teacher | Class student |
|---|---|---|---|---|---|
| Read compositions | ✓ | ✓ | ✓ | | |
| Add / edit / delete compositions | | | ✓ | | |
| Create a class (becomes its teacher) | | ✓ | ✓ | | |
| Join a class with its code | | ✓ | ✓ | | |
| Add assignments, see roster, listen to recordings, give feedback | | | | ✓ | |
| Record and submit for an assignment, see own feedback | | | | | ✓ |

These rules are enforced by the database itself (Row Level Security in `schema.sql`), not just by hiding buttons.
`supabase/tests/` contains the tests used to check them against a local Postgres.

## Swara notation

| Written | Meaning |
|---|---|
| `S R G M P D N` | shuddha |
| `r g d n` | komal |
| `m` | tivra Ma |
| `N'` | mandra saptak (lower octave) |
| `S"` | taar saptak (upper octave) |

## Layout

```
src/
  data/        ragas.js, taals.js (static reference data)
  i18n/        all UI text in Marathi, English, Hindi
  context/     Language, Settings (notation), Auth (who is signed in)
  lib/         supabase.js — the database connection
  components/  Navbar, raga/taal pieces, AudioRecorder, CompositionForm, ui.jsx
  pages/       one file per page; classroom/ holds the class + assignment pages
supabase/
  schema.sql   tables + security rules — run once in Supabase
  tests/       SQL tests for the security rules
```
