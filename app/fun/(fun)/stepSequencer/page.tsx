"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  SCALES,
  createStepScheduler,
  getAudio,
  midiToFrequency,
  noteName,
  playClap,
  playHat,
  playKick,
  playPluck,
  playSnare,
  playTone,
  scaleNote,
  setMasterVolume,
  unlockAudio,
  type stepScheduler,
} from "../_audio/synth"
import styles from "./stepSequencer.module.css"

/* ============================================================================
   MUSIC SQUARE — a step sequencer

   Sixteen steps, five drum voices and a melody grid, all synthesised in the
   browser. No samples, no library, no audio files: the kick is a sine wave
   whose pitch falls off a cliff, the snare is filtered noise with a triangle
   under it, the hats are the same noise buffer through a high-pass.

   The interesting part is not the grid, it is the clock. See the note on the
   lookahead scheduler in ../_audio/synth.ts — the short version is that the
   timer driving this is allowed to be late by a tenth of a second and the
   groove still lands exactly on the beat, because the timer only books notes
   and the audio clock plays them.
   ========================================================================= */

const STEPS = 16

type drumTrack = {
  id: "kick" | "snare" | "clap" | "hat" | "open"
  name: string
  hint: string
}

const DRUMS: drumTrack[] = [
  { id: "kick", name: "Kick", hint: "sine, 150 → 45 Hz in 90ms" },
  { id: "snare", name: "Snare", hint: "high-passed noise + triangle body" },
  { id: "clap", name: "Clap", hint: "four noise bursts, 11ms apart" },
  { id: "hat", name: "Hat", hint: "noise through a 7.8 kHz high-pass" },
  { id: "open", name: "Open hat", hint: "the same, held six times longer" },
]

const SCALE_NAMES = Object.keys(SCALES)

/** Velocity levels a cell cycles through: silent, soft, loud. */
const LEVELS = [0, 1, 2]

type pattern = {
  drums: Record<drumTrack["id"], number[]>
  /** One note per step: a scale degree, or -1 for a rest. */
  melody: number[]
  tempo: number
  swing: number
  root: number
  scale: string
  bassOctave: boolean
}

const MELODY_ROWS = 8

function emptyDrums(): Record<drumTrack["id"], number[]> {
  return {
    kick: new Array(STEPS).fill(0),
    snare: new Array(STEPS).fill(0),
    clap: new Array(STEPS).fill(0),
    hat: new Array(STEPS).fill(0),
    open: new Array(STEPS).fill(0),
  }
}

/** Something that already grooves, so the page makes music on the first click. */
function startingPattern(): pattern {
  const drums = emptyDrums()

  drums.kick[0] = 2
  drums.kick[6] = 1
  drums.kick[8] = 2
  drums.kick[14] = 1
  drums.snare[4] = 2
  drums.snare[12] = 2
  drums.clap[12] = 1
  for (let step = 0; step < STEPS; step += 2) drums.hat[step] = step % 4 === 0 ? 2 : 1
  drums.open[10] = 1

  const melody = new Array(STEPS).fill(-1)
  const phrase: [number, number][] = [
    [0, 0], [3, 2], [6, 4], [8, 3], [10, 2], [12, 5], [14, 4],
  ]
  for (const [step, degree] of phrase) melody[step] = degree

  return {
    drums,
    melody,
    tempo: 104,
    swing: 0.28,
    root: 45,
    scale: "Minor pentatonic",
    bassOctave: true,
  }
}

/* ---- Sharing -------------------------------------------------------------
   The whole pattern fits in a URL. Digits for drum velocities, digits or a
   dash for the melody, and the settings in front. */
function encode(pattern: pattern) {
  const drums = DRUMS.map(eachTrack => pattern.drums[eachTrack.id].join("")).join("")
  const melody = pattern.melody
    .map(eachDegree => (eachDegree < 0 ? "-" : String(eachDegree)))
    .join("")

  return [
    "1",
    pattern.tempo,
    Math.round(pattern.swing * 100),
    pattern.root,
    SCALE_NAMES.indexOf(pattern.scale),
    pattern.bassOctave ? 1 : 0,
    drums,
    melody,
  ].join(".")
}

