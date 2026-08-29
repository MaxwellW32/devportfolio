"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

import { getAudio, unlockAudio } from "../_audio/synth"
import styles from "./musicBounce.module.css"

/* ============================================================================
   MUSIC BOUNCE

   Give it a track. Pick out a slice of the spectrum. Say what the cube should
   do when that slice gets loud. Every kick drum can flip the cube's direction,
   every hi-hat can spin it, and the path it takes is drawn by the music.

   How it works, in three parts:

   1. RANGES. Each range owns a contiguous run of FFT bins and a threshold.
      Every frame it averages its bins; the frame the average crosses the
      threshold from below is a hit. The `armed` flag is what makes it the
      crossing rather than the whole loud passage — without it a sustained bass
      note fires sixty times a second and the cube vibrates instead of moving.

   2. ACTIONS. A hit runs whatever that range is set to do: flip X, flip Y,
      pulse, spin, flash the colour, throw sparks. Several ranges can own the
      same action and they will fight over the cube, which is usually the point.

   3. THE PATH. The cube only ever changes direction on a hit, so the line it
      leaves behind is a drawing of the track's rhythm. Bass on flip-X and
      snare on flip-Y gives you a staircase.

   Everything is drawn on one canvas rather than in DOM nodes, because a mark
   is left at every turn and a busy track leaves hundreds of them.
   ========================================================================= */

const FFT_SIZE = 1024
const BIN_COUNT = FFT_SIZE / 2
const SAMPLE_RATE_GUESS = 48000

export const ACTIONS = ["flipX", "flipY", "pulse", "spin", "flash", "sparks"] as const
export type action = (typeof ACTIONS)[number]

const ACTION_LABEL: Record<action, string> = {
  flipX: "Flip X",
  flipY: "Flip Y",
  pulse: "Pulse",
  spin: "Spin",
  flash: "Flash",
  sparks: "Sparks",
}

type range = {
  id: number
  name: string
  /** Inclusive FFT bin bounds. */
  from: number
  to: number
  /** 0–255, the average this range has to beat. */
  threshold: number
  hue: number
  actions: action[]
  /* Live, written by the audio loop rather than by React. */
  average: number
  armed: boolean
  litUntil: number
}

/** Bass, snare and hats, which is where most people would have started anyway. */
function defaultRanges(): range[] {
  return [
    { id: 1, name: "Bass", from: 1, to: 6, threshold: 168, hue: 8, actions: ["flipX", "pulse"], average: 0, armed: true, litUntil: 0 },
    { id: 2, name: "Body", from: 7, to: 26, threshold: 150, hue: 122, actions: ["flipY"], average: 0, armed: true, litUntil: 0 },
    { id: 3, name: "Air", from: 60, to: 190, threshold: 96, hue: 210, actions: ["spin", "sparks"], average: 0, armed: true, litUntil: 0 },
  ]
}

type mark = { x: number; y: number; w: number; h: number; hue: number; born: number }
type spark = { x: number; y: number; vx: number; vy: number; hue: number; life: number }

type source = "none" | "demo" | "file"

/** Rough frequency for a bin, for the axis labels. */
const binToHz = (bin: number, sampleRate: number) => Math.round((bin * sampleRate) / FFT_SIZE)

/* The spectrum is drawn on a log axis, so the sliders that pick bins run on
   one too. On a linear slider the bottom two octaves — where the kick and the
   snare live — occupy about three pixels. */
const SLIDER_STEPS = 1000
const binToSlider = (bin: number) =>
  Math.round((Math.log2(Math.max(1, bin)) / Math.log2(BIN_COUNT)) * SLIDER_STEPS)
const sliderToBin = (value: number) =>
  Math.max(1, Math.min(BIN_COUNT - 1, Math.round(2 ** ((value / SLIDER_STEPS) * Math.log2(BIN_COUNT)))))

