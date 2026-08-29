"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { createTransport, setMasterVolume, unlockAudio, type transport } from "../_audio/synth"
import {
  CLIPS,
  TRACKS,
  clipById,
  clipsForTrack,
  startingArrangement,
  type placedClip,
  type trackId,
} from "./clips"
import styles from "./timeline.module.css"

/* ============================================================================
   MUSIC TIMELINE — arranging sound, with a playhead that stays honest

   The version of this I wrote first advanced the playhead with
   `setInterval(tick, 1)`, which is wrong in three separate ways: the browser
   clamps that to about 4ms, the callback is late whenever the main thread is
   busy, and the error accumulates — so the playhead and the audio drifted
   apart within a few bars and the whole thing fell out of time.

   The fix is to stop treating the timer as the clock. The transport in
   ../_audio/synth.ts derives the playhead from `AudioContext.currentTime` and
   books every note in the next third of a second at an exact time. The timer
   is now allowed to be late; the music is not.

   Drag clips to move them, drag their right edge to change how many bars they
   repeat for, click a track's empty space to drop the selected clip in.
   ========================================================================= */

const BEATS_PER_BAR = 4
const BARS = 16
const TOTAL_BEATS = BARS * BEATS_PER_BAR
const SNAP = 1

export default function Page() {
  const [clips, clipsSet] = useState<placedClip[]>(startingArrangement)
  const [tempo, tempoSet] = useState(104)
  const [volume, volumeSet] = useState(0.7)
  const [playing, playingSet] = useState(false)
  const [position, positionSet] = useState(0)
  const [selected, selectedSet] = useState<string | null>(null)
  const [brush, brushSet] = useState<Record<trackId, string>>({
    drums: "four",
    bass: "walk",
    chords: "padam",
    lead: "arpup",
  })

  const laneRef = useRef<HTMLDivElement | null>(null)
  // A counter rather than a timestamp: ids stay stable and the render stays pure
  const nextClipId = useRef(1)
  const transportRef = useRef<transport | null>(null)
  const clipsRef = useRef(clips)
  const tempoRef = useRef(tempo)
  const dragRef = useRef<{
    id: string
    mode: "move" | "resize"
    startX: number
    originalStart: number
    originalLength: number
  } | null>(null)

  useEffect(() => {
    clipsRef.current = clips
  }, [clips])

  useEffect(() => {
    tempoRef.current = tempo
  }, [tempo])

  useEffect(() => {
    setMasterVolume(volume)
  }, [volume])

  const beatSeconds = 60 / tempo
  const songSeconds = TOTAL_BEATS * beatSeconds

  /* ---- Scheduling --------------------------------------------------------
     The transport hands over a window of song time to fill. Everything inside
     it gets booked at an exact audio time and then forgotten about. */
  const fillWindow = useCallback(
    (from: number, to: number, audioTimeAt: (songSeconds: number) => number) => {
      const secondsPerBeat = 60 / tempoRef.current

      for (const eachClip of clipsRef.current) {
        const definition = clipById(eachClip.definitionId)
        if (definition === null) continue

        const clipStart = eachClip.start * secondsPerBeat
        const clipEnd = (eachClip.start + eachClip.length) * secondsPerBeat
        if (clipEnd <= from || clipStart >= to) continue

        const patternSeconds = definition.beats * secondsPerBeat
        const repeats = Math.ceil(eachClip.length / definition.beats)

        for (let repeat = 0; repeat < repeats; repeat += 1) {
          for (const eachEvent of definition.events) {
            const at = clipStart + repeat * patternSeconds + eachEvent.beat * secondsPerBeat

            // A clip that ends mid-pattern is truncated, not rounded up
            if (at >= clipEnd - 0.0001) continue
            if (at < from || at >= to) continue

            eachEvent.play(audioTimeAt(at), 1)
          }
        }
      }
    },
    [],
  )

  useEffect(() => {
    const instance = createTransport({
      onWindow: fillWindow,
      getLength: () => TOTAL_BEATS * (60 / tempoRef.current),
      loop: () => true,
    })

    transportRef.current = instance

    return () => {
      instance.dispose()
      transportRef.current = null
    }
  }, [fillWindow])

  /* ---- Playhead ----------------------------------------------------------- */
  useEffect(() => {
    if (!playing) return

    let frame = 0
    const follow = () => {
      frame = requestAnimationFrame(follow)
      const instance = transportRef.current
      if (instance !== null) positionSet(instance.position())
    }

    frame = requestAnimationFrame(follow)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  const toggle = async () => {
    const instance = transportRef.current
    if (instance === null) return

    if (playing) {
      instance.pause()
      playingSet(false)
      return
    }

    await unlockAudio()
    instance.play()
    playingSet(true)
  }

  /* ---- Editing ------------------------------------------------------------ */
  const beatFromClientX = useCallback((clientX: number) => {
    const lane = laneRef.current
    if (lane === null) return 0

    const rect = lane.getBoundingClientRect()
    return ((clientX - rect.left) / rect.width) * TOTAL_BEATS
  }, [])

  const addClip = (track: trackId, clientX: number) => {
    const definitionId = brush[track]
    const definition = clipById(definitionId)
    if (definition === null) return

    const raw = beatFromClientX(clientX)
    const start = Math.max(0, Math.min(TOTAL_BEATS - definition.beats, Math.round(raw / SNAP) * SNAP))

    const placed: placedClip = {
      id: `clip-${nextClipId.current++}`,
      definitionId,
      track,
      start,
      length: Math.max(definition.beats, BEATS_PER_BAR),
    }

    clipsSet(previous => [...previous, placed])
    selectedSet(placed.id)
  }

  const onClipPointerDown = (
    event: React.PointerEvent,
    clip: placedClip,
    mode: "move" | "resize",
  ) => {
    event.stopPropagation()
    selectedSet(clip.id)

    dragRef.current = {
      id: clip.id,
      mode,
      startX: event.clientX,
      originalStart: clip.start,
      originalLength: clip.length,
    }

    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (drag === null) return

    const lane = laneRef.current
    if (lane === null) return

    const beatsPerPixel = TOTAL_BEATS / lane.getBoundingClientRect().width
    const deltaBeats = (event.clientX - drag.startX) * beatsPerPixel

    clipsSet(previous =>
      previous.map(eachClip => {
        if (eachClip.id !== drag.id) return eachClip

        if (drag.mode === "move") {
          const start = Math.round((drag.originalStart + deltaBeats) / SNAP) * SNAP
          return {
            ...eachClip,
            start: Math.max(0, Math.min(TOTAL_BEATS - eachClip.length, start)),
          }
        }

        const definition = clipById(eachClip.definitionId)
        const minimum = definition?.beats ?? BEATS_PER_BAR
        const length = Math.round((drag.originalLength + deltaBeats) / SNAP) * SNAP

        return {
          ...eachClip,
          length: Math.max(minimum, Math.min(TOTAL_BEATS - eachClip.start, length)),
        }
      }),
    )
  }

  const onPointerUp = () => {
    dragRef.current = null
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selected !== null) {
        event.preventDefault()
        clipsSet(previous => previous.filter(eachClip => eachClip.id !== selected))
        selectedSet(null)
      }

      if (event.code === "Space") {
        event.preventDefault()
        void toggle()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  const scrub = (event: React.MouseEvent) => {
    const beat = Math.max(0, Math.min(TOTAL_BEATS, beatFromClientX(event.clientX)))
    transportRef.current?.seek(beat * beatSeconds)
    positionSet(beat * beatSeconds)
  }

  const currentBeat = position / beatSeconds

  const bars = useMemo(() => Array.from({ length: BARS }, (unused, eachBar) => eachBar), [])

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>
        <p className="label labelPlain labelSignal">
          Driven by the audio clock, not by a timer
        </p>
      </header>

      <section className={styles.transport}>
        <button
          type="button"
          className={`btn btnSm ${playing ? "" : "btnPrimary"}`}
          onClick={toggle}
        >
          <span>{playing ? "Pause" : "Play"}</span>
        </button>

        <button
          type="button"
          className="btn btnSm"
          onClick={() => {
            transportRef.current?.seek(0)
            positionSet(0)
          }}
        >
          <span>Rewind</span>
        </button>

        <label className={styles.inline}>
          <span className="label labelPlain">Tempo</span>
          <input
            type="range"
            min={60}
            max={170}
            value={tempo}
            onChange={event => tempoSet(Number(event.target.value))}
          />
          <span className="readout">{tempo} bpm</span>
        </label>

        <label className={styles.inline}>
          <span className="label labelPlain">Volume</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={event => volumeSet(Number(event.target.value) / 100)}
          />
        </label>

        <p className={`readout ${styles.clock}`}>
          bar {Math.floor(currentBeat / BEATS_PER_BAR) + 1}
          <span>·</span>
          beat {Math.floor(currentBeat % BEATS_PER_BAR) + 1}
          <span>·</span>
          {position.toFixed(2)}s
        </p>
      </section>

      <section className={styles.timeline} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        {/* ---- Ruler ------------------------------------------------- */}
        <div className={styles.rulerRow}>
          <div className={styles.gutter} />
          <div ref={laneRef} className={styles.ruler} onClick={scrub}>
            {bars.map(eachBar => (
              <div key={eachBar} className={styles.bar}>
                <span className="readout">{eachBar + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Tracks ------------------------------------------------ */}
        <div className={styles.tracks}>
          <div
            className={styles.playhead}
            style={{ "--playhead": position / songSeconds } as React.CSSProperties}
            aria-hidden="true"
          />

          {TRACKS.map(eachTrack => (
            <div key={eachTrack.id} className={styles.trackRow}>
              <div className={styles.gutter}>
                <span className={styles.trackName}>{eachTrack.name}</span>

                <select
                  value={brush[eachTrack.id]}
                  onChange={event =>
                    brushSet(previous => ({ ...previous, [eachTrack.id]: event.target.value }))
                  }
                >
                  {clipsForTrack(eachTrack.id).map(eachClip => (
                    <option key={eachClip.id} value={eachClip.id}>{eachClip.name}</option>
                  ))}
                </select>
              </div>

              <div
                className={styles.lane}
                style={{ "--hue": eachTrack.hue } as React.CSSProperties}
                onPointerDown={event => {
                  if (event.target === event.currentTarget) addClip(eachTrack.id, event.clientX)
                }}
              >
                {bars.map(eachBar => (
                  <span key={eachBar} className={styles.laneBar} aria-hidden="true" />
                ))}

                {clips
                  .filter(eachClip => eachClip.track === eachTrack.id)
                  .map(eachClip => {
                    const definition = clipById(eachClip.definitionId)

                    return (
                      <div
                        key={eachClip.id}
                        className={styles.clip}
                        data-selected={selected === eachClip.id}
                        data-active={
                          currentBeat >= eachClip.start &&
                          currentBeat < eachClip.start + eachClip.length
                        }
                        style={{
                          left: `${(eachClip.start / TOTAL_BEATS) * 100}%`,
                          width: `${(eachClip.length / TOTAL_BEATS) * 100}%`,
                        }}
                        onPointerDown={event => onClipPointerDown(event, eachClip, "move")}
                      >
                        <span className={styles.clipName}>{definition?.name ?? "?"}</span>

                        <span
                          className={styles.handle}
                          onPointerDown={event => onClipPointerDown(event, eachClip, "resize")}
                        />
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.hints}>
        <p>
          <kbd>Space</kbd> play · drag a clip to move it · drag its right edge to
          repeat it · <kbd>Del</kbd> removes the selected one · click empty space
          on a track to drop in the clip chosen beside it
        </p>

        <p className={styles.count}>
          <span className="readout">{clips.length}</span> clips ·{" "}
          <span className="readout">{CLIPS.length}</span> patterns available
        </p>
      </footer>
    </main>
  )
}