function decode(text: string): pattern | null {
  const parts = text.split(".")
  if (parts.length !== 8 || parts[0] !== "1") return null

  const drumText = parts[6]
  if (drumText.length !== DRUMS.length * STEPS) return null
  if (parts[7].length !== STEPS) return null

  const drums = emptyDrums()
  DRUMS.forEach((eachTrack, eachIndex) => {
    const slice = drumText.slice(eachIndex * STEPS, (eachIndex + 1) * STEPS)
    drums[eachTrack.id] = slice.split("").map(eachCharacter => {
      const value = Number(eachCharacter)
      return LEVELS.includes(value) ? value : 0
    })
  })

  const scale = SCALE_NAMES[Number(parts[4])] ?? SCALE_NAMES[0]

  return {
    drums,
    melody: parts[7].split("").map(eachCharacter =>
      eachCharacter === "-" ? -1 : Math.min(MELODY_ROWS - 1, Number(eachCharacter)),
    ),
    tempo: Math.min(200, Math.max(50, Number(parts[1]) || 104)),
    swing: Math.min(0.6, Math.max(0, (Number(parts[2]) || 0) / 100)),
    root: Math.min(72, Math.max(24, Number(parts[3]) || 45)),
    scale,
    bassOctave: parts[5] === "1",
  }
}

