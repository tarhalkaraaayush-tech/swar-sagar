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
  data/        raga (and later taal, composition) data
  i18n/        all UI text in Marathi, English, Hindi
  context/     LanguageContext — current language, available everywhere
  components/  Navbar, RagaCard, FilterBar, RagaModal, SwaraText
  pages/       one file per page/route
```