export default function Page() {
  const stageRef = useRef<HTMLCanvasElement | null>(null)
  const spectrumRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaNodeRef = useRef<MediaElementAudioSourceNode | null>(null)

  const [ranges, rangesSet] = useState<range[]>(defaultRanges)
  const [source, sourceSet] = useState<source>("none")
  const [fileName, fileNameSet] = useState<string | null>(null)
  const [error, errorSet] = useState<string | null>(null)
  const [speed, speedSet] = useState(2.4)
  const [trail, trailSet] = useState(0.06)
  const [selected, selectedSet] = useState(1)
  const [sampleRate, sampleRateSet] = useState(SAMPLE_RATE_GUESS)
  const [, tickSet] = useState(0)

  // The loops read the ranges through a ref so editing one takes effect on the
  // next frame without tearing down the audio graph.
  const rangesRef = useRef(ranges)
  const speedRef = useRef(speed)
  const trailRef = useRef(trail)
  const clearRef = useRef<(() => void) | null>(null)
  const nextId = useRef(4)

  useEffect(() => { rangesRef.current = ranges }, [ranges])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { trailRef.current = trail }, [trail])

  /* ---- Audio graph -------------------------------------------------------- */
  const ensureAnalyser = useCallback(() => {
    if (analyserRef.current !== null) return analyserRef.current

    const { context } = getAudio()
    const analyser = context.createAnalyser()
    analyser.fftSize = FFT_SIZE
    analyser.smoothingTimeConstant = 0.72
    analyserRef.current = analyser
    sampleRateSet(context.sampleRate)
    return analyser
  }, [])

  const play = useCallback(
    async (src: string, label: source, name: string | null) => {
      const element = audioRef.current
      if (element === null) return

      errorSet(null)

      try {
        await unlockAudio()
        const { context, master } = getAudio()
        const analyser = ensureAnalyser()

        // A media element can only ever have one source node
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
      }
    },
    [ensureAnalyser],
  )

  /* ---- The stage ---------------------------------------------------------- */
  useEffect(() => {
    const canvas = stageRef.current
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
      context.fillStyle = "#07080d"
      context.fillRect(0, 0, width, height)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    /* --- the cube --- */
    const cube = {
      x: 0,
      y: 0,
      dx: 1,
      dy: 1,
      size: 34,
      hue: 122,
      rotation: 0,
      spin: 0,
      scale: 1,
    }

    const marks: mark[] = []
    const sparks: spark[] = []
    const spectrum = new Uint8Array(BIN_COUNT)

    const centre = () => {
      cube.x = width / 2
      cube.y = height / 2
    }

    // Wait for the first resize to give the canvas a size
    window.setTimeout(centre, 0)

    clearRef.current = () => {
      marks.length = 0
      sparks.length = 0
      context.fillStyle = "#07080d"
      context.fillRect(0, 0, width, height)
      centre()
      cube.rotation = 0
      cube.spin = 0
      cube.scale = 1
    }

    /* --- what a hit does ---
       This is the original rule set, one branch per action. */
    const fire = (eachRange: range, now: number) => {
      eachRange.litUntil = now + 160

      for (const eachAction of eachRange.actions) {
        if (eachAction === "flipX") {
          stamp(eachRange.hue, cube.dx > 0 ? "right" : "left")
          cube.dx *= -1
        } else if (eachAction === "flipY") {
          stamp(eachRange.hue, cube.dy > 0 ? "bottom" : "top")
          cube.dy *= -1
        } else if (eachAction === "pulse") {
          cube.scale = 1.75
        } else if (eachAction === "spin") {
          cube.spin += (Math.random() > 0.5 ? 1 : -1) * (0.09 + Math.random() * 0.09)
        } else if (eachAction === "flash") {
          cube.hue = eachRange.hue
        } else if (eachAction === "sparks") {
          for (let index = 0; index < 14; index += 1) {
            const angle = Math.random() * Math.PI * 2
            const force = 1.5 + Math.random() * 4
            sparks.push({
              x: cube.x,
              y: cube.y,
              vx: Math.cos(angle) * force,
              vy: Math.sin(angle) * force,
              hue: eachRange.hue,
              life: 1,
            })
          }
        }
      }
    }

    /* A mark left on the side the cube turned away from — the reason the path
       reads as a drawing rather than a scribble. */
    const stamp = (hue: number, side: "top" | "bottom" | "left" | "right") => {
      const long = cube.size * 2 + Math.random() * 26
      const short = 2 + Math.random() * 3

      const vertical = side === "left" || side === "right"
      const w = vertical ? short : long
      const h = vertical ? long : short

      let x = cube.x - w / 2
      let y = cube.y - h / 2

      if (side === "left") x = cube.x - cube.size / 2 - w
      if (side === "right") x = cube.x + cube.size / 2
      if (side === "top") y = cube.y - cube.size / 2 - h
      if (side === "bottom") y = cube.y + cube.size / 2

      marks.push({ x, y, w, h, hue, born: performance.now() })
      if (marks.length > 400) marks.shift()
    }

    /* --- loop --- */
    let frame = 0

    const loop = () => {
      frame = requestAnimationFrame(loop)

      const now = performance.now()
      const analyser = analyserRef.current
      const current = rangesRef.current

      /* --- read the spectrum and test every range --- */
      if (analyser !== null) {
        analyser.getByteFrequencyData(spectrum)

        for (const eachRange of current) {
          let sum = 0
          for (let bin = eachRange.from; bin <= eachRange.to; bin += 1) sum += spectrum[bin]
          eachRange.average = sum / (eachRange.to - eachRange.from + 1)

          // The rising edge only. `armed` resets once the range drops back
          // under its threshold, so a held note fires once rather than always.
          if (eachRange.average > eachRange.threshold) {
            if (eachRange.armed) {
              eachRange.armed = false
              fire(eachRange, now)
            }
          } else {
            eachRange.armed = true
          }
        }
      }

      /* --- move --- */
      const step = speedRef.current
      cube.x += cube.dx * step
      cube.y += cube.dy * step
      cube.rotation += cube.spin
      cube.spin *= 0.94
      cube.scale += (1 - cube.scale) * 0.12

      // The walls turn it round too, so it never wanders off screen even if no
      // range is set to flip anything.
      const half = (cube.size * cube.scale) / 2
      if (cube.x - half < 0) { cube.x = half; cube.dx = Math.abs(cube.dx) }
      if (cube.x + half > width) { cube.x = width - half; cube.dx = -Math.abs(cube.dx) }
      if (cube.y - half < 0) { cube.y = half; cube.dy = Math.abs(cube.dy) }
      if (cube.y + half > height) { cube.y = height - half; cube.dy = -Math.abs(cube.dy) }

      /* --- draw ---
         A translucent wash rather than a clear, so the path fades instead of
         vanishing. The trail slider is that wash's opacity. */
      context.fillStyle = `rgba(7, 8, 13, ${trailRef.current})`
      context.fillRect(0, 0, width, height)

      for (let index = marks.length - 1; index >= 0; index -= 1) {
        const eachMark = marks[index]
        const age = (now - eachMark.born) / 4000
        if (age > 1) { marks.splice(index, 1); continue }

        context.fillStyle = `hsla(${eachMark.hue}, 95%, 62%, ${(1 - age) * 0.85})`
        context.fillRect(eachMark.x, eachMark.y, eachMark.w, eachMark.h)
      }

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const eachSpark = sparks[index]
        eachSpark.x += eachSpark.vx
        eachSpark.y += eachSpark.vy
        eachSpark.vx *= 0.96
        eachSpark.vy *= 0.96
        eachSpark.life -= 0.02

        if (eachSpark.life <= 0) { sparks.splice(index, 1); continue }

        context.fillStyle = `hsla(${eachSpark.hue}, 95%, 70%, ${eachSpark.life})`
        context.fillRect(eachSpark.x - 1.5, eachSpark.y - 1.5, 3, 3)
      }

      context.save()
      context.translate(cube.x, cube.y)
      context.rotate(cube.rotation)
      context.scale(cube.scale, cube.scale)

      context.fillStyle = `hsl(${cube.hue}, 90%, 60%)`
      context.shadowColor = `hsl(${cube.hue}, 95%, 60%)`
      context.shadowBlur = 24
      context.fillRect(-cube.size / 2, -cube.size / 2, cube.size, cube.size)

      context.shadowBlur = 0
      context.fillStyle = `hsl(${cube.hue}, 95%, 86%)`
      context.fillRect(-cube.size / 6, -cube.size / 6, cube.size / 3, cube.size / 3)
      context.restore()
    }

    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      clearRef.current = null
    }
  }, [])

  /* ---- The spectrum editor ------------------------------------------------
     Bands are drawn straight over the live FFT, and dragged there rather than
     typed into number boxes. Editing a range while you can see the band you
     are editing is the whole difference between this and the first version. */
  useEffect(() => {
    const canvas = spectrumRef.current
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

    const spectrum = new Uint8Array(BIN_COUNT)
    let frame = 0

    // Bins are spread logarithmically, because a linear axis puts nine tenths
    // of the width on frequencies nothing is happening in.
    const binToX = (bin: number) => (Math.log2(bin + 1) / Math.log2(BIN_COUNT + 1)) * width

    const draw = () => {
      frame = requestAnimationFrame(draw)

      const analyser = analyserRef.current
      context.clearRect(0, 0, width, height)

      if (analyser !== null) analyser.getByteFrequencyData(spectrum)

      /* --- bars --- */
      for (let bin = 1; bin < BIN_COUNT; bin += 1) {
        const x = binToX(bin)
        const next = binToX(bin + 1)
        const value = spectrum[bin] / 255
        const barHeight = value * height

        context.fillStyle = `rgba(180, 200, 235, ${0.18 + value * 0.5})`
        context.fillRect(x, height - barHeight, Math.max(1, next - x), barHeight)
      }

      /* --- range bands over the top --- */
      for (const eachRange of rangesRef.current) {
        const left = binToX(eachRange.from)
        const right = binToX(eachRange.to + 1)
        const lit = performance.now() < eachRange.litUntil

        context.fillStyle = `hsla(${eachRange.hue}, 90%, 60%, ${lit ? 0.34 : 0.12})`
        context.fillRect(left, 0, right - left, height)

        context.strokeStyle = `hsla(${eachRange.hue}, 90%, 65%, ${lit ? 1 : 0.65})`
        context.lineWidth = eachRange.id === selected ? 2 : 1
        context.strokeRect(left + 0.5, 0.5, right - left - 1, height - 1)

        // The threshold line, and the level sitting under it
        const thresholdY = height - (eachRange.threshold / 255) * height
        context.setLineDash([4, 4])
        context.beginPath()
        context.moveTo(left, thresholdY)
        context.lineTo(right, thresholdY)
        context.stroke()
        context.setLineDash([])

        const levelY = height - (eachRange.average / 255) * height
        context.fillStyle = `hsla(${eachRange.hue}, 95%, 70%, 0.9)`
        context.fillRect(left, levelY, right - left, 2)
      }
    }

    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [selected])

  /* ---- Editing ranges ----------------------------------------------------- */
  const update = (id: number, patch: Partial<range>) => {
    rangesSet(previous =>
      previous.map(eachRange => (eachRange.id === id ? { ...eachRange, ...patch } : eachRange)),
    )
  }

  const toggleAction = (id: number, which: action) => {
    rangesSet(previous =>
      previous.map(eachRange =>
        eachRange.id === id
          ? {
              ...eachRange,
              actions: eachRange.actions.includes(which)
                ? eachRange.actions.filter(each => each !== which)
                : [...eachRange.actions, which],
            }
          : eachRange,
      ),
    )
  }

  const addRange = () => {
    const id = nextId.current++
    rangesSet(previous => [
      ...previous,
      {
        id,
        name: `Range ${previous.length + 1}`,
        from: 20,
        to: 60,
        threshold: 140,
        hue: Math.floor(Math.random() * 360),
        actions: ["pulse"],
        average: 0,
        armed: true,
        litUntil: 0,
      },
    ])
    selectedSet(id)
  }

  const removeRange = (id: number) => {
    rangesSet(previous => previous.filter(eachRange => eachRange.id !== id))
  }

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file === undefined) return
    void play(URL.createObjectURL(file), "file", file.name)
  }

  // The readouts are refreshed a few times a second rather than every frame
  useEffect(() => {
    const timer = window.setInterval(() => tickSet(previous => previous + 1), 120)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <main className={styles.page}>
      <canvas ref={stageRef} className={styles.stage} />

      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>
        <p className="label labelPlain labelSignal">
          The cube only turns when the music tells it to
        </p>
      </header>

      {source === "none" && (
        <div className={styles.intro}>
          <h1>Pick a sound. Then decide what it does.</h1>
          <p>
            Choose a slice of the spectrum, set how loud it has to get, and say
            what should happen when it does. Put the kick on Flip&nbsp;X and the
            snare on Flip&nbsp;Y and the cube will draw the beat.
          </p>

          <div className={styles.sources}>
            <button type="button" className="btn btnPrimary" onClick={() => play("/sound/bg.mp3", "demo", "Demo track")}>
              <span>Use the demo track</span>
            </button>

            <label className="btn">
              <span>Use your own file</span>
              <input type="file" accept="audio/*" onChange={onFile} />
            </label>
          </div>

          {error !== null && <p className={styles.error}>{error}</p>}
        </div>
      )}

      <section className={styles.panel} data-open={source !== "none"}>
        <div className={styles.panelHead}>
          <p className="label labelPlain">{fileName ?? "Ranges"}</p>

          <div className={styles.panelActions}>
            <label className={styles.slider}>
              <span>Speed</span>
              <input
                type="range"
                min={0.4}
                max={8}
                step={0.2}
                value={speed}
                onChange={event => speedSet(Number(event.target.value))}
              />
            </label>

            <label className={styles.slider}>
              <span>Trail</span>
              <input
                type="range"
                min={1}
                max={100}
                value={Math.round(trail * 500)}
                onChange={event => trailSet(Number(event.target.value) / 500)}
              />
            </label>

            <button type="button" className="btn btnSm" onClick={() => clearRef.current?.()}>
              <span>Clear canvas</span>
            </button>

            <label className="btn btnSm">
              <span>New file</span>
              <input type="file" accept="audio/*" onChange={onFile} />
            </label>
          </div>
        </div>

        <div className={styles.spectrumWrap}>
          <canvas ref={spectrumRef} className={styles.spectrum} />
          <div className={styles.axis}>
            <span>{binToHz(1, sampleRate)} Hz</span>
            <span>{binToHz(16, sampleRate)} Hz</span>
            <span>{binToHz(64, sampleRate)} Hz</span>
            <span>{binToHz(256, sampleRate)} Hz</span>
            <span>{binToHz(BIN_COUNT - 1, sampleRate)} Hz</span>
          </div>
        </div>

        <div className={styles.ranges}>
          {ranges.map(eachRange => (
            <article
              key={eachRange.id}
              className={styles.range}
              data-selected={selected === eachRange.id}
              data-lit={eachRange.average > eachRange.threshold}
              style={{ "--hue": eachRange.hue } as React.CSSProperties}
              onPointerDown={() => selectedSet(eachRange.id)}
            >
              <div className={styles.rangeHead}>
                <input
                  className={styles.rangeName}
                  value={eachRange.name}
                  onChange={event => update(eachRange.id, { name: event.target.value })}
                  aria-label="Range name"
                />
                <span className={`readout ${styles.level}`}>
                  {Math.round(eachRange.average)}
                </span>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeRange(eachRange.id)}
                  aria-label={`Remove ${eachRange.name}`}
                >
                  ×
                </button>
              </div>

              <p className={styles.hz}>
                {binToHz(eachRange.from, sampleRate)} – {binToHz(eachRange.to + 1, sampleRate)} Hz
              </p>

              <label className={styles.slider}>
                <span>From</span>
                <input
                  type="range"
                  min={0}
                  max={SLIDER_STEPS}
                  value={binToSlider(eachRange.from)}
                  onChange={event =>
                    update(eachRange.id, {
                      from: Math.min(sliderToBin(Number(event.target.value)), eachRange.to),
                    })
                  }
                />
              </label>

              <label className={styles.slider}>
                <span>To</span>
                <input
                  type="range"
                  min={0}
                  max={SLIDER_STEPS}
                  value={binToSlider(eachRange.to)}
                  onChange={event =>
                    update(eachRange.id, {
                      to: Math.max(sliderToBin(Number(event.target.value)), eachRange.from),
                    })
                  }
                />
              </label>

              <label className={styles.slider}>
                <span>Threshold</span>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={eachRange.threshold}
                  onChange={event => update(eachRange.id, { threshold: Number(event.target.value) })}
                />
                <em className="readout">{eachRange.threshold}</em>
              </label>

              <div className={styles.actions}>
                {ACTIONS.map(eachAction => (
                  <button
                    key={eachAction}
                    type="button"
                    data-on={eachRange.actions.includes(eachAction)}
                    onClick={() => toggleAction(eachRange.id, eachAction)}
                  >
                    {ACTION_LABEL[eachAction]}
                  </button>
                ))}
              </div>
            </article>
          ))}

          <button type="button" className={styles.addRange} onClick={addRange}>
            + Add a range
          </button>
        </div>
      </section>

      <audio ref={audioRef} className={styles.audio} controls />
    </main>
  )
}
