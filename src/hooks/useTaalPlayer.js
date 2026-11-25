import { useCallback, useEffect, useRef, useState } from 'react'

/*
  Plays a taal cycle as accented clicks and reports which matra is sounding.

  Why not just setInterval(playClick, 60000 / bpm)?
  JavaScript timers drift by tens of milliseconds whenever the page is busy,
  which you can hear. The Web Audio clock (ctx.currentTime) is sample-accurate.
  So we use the standard "lookahead scheduler":
    • a cheap timer wakes up every 25 ms,
    • it asks: "which beats fall in the next 100 ms?"
    • it books those beats on the audio clock at their exact times.
  The timer can be late; the audio never is.

  beats: array from flattenTaal() — each has { mark } on vibhag starts.
*/

const LOOKAHEAD_S = 0.1  // schedule this far ahead
const TICK_MS = 25       // how often the scheduler wakes up

// Sound for each kind of beat: [frequency Hz, loudness 0–1]
function voiceFor(mark, isFirst) {
  if (isFirst) return [1320, 0.9]              // sam: high and strong
  if (mark === '0') return [440, 0.55]         // khali: low
  if (mark) return [880, 0.7]                  // tali
  return [660, 0.35]                           // ordinary matra
}

function click(ctx, time, freq, gain) {
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.frequency.value = freq
  // A fast attack and exponential decay sounds like a tap rather than a beep.
  amp.gain.setValueAtTime(0.0001, time)
  amp.gain.exponentialRampToValueAtTime(gain, time + 0.005)
  amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.12)
  osc.connect(amp).connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.13)
}

export function useTaalPlayer(beats, bpm) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(-1) // matra index being heard, -1 = none

  // useRef holds values that the scheduler reads and updates *without*
  // causing re-renders (like instance fields on a Java object).
  const ctxRef = useRef(null)
  const timerRef = useRef(null)
  const nextIndex = useRef(0)
  const nextTime = useRef(0)
  const bpmRef = useRef(bpm)
  const beatsRef = useRef(beats)
  const runId = useRef(0)     // bumps on every stop, so stale highlight timeouts are ignored
  bpmRef.current = bpm        // always read the latest tempo on the next beat
  beatsRef.current = beats

  const stop = useCallback(() => {
    runId.current += 1
    clearInterval(timerRef.current)
    timerRef.current = null
    setPlaying(false)
    setCurrent(-1)
  }, [])

  const start = useCallback(() => {
    // Browsers only allow audio after a user gesture, so the AudioContext
    // is created here (inside the click handler), not at page load.
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    const ctx = ctxRef.current
    ctx.resume()

    nextIndex.current = 0
    nextTime.current = ctx.currentTime + 0.05
    const myRun = runId.current

    const schedule = () => {
      const list = beatsRef.current
      while (nextTime.current < ctx.currentTime + LOOKAHEAD_S) {
        const i = nextIndex.current
        const [freq, gain] = voiceFor(list[i].mark, i === 0)
        click(ctx, nextTime.current, freq, gain)

        // Light up the grid when the sound actually plays, not when it's booked.
        const delayMs = Math.max(0, (nextTime.current - ctx.currentTime) * 1000)
        setTimeout(() => { if (runId.current === myRun) setCurrent(i) }, delayMs)

        nextTime.current += 60 / bpmRef.current
        nextIndex.current = (i + 1) % list.length
      }
    }

    schedule()
    timerRef.current = setInterval(schedule, TICK_MS)
    setPlaying(true)
  }, [])

  // Stop if the taal changes or the page is left.
  useEffect(() => stop, [beats, stop])
  useEffect(() => () => ctxRef.current?.close(), [])

  return { playing, current, start, stop }
}