export default function Page() {
  const [pattern, patternSet] = useState<pattern>(startingPattern)
  const [playing, playingSet] = useState(false)
  const [step, stepSet] = useState(-1)
  const [volume, volumeSet] = useState(0.75)
  const [copied, copiedSet] = useState(false)

  // The scheduler runs outside React and reads the pattern through a ref, so
  // editing the grid mid-loop takes effect on the next step without tearing
  // down and rebuilding the clock.
  const patternRef = useRef(pattern)
  const schedulerRef = useRef<stepScheduler | null>(null)
  const queueRef = useRef<{ step: number; time: number }[]>([])

  useEffect(() => {
    patternRef.current = pattern
  }, [pattern])

  /* ---- Load a shared pattern out of the URL ---------------------------- */
  useEffect(() => {
    const hash = window.location.hash.replace(/^#p=/, "")
    if (hash === "") return

    const decoded = decode(decodeURIComponent(hash))
    // A shared pattern lives in the URL fragment, which browsers never send to
    // the server — so it can only be applied once this is running client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (decoded !== null) patternSet(decoded)
  }, [])

  /* ---- One step's worth of sound --------------------------------------- */
  const fireStep = useCallback((index: number, time: number) => {
    const current = patternRef.current
    const scale = SCALES[current.scale] ?? SCALES["Minor pentatonic"]

    const kick = current.drums.kick[index]
    if (kick > 0) playKick(time, kick === 2 ? 1 : 0.62)

    const snare = current.drums.snare[index]
    if (snare > 0) playSnare(time, snare === 2 ? 0.55 : 0.32)

    const clap = current.drums.clap[index]
    if (clap > 0) playClap(time, clap === 2 ? 0.45 : 0.26)

    const hat = current.drums.hat[index]
    if (hat > 0) playHat(time, hat === 2 ? 0.3 : 0.16, false)

    const open = current.drums.open[index]
    if (open > 0) playHat(time, open === 2 ? 0.24 : 0.14, true)

    const degree = current.melody[index]
    if (degree >= 0) {
      const midi = scaleNote(scale, current.root + 24, MELODY_ROWS - 1 - degree)
      playPluck(time, midiToFrequency(midi), 0.2, 0.26)

      // The bass doubles the melody two octaves down on downbeats only, which
      // is enough to give the loop a root without writing a second grid.
      if (current.bassOctave && index % 4 === 0) {
        playTone(time, {
          frequency: midiToFrequency(midi - 24),
          duration: 0.36,
          gain: 0.3,
          type: "triangle",
          cutoff: 900,
        })
      }
    }

    queueRef.current.push({ step: index, time })
  }, [])

  /* ---- Transport -------------------------------------------------------- */
  useEffect(() => {
    if (!playing) return

    let cancelled = false

    const begin = async () => {
      await unlockAudio()
      if (cancelled) return

      const scheduler = createStepScheduler({
        onStep: fireStep,
        getTempo: () => patternRef.current.tempo,
        getSwing: () => patternRef.current.swing,
        stepsPerBar: STEPS,
      })

      schedulerRef.current = scheduler
      scheduler.start()
    }

    void begin()

    return () => {
      cancelled = true
      schedulerRef.current?.dispose()
      schedulerRef.current = null
      queueRef.current = []
    }
  }, [playing, fireStep])

  /* ---- The playhead ------------------------------------------------------
     Steps are booked up to 120ms early, so the light cannot follow the
     scheduler directly — it follows the queue, lighting each step at the
     moment the audio clock actually reaches it. */
  useEffect(() => {
    if (!playing) return

    let frame = 0

    const follow = () => {
      frame = requestAnimationFrame(follow)

      const { context } = getAudio()
      const queue = queueRef.current

      let landed = -1
      while (queue.length > 0 && queue[0].time <= context.currentTime) {
        landed = queue[0].step
        queue.shift()
      }

      if (landed >= 0) stepSet(landed)
    }

    frame = requestAnimationFrame(follow)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  useEffect(() => {
    setMasterVolume(volume)
  }, [volume])

  /* ---- Editing ---------------------------------------------------------- */
  const cycleDrum = (track: drumTrack["id"], index: number) => {
    patternSet(previous => {
      const row = [...previous.drums[track]]
      row[index] = (row[index] + 1) % LEVELS.length
      return { ...previous, drums: { ...previous.drums, [track]: row } }
    })
  }

  const setMelody = (index: number, row: number) => {
    patternSet(previous => {
      const melody = [...previous.melody]
      melody[index] = melody[index] === row ? -1 : row
      return { ...previous, melody }
    })
  }

  const clear = () => {
    patternSet(previous => ({
      ...previous,
      drums: emptyDrums(),
      melody: new Array(STEPS).fill(-1),
    }))
  }

  const randomise = () => {
    patternSet(previous => {
      const drums = emptyDrums()

      for (let index = 0; index < STEPS; index += 1) {
        if (index % 4 === 0 || Math.random() < 0.16) drums.kick[index] = index % 8 === 0 ? 2 : 1
        if (index % 8 === 4) drums.snare[index] = 2
        if (Math.random() < 0.55) drums.hat[index] = Math.random() < 0.35 ? 2 : 1
        if (Math.random() < 0.08) drums.open[index] = 1
        if (Math.random() < 0.1) drums.clap[index] = 1
      }

      const melody = new Array(STEPS).fill(-1)
      for (let index = 0; index < STEPS; index += 1) {
        if (Math.random() < 0.42) melody[index] = Math.floor(Math.random() * MELODY_ROWS)
      }

      return { ...previous, drums, melody }
    })
  }

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#p=${encode(pattern)}`
    window.history.replaceState(null, "", url)

    try {
      await navigator.clipboard.writeText(url)
      copiedSet(true)
      window.setTimeout(() => copiedSet(false), 1800)
    } catch {
      // Clipboard blocked — the URL bar has it either way
    }
  }

  // The playhead only means anything while the transport is running
  const activeStep = playing ? step : -1

  const melodyNotes = useMemo(() => {
    const scale = SCALES[pattern.scale] ?? SCALES["Minor pentatonic"]
    return Array.from({ length: MELODY_ROWS }, (unused, eachRow) =>
      noteName(scaleNote(scale, pattern.root + 24, MELODY_ROWS - 1 - eachRow)),
    )
  }, [pattern.scale, pattern.root])

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>
        <p className="label labelPlain labelSignal">Nothing here is a sample</p>
      </header>

      <div className={styles.layout}>
        {/* ---- Controls ------------------------------------------------ */}
        <aside className={styles.panel}>
          <button
            type="button"
            className={`btn ${playing ? "" : "btnPrimary"} ${styles.transport}`}
            onClick={() => playingSet(previous => !previous)}
          >
            <span>{playing ? "Stop" : "Play"}</span>
          </button>

          <label className={styles.field}>
            <span className="label labelPlain">Tempo</span>
            <span className="readout">{pattern.tempo} bpm</span>
            <input
              type="range"
              min={60}
              max={180}
              value={pattern.tempo}
              onChange={event =>
                patternSet(previous => ({ ...previous, tempo: Number(event.target.value) }))
              }
            />
          </label>

          <label className={styles.field}>
            <span className="label labelPlain">Swing</span>
            <span className="readout">{Math.round(pattern.swing * 100)}%</span>
            <input
              type="range"
              min={0}
              max={60}
              value={Math.round(pattern.swing * 100)}
              onChange={event =>
                patternSet(previous => ({ ...previous, swing: Number(event.target.value) / 100 }))
              }
            />
          </label>

          <label className={styles.field}>
            <span className="label labelPlain">Volume</span>
            <span className="readout">{Math.round(volume * 100)}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={event => volumeSet(Number(event.target.value) / 100)}
            />
          </label>

          <label className={styles.field}>
            <span className="label labelPlain">Scale</span>
            <select
              value={pattern.scale}
              onChange={event => patternSet(previous => ({ ...previous, scale: event.target.value }))}
            >
              {SCALE_NAMES.map(eachName => (
                <option key={eachName} value={eachName}>{eachName}</option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className="label labelPlain">Root</span>
            <span className="readout">{noteName(pattern.root + 24)}</span>
            <input
              type="range"
              min={33}
              max={57}
              value={pattern.root}
              onChange={event =>
                patternSet(previous => ({ ...previous, root: Number(event.target.value) }))
              }
            />
          </label>

          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={pattern.bassOctave}
              onChange={event =>
                patternSet(previous => ({ ...previous, bassOctave: event.target.checked }))
              }
            />
            <span>Bass doubles the downbeats</span>
          </label>

          <div className={styles.panelButtons}>
            <button type="button" className="btn btnSm" onClick={randomise}>
              <span>Randomise</span>
            </button>
            <button type="button" className="btn btnSm" onClick={clear}>
              <span>Clear</span>
            </button>
            <button type="button" className="btn btnSm" onClick={share}>
              <span>{copied ? "Link copied" : "Share loop"}</span>
            </button>
          </div>

          <p className={styles.note}>
            The whole pattern lives in the URL, so a loop you like is a link you
            can send.
          </p>
        </aside>

        {/* ---- Grids ---------------------------------------------------- */}
        <section className={styles.grids}>
          <div className={styles.ruler} aria-hidden="true">
            <span />
            {Array.from({ length: STEPS }, (unused, eachStep) => (
              <span key={eachStep} data-beat={eachStep % 4 === 0} data-on={eachStep === activeStep}>
                {eachStep % 4 === 0 ? eachStep / 4 + 1 : ""}
              </span>
            ))}
          </div>

          <div className={styles.drums}>
            {DRUMS.map(eachTrack => (
              <div key={eachTrack.id} className={styles.row}>
                <div className={styles.rowName}>
                  <span>{eachTrack.name}</span>
                  <small>{eachTrack.hint}</small>
                </div>

                {pattern.drums[eachTrack.id].map((eachLevel, eachStep) => (
                  <button
                    key={eachStep}
                    type="button"
                    className={styles.cell}
                    data-level={eachLevel}
                    data-beat={eachStep % 4 === 0}
                    data-playing={eachStep === activeStep}
                    onClick={() => cycleDrum(eachTrack.id, eachStep)}
                    aria-label={`${eachTrack.name} step ${eachStep + 1}`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className={styles.melody}>
            <p className={styles.melodyLabel}>
              <span className="label labelPlain">Melody</span>
              <small>one note per step · click again to clear</small>
            </p>

            {Array.from({ length: MELODY_ROWS }, (unused, eachRow) => (
              <div key={eachRow} className={styles.row}>
                <div className={styles.rowName}>
                  <span className="readout">{melodyNotes[eachRow]}</span>
                </div>

                {Array.from({ length: STEPS }, (unusedStep, eachStep) => (
                  <button
                    key={eachStep}
                    type="button"
                    className={styles.cell}
                    data-note={pattern.melody[eachStep] === eachRow}
                    data-beat={eachStep % 4 === 0}
                    data-playing={eachStep === activeStep}
                    onClick={() => setMelody(eachStep, eachRow)}
                    aria-label={`${melodyNotes[eachRow]} at step ${eachStep + 1}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
