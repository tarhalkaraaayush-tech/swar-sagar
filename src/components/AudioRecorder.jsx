import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Button } from './ui'

export const MAX_AUDIO_BYTES = 50 * 1024 * 1024 // Supabase's default upload limit

// Browsers record in different formats (Chrome/Firefox: webm, Safari: mp4).
// Pick the first one this browser supports.
function pickMimeType() {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return options.find((m) => window.MediaRecorder?.isTypeSupported(m)) ?? ''
}

const pad = (n) => String(n).padStart(2, '0')
const clock = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`

/*
  Records from the microphone, or lets the student pick a file instead.
  Calls onChange(blobOrFile) when a recording is ready, or onChange(null) when cleared.

  How recording works:
    getUserMedia  → asks permission and gives a live microphone "stream"
    MediaRecorder → encodes that stream into small chunks while recording
    on stop       → glue the chunks into one Blob (a file in memory)
*/
export default function AudioRecorder({ onChange }) {
  const { t } = useLanguage()
  const [state, setState] = useState('idle') // 'idle' | 'recording' | 'ready'
  const [seconds, setSeconds] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  // Object URLs hold memory until revoked; free the old one when it changes.
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  // If the student leaves the page mid-recording, release the microphone.
  useEffect(() => () => {
    clearInterval(timerRef.current)
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
  }, [])

  function acceptAudio(blob) {
    setPreviewUrl(URL.createObjectURL(blob))
    setState('ready')
    onChange(blob)
  }

  async function start() {
    setError('')
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError(t('micDenied'))
      return
    }
    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    chunksRef.current = []
    recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop()) // turn the mic light off
      acceptAudio(new Blob(chunksRef.current, { type: recorder.mimeType }))
    }
    recorder.start()
    recorderRef.current = recorder

    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    setState('recording')
  }

  function stop() {
    clearInterval(timerRef.current)
    recorderRef.current?.stop()
  }

  function reset() {
    setState('idle')
    setPreviewUrl('')
    onChange(null)
  }

  function pickFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow choosing the same file again later
    if (!file) return
    if (file.size > MAX_AUDIO_BYTES) return setError(t('fileTooBig'))
    setError('')
    acceptAudio(file)
  }

  return (
    <div className="flex flex-col gap-3">
      {state === 'idle' && (
        <div className="flex flex-wrap items-center gap-4">
          <Button type="button" onClick={start}>{t('record')}</Button>
          <label className="cursor-pointer text-sm text-gold hover:text-gold-soft">
            {t('orUploadFile')}
            <input type="file" accept="audio/*" onChange={pickFile} className="sr-only" />
          </label>
        </div>
      )}

      {state === 'recording' && (
        <div className="flex items-center gap-4">
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" aria-hidden />
          <span className="font-display text-2xl tabular-nums">{clock(seconds)}</span>
          <Button type="button" onClick={stop}>{t('stopRecording')}</Button>
        </div>
      )}

      {state === 'ready' && (
        <div className="flex flex-wrap items-center gap-4">
          <audio controls src={previewUrl} className="max-w-full" />
          <Button type="button" variant="ghost" onClick={reset}>{t('recordAgain')}</Button>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
    </div>
  )
}
