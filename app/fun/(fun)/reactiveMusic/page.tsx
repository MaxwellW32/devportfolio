"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

import { getAudio, unlockAudio } from "../_audio/synth"
import styles from "./reactive.module.css"

/* ============================================================================
   REACTIVE MUSIC — reading the spectrum and drawing it

   An AnalyserNode gives you 1024 numbers, sixty times a second: how much
   energy sits in each slice of the frequency range. Everything on screen is
   those numbers and nothing else.

   The part that took actual thought is the beat detection. Comparing the bass
   energy against a fixed threshold does not work, because a quiet track never
   crosses it and a loud one is over it permanently. What does work is
   comparing the current bass energy against a rolling average of the last
   second of itself: a beat is a local spike relative to how loud the track
   already is, which is scale-free and therefore works on anything.
   ========================================================================= */

const FFT_SIZE = 2048
const HISTORY = 60
const BEAT_SENSITIVITY = 1.2
const BEAT_REFRACTORY = 0.22

type source = "none" | "demo" | "file" | "mic"

type bands = { bass: number; low: number; mid: number; high: number; level: number }

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const micNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)

  const [source, sourceSet] = useState<source>("none")
  const [fileName, fileNameSet] = useState<string | null>(null)
  const [error, errorSet] = useState<string | null>(null)
  const [readout, readoutSet] = useState<bands & { bpm: number | null }>({
    bass: 0,
    low: 0,
    mid: 0,
    high: 0,
    level: 0,
    bpm: null,
  })

  /* ---- The graph ---------------------------------------------------------
     One analyser for the whole page. Sources connect to it and disconnect
     from it; it never gets rebuilt, so switching source never drops a frame. */
  const ensureAnalyser = useCallback(() => {
    if (analyserRef.current !== null) return analyserRef.current

    const { context } = getAudio()
    const analyser = context.createAnalyser()
    analyser.fftSize = FFT_SIZE
    analyser.smoothingTimeConstant = 0.78
    analyser.minDecibels = -92
    analyser.maxDecibels = -12

    analyserRef.current = analyser
    return analyser
  }, [])

  const detachAll = useCallback(() => {
    mediaNodeRef.current?.disconnect()
    micNodeRef.current?.disconnect()

    micStreamRef.current?.getTracks().forEach(eachTrack => eachTrack.stop())
    micStreamRef.current = null
    micNodeRef.current = null

    audioRef.current?.pause()
  }, [])

  const playElement = useCallback(
    async (src: string, label: source, name: string | null) => {
      const element = audioRef.current
      if (element === null) return

      errorSet(null)

      try {
        await unlockAudio()
        const { context, master } = getAudio()
        const analyser = ensureAnalyser()

        detachAll()

        // A media element can only ever have one source node, so it is created
        // once and kept — calling createMediaElementSource twice throws.
        if (mediaNodeRef.current === null) {
          mediaNodeRef.current = context.createMediaElementSource(element)
        }

        mediaNodeRef.current.connect(analyser)
        analyser.connect(master)

        element.src = src
        element.loop = true
        await element.play()

        fileNameSet(name)
        sourceSet(label)
      } catch (thrown) {
        errorSet(thrown instanceof Error ? thrown.message : "Could not play that")
        sourceSet("none")
      }
    },
    [detachAll, ensureAnalyser],
  )

  const useMicrophone = useCallback(async () => {
    errorSet(null)

    try {
      await unlockAudio()
      const { context } = getAudio()
      const analyser = ensureAnalyser()

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })

      detachAll()

      const node = context.createMediaStreamSource(stream)
      // Deliberately not connected to the output: that is a feedback loop
      node.connect(analyser)
      analyser.disconnect()

      micStreamRef.current = stream
      micNodeRef.current = node
      fileNameSet(null)
      sourceSet("mic")
    } catch {
      errorSet("Microphone access was refused.")
      sourceSet("none")
    }
  }, [detachAll, ensureAnalyser])

  const stop = useCallback(() => {
    detachAll()
    analyserRef.current?.disconnect()
    sourceSet("none")
    fileNameSet(null)
  }, [detachAll])

  useEffect(() => stop, [stop])

  /* ---- Drawing ------------------------------------------------------------ */
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const context = canvas.getContext("2d")
    if (context === null) return

    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const spectrum = new Uint8Array(FFT_SIZE / 2)
    const waveform = new Uint8Array(FFT_SIZE)
    const bassHistory: number[] = []
    const beatTimes: number[] = []

    let pulse = 0
    let rotation = 0
    let lastBeat = -1
    let frame = 0
    let sinceReadout = 0

    const average = (data: Uint8Array, from: number, to: number) => {
      let sum = 0
      for (let index = from; index < to; index += 1) sum += data[index]
      return sum / (to - from) / 255
    }

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)

      const analyser = analyserRef.current
      const seconds = now / 1000

      context.clearRect(0, 0, width, height)

      const centreX = width / 2
      const centreY = height / 2
      const radius = Math.min(width, height) * 0.21

      let bands: bands = { bass: 0, low: 0, mid: 0, high: 0, level: 0 }

      if (analyser !== null) {
        analyser.getByteFrequencyData(spectrum)
        analyser.getByteTimeDomainData(waveform)

        bands = {
          // 1024 bins across ~22 kHz, so each bin is about 21 Hz
          bass: average(spectrum, 1, 6),
          low: average(spectrum, 6, 24),
          mid: average(spectrum, 24, 120),
          high: average(spectrum, 120, 420),
          level: average(spectrum, 1, 420),
        }

        /* --- beat detection, relative to the recent past --- */
        bassHistory.push(bands.bass)
        if (bassHistory.length > HISTORY) bassHistory.shift()

        const baseline =
          bassHistory.reduce((total, each) => total + each, 0) / Math.max(1, bassHistory.length)

        if (
          bands.bass > 0.06 &&
          bands.bass > baseline * BEAT_SENSITIVITY &&
          seconds - lastBeat > BEAT_REFRACTORY
        ) {
          if (lastBeat > 0) beatTimes.push(seconds - lastBeat)
          if (beatTimes.length > 16) beatTimes.shift()
          lastBeat = seconds
          pulse = 1
        }
      }

      pulse *= 0.92
      rotation += 0.0016 + bands.level * 0.006

      /* --- the ring of bars --- */
      const bars = 128
      context.save()
      context.translate(centreX, centreY)
      context.rotate(rotation)

      for (let index = 0; index < bars; index += 1) {
        // Logarithmic bin spacing, because linear spacing puts nine tenths of
        // the ring on frequencies nobody can hear anything happening in
        const position = index / bars
        const bin = Math.floor(4 * (spectrum.length / 4) ** position)
        const value = (spectrum[Math.min(bin, spectrum.length - 1)] ?? 0) / 255

        const angle = position * Math.PI * 2
        const inner = radius * (1 + pulse * 0.14)
        const length = 8 + value * Math.min(width, height) * 0.24

        const hue = 100 + position * 160
        context.strokeStyle = `hsla(${hue}, ${60 + value * 40}%, ${45 + value * 30}%, ${0.25 + value * 0.75})`
        context.lineWidth = 2.4
        context.lineCap = "round"

        context.beginPath()
        context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
        context.lineTo(Math.cos(angle) * (inner + length), Math.sin(angle) * (inner + length))
        context.stroke()
      }

      context.restore()

      /* --- the waveform, drawn round the inside of the ring --- */
      context.save()
      context.translate(centreX, centreY)
      context.beginPath()

      for (let index = 0; index <= 180; index += 1) {
        const position = index / 180
        const sample = waveform[Math.floor(position * (waveform.length - 1))] ?? 128
        const offset = ((sample - 128) / 128) * radius * 0.42
        const angle = position * Math.PI * 2
        const r = radius * 0.72 + offset

        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (index === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }

      context.closePath()
      context.strokeStyle = `rgba(220, 255, 190, ${0.35 + bands.level * 0.5})`
      context.lineWidth = 1.4
      context.stroke()
      context.restore()

      /* --- the beat flash --- */
      if (pulse > 0.02) {
        const glow = context.createRadialGradient(centreX, centreY, radius * 0.2, centreX, centreY, radius * 2.4)
        glow.addColorStop(0, `rgba(190, 255, 90, ${pulse * 0.16})`)
        glow.addColorStop(1, "rgba(190, 255, 90, 0)")
        context.fillStyle = glow
        context.fillRect(0, 0, width, height)
      }

      /* --- readouts, four times a second rather than sixty --- */
      sinceReadout += 1
      if (sinceReadout >= 15) {
        sinceReadout = 0

        const intervals = [...beatTimes].sort((a, b) => a - b)
        const median = intervals.length >= 3 ? intervals[Math.floor(intervals.length / 2)] : null

        readoutSet({
          ...bands,
          bpm: median !== null && median > 0.2 ? Math.round(60 / median) : null,
        })
      }
    }

    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file === undefined) return
    void playElement(URL.createObjectURL(file), "file", file.name)
  }

  return (
    <main className={styles.page}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <audio ref={audioRef} className={styles.audio} controls />

      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>
        <p className="label labelPlain labelSignal">1024 numbers, sixty times a second</p>
      </header>

      {source === "none" && (
        <div className={styles.intro}>
          <h1>Give it something to listen to.</h1>
          <p>
            Everything you see is the frequency data coming out of the Web Audio
            API. Nothing is decorative — the ring is the spectrum, the shape
            inside it is the waveform, and the flash is a bass spike measured
            against the last second and a half of itself.
          </p>

          <div className={styles.sources}>
            <button
              type="button"
              className="btn btnPrimary"
              onClick={() => playElement("/sound/bg.mp3", "demo", "Demo track")}
            >
              <span>Play the demo track</span>
            </button>

            <label className="btn">
              <span>Use a file of your own</span>
              <input type="file" accept="audio/*" onChange={onFile} />
            </label>

            <button type="button" className="btn" onClick={useMicrophone}>
              <span>Use the microphone</span>
            </button>
          </div>

          {error !== null && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {source !== "none" && (
        <aside className={styles.panel}>
          <div className={styles.panelHead}>
            <p className="label labelPlain">
              {source === "mic" ? "Microphone" : (fileName ?? "Playing")}
            </p>
            <button type="button" className={styles.stop} onClick={stop}>Stop</button>
          </div>

          <ul className={styles.meters}>
            {(
              [
                ["Bass", readout.bass],
                ["Low", readout.low],
                ["Mid", readout.mid],
                ["High", readout.high],
              ] as [string, number][]
            ).map(([eachLabel, eachValue]) => (
              <li key={eachLabel}>
                <span>{eachLabel}</span>
                <span className={styles.meter}>
                  <span style={{ width: `${Math.min(100, eachValue * 130)}%` }} />
                </span>
                <span className="readout">{Math.round(eachValue * 100)}</span>
              </li>
            ))}
          </ul>

          <p className={styles.bpm}>
            <span className="label labelPlain">Estimated tempo</span>
            <span className="readout">{readout.bpm === null ? "listening…" : `${readout.bpm} bpm`}</span>
          </p>

          <div className={styles.switcher}>
            {source !== "demo" && (
              <button
                type="button"
                className="btn btnSm"
                onClick={() => playElement("/sound/bg.mp3", "demo", "Demo track")}
              >
                <span>Demo</span>
              </button>
            )}

            <label className="btn btnSm">
              <span>File</span>
              <input type="file" accept="audio/*" onChange={onFile} />
            </label>

            {source !== "mic" && (
              <button type="button" className="btn btnSm" onClick={useMicrophone}>
                <span>Mic</span>
              </button>
            )}
          </div>
        </aside>
      )}
    </main>
  )
}
