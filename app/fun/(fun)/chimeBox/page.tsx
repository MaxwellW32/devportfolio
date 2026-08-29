"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import {
  SCALES,
  getAudio,
  midiToFrequency,
  noteName,
  playBell,
  playPluck,
  scaleNote,
  setMasterVolume,
  unlockAudio,
} from "../_audio/synth"
import styles from "./bounce.module.css"

/* ============================================================================
   MUSIC BOUNCE — the walls are the instrument

   Balls fall, bounce, and every wall they touch plays a note. Which note comes
   from where along the wall they hit, so the four edges of the box are four
   keyboards and the physics is the performer.

   Left alone that produces noise, not music, because collisions happen at
   arbitrary times. So there is a quantise control: with it on, a collision
   does not play its note immediately — it books it for the next sixteenth-note
   boundary on the audio clock. The physics stays exactly as chaotic, and the
   result comes out in time. Turning it off is the clearest demonstration I
   know of what quantisation actually does.
   ========================================================================= */

const RADIUS_MIN = 7
const RADIUS_MAX = 15
const RESTITUTION = 0.985
const MAX_SPEED = 900
const TRAIL = 14

type ball = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  hue: number
  trail: { x: number; y: number }[]
}

type wall = "left" | "right" | "top" | "bottom"

type ripple = {
  x: number
  y: number
  at: number
  hue: number
  strength: number
  wall: wall
  position: number
}

type settings = {
  gravity: number
  quantise: boolean
  tempo: number
  scale: string
  root: number
  damping: number
}

const SCALE_NAMES = Object.keys(SCALES)

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [running, runningSet] = useState(false)
  const [count, countSet] = useState(0)
  const [volume, volumeSet] = useState(0.7)
  const [settings, settingsSet] = useState<settings>({
    gravity: 900,
    quantise: true,
    tempo: 112,
    scale: "Minor pentatonic",
    root: 52,
    damping: 0.9,
  })

  const settingsRef = useRef(settings)
  const runningRef = useRef(running)
  const ballsRef = useRef<ball[]>([])
  const ripplesRef = useRef<ripple[]>([])
  const addRef = useRef<((x?: number, y?: number) => void) | null>(null)
  const clearRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    runningRef.current = running
  }, [running])

  useEffect(() => {
    setMasterVolume(volume)
  }, [volume])

  /* ---- The world -------------------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const context = canvas.getContext("2d")
    if (context === null) return

    let width = 0
    let height = 0
    let nextId = 1

    // Strict mode mounts effects twice in development; without this the world
    // would start with two sets of balls in it.
    ballsRef.current = []
    ripplesRef.current = []

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

    /* ---- Adding balls --------------------------------------------------- */
    const addBall = (x?: number, y?: number) => {
      const radius = RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN)

      ballsRef.current.push({
        id: nextId++,
        x: x ?? width * (0.2 + Math.random() * 0.6),
        y: y ?? height * 0.18,
        vx: (Math.random() - 0.5) * 460,
        vy: (Math.random() - 0.5) * 160,
        radius,
        hue: Math.floor(Math.random() * 360),
        trail: [],
      })

      countSet(ballsRef.current.length)
    }

    addRef.current = addBall
    clearRef.current = () => {
      ballsRef.current = []
      ripplesRef.current = []
      countSet(0)
    }

    for (let index = 0; index < 3; index += 1) addBall()

    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      addBall(event.clientX - rect.left, event.clientY - rect.top)
    }

    canvas.addEventListener("pointerdown", onPointerDown)

    /* ---- Sounding a collision -------------------------------------------
       `position` is 0..1 along the wall that was struck. The wall is a
       keyboard: position picks the scale degree. */
    const strike = (
      wall: wall,
      position: number,
      speed: number,
      x: number,
      y: number,
      hue: number,
    ) => {
      const current = settingsRef.current
      const scale = SCALES[current.scale] ?? SCALES["Minor pentatonic"]
      const { context: audioContext } = getAudio()

      const degree = Math.floor(Math.max(0, Math.min(0.999, position)) * 10)
      // Verticals sit an octave above the horizontals, so the box has a range
      const octave = wall === "left" || wall === "right" ? 12 : 0
      const midi = scaleNote(scale, current.root + octave, degree)

      const strength = Math.min(1, speed / 700)
      const gain = 0.06 + strength * 0.24

      let when = audioContext.currentTime + 0.02

      if (current.quantise) {
        // Book it for the next sixteenth instead of playing it now
        const stepSeconds = 60 / current.tempo / 4
        when = Math.ceil((audioContext.currentTime + 0.03) / stepSeconds) * stepSeconds
      }

      if (wall === "top" || wall === "bottom") {
        playBell(when, midiToFrequency(midi), gain, 0.7 + strength * 0.6)
      } else {
        playPluck(when, midiToFrequency(midi), gain * 0.9, 0.24)
      }

      ripplesRef.current.push({ x, y, at: when, hue, strength, wall, position: degree / 10 })
    }

    /* ---- Loop ------------------------------------------------------------ */
    let frame = 0
    let last = performance.now()

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)

      const delta = Math.min((now - last) / 1000, 0.033)
      last = now

      const current = settingsRef.current
      const balls = ballsRef.current

      if (runningRef.current) {
        for (const eachBall of balls) {
          eachBall.vy += current.gravity * delta

          const speed = Math.hypot(eachBall.vx, eachBall.vy)
          if (speed > MAX_SPEED) {
            eachBall.vx *= MAX_SPEED / speed
            eachBall.vy *= MAX_SPEED / speed
          }

          eachBall.x += eachBall.vx * delta
          eachBall.y += eachBall.vy * delta

          /* --- walls --- */
          if (eachBall.x - eachBall.radius < 0) {
            eachBall.x = eachBall.radius
            eachBall.vx = Math.abs(eachBall.vx) * RESTITUTION
            strike("left", 1 - eachBall.y / height, Math.abs(eachBall.vx), 0, eachBall.y, eachBall.hue)
          } else if (eachBall.x + eachBall.radius > width) {
            eachBall.x = width - eachBall.radius
            eachBall.vx = -Math.abs(eachBall.vx) * RESTITUTION
            strike("right", 1 - eachBall.y / height, Math.abs(eachBall.vx), width, eachBall.y, eachBall.hue)
          }

          if (eachBall.y - eachBall.radius < 0) {
            eachBall.y = eachBall.radius
            eachBall.vy = Math.abs(eachBall.vy) * RESTITUTION
            strike("top", eachBall.x / width, Math.abs(eachBall.vy), eachBall.x, 0, eachBall.hue)
          } else if (eachBall.y + eachBall.radius > height) {
            eachBall.y = height - eachBall.radius
            // Damping only on the floor, which is where energy realistically
            // goes — and where an undamped ball would bounce forever.
            eachBall.vy = -Math.abs(eachBall.vy) * current.damping

            if (Math.abs(eachBall.vy) > 60) {
              strike("bottom", eachBall.x / width, Math.abs(eachBall.vy), eachBall.x, height, eachBall.hue)
            } else {
              // Too slow to make a sound; give it a nudge so it stays alive
              eachBall.vy = -260 - Math.random() * 160
            }
          }

          eachBall.trail.push({ x: eachBall.x, y: eachBall.y })
          if (eachBall.trail.length > TRAIL) eachBall.trail.shift()
        }
      }

      /* --- draw --- */
      context.clearRect(0, 0, width, height)

      // A faint grid of the note divisions, so the walls read as instruments
      context.strokeStyle = "rgba(255,255,255,0.11)"
      context.lineWidth = 1
      for (let index = 1; index < 10; index += 1) {
        const x = (width / 10) * index
        const y = (height / 10) * index
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, 16)
        context.moveTo(x, height - 16)
        context.lineTo(x, height)
        context.moveTo(0, y)
        context.lineTo(16, y)
        context.moveTo(width - 16, y)
        context.lineTo(width, y)
        context.stroke()
      }

      const audioNow = getAudio().context.currentTime

      // Ripples appear at the moment their note actually sounds, which is why
      // they line up with the beat when quantise is on.
      ripplesRef.current = ripplesRef.current.filter(eachRipple => {
        const age = audioNow - eachRipple.at
        if (age < 0) return true
        if (age > 0.9) return false

        const progress = age / 0.9
        const radius = 6 + progress * (60 + eachRipple.strength * 90)

        context.beginPath()
        context.arc(eachRipple.x, eachRipple.y, radius, 0, Math.PI * 2)
        context.strokeStyle = `hsla(${eachRipple.hue}, 90%, 70%, ${(1 - progress) * 0.75})`
        context.lineWidth = 2 * (1 - progress) + 0.5
        context.stroke()

        // Light up the tenth of the wall that just sounded, so it is obvious
        // that the edges are keyboards rather than decoration.
        if (progress < 0.45) {
          const fade = 1 - progress / 0.45
          const vertical = eachRipple.wall === "left" || eachRipple.wall === "right"
          const span = (vertical ? height : width) / 10
          const start = eachRipple.position * (vertical ? height : width)

          context.strokeStyle = `hsla(${eachRipple.hue}, 95%, 72%, ${fade * 0.9})`
          context.lineWidth = 4
          context.beginPath()

          if (eachRipple.wall === "left") {
            context.moveTo(1, height - start)
            context.lineTo(1, height - start - span)
          } else if (eachRipple.wall === "right") {
            context.moveTo(width - 1, height - start)
            context.lineTo(width - 1, height - start - span)
          } else if (eachRipple.wall === "top") {
            context.moveTo(start, 1)
            context.lineTo(start + span, 1)
          } else {
            context.moveTo(start, height - 1)
            context.lineTo(start + span, height - 1)
          }

          context.stroke()
        }

        return true
      })

      for (const eachBall of balls) {
        eachBall.trail.forEach((eachPoint, eachIndex) => {
          const fade = eachIndex / eachBall.trail.length
          context.beginPath()
          context.arc(eachPoint.x, eachPoint.y, eachBall.radius * fade * 0.85, 0, Math.PI * 2)
          context.fillStyle = `hsla(${eachBall.hue}, 85%, 65%, ${fade * 0.22})`
          context.fill()
        })

        const gradient = context.createRadialGradient(
          eachBall.x - eachBall.radius * 0.3,
          eachBall.y - eachBall.radius * 0.3,
          1,
          eachBall.x,
          eachBall.y,
          eachBall.radius,
        )
        gradient.addColorStop(0, `hsl(${eachBall.hue}, 95%, 82%)`)
        gradient.addColorStop(1, `hsl(${eachBall.hue}, 80%, 52%)`)

        context.beginPath()
        context.arc(eachBall.x, eachBall.y, eachBall.radius, 0, Math.PI * 2)
        context.fillStyle = gradient
        context.fill()
      }
    }

    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener("pointerdown", onPointerDown)
      addRef.current = null
      clearRef.current = null
    }
  }, [])

  const toggle = async () => {
    if (!running) await unlockAudio()
    runningSet(previous => !previous)
  }

  return (
    <main className={styles.page}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>
        <p className="label labelPlain labelSignal">Click anywhere to drop a ball</p>
      </header>

      <aside className={styles.panel}>
        <div className={styles.panelRow}>
          <button type="button" className={`btn btnSm ${running ? "" : "btnPrimary"}`} onClick={toggle}>
            <span>{running ? "Pause" : "Play"}</span>
          </button>
          <button type="button" className="btn btnSm" onClick={() => addRef.current?.()}>
            <span>Add ball</span>
          </button>
          <button type="button" className="btn btnSm" onClick={() => clearRef.current?.()}>
            <span>Clear</span>
          </button>
        </div>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.quantise}
            onChange={event =>
              settingsSet(previous => ({ ...previous, quantise: event.target.checked }))
            }
          />
          <span>
            Quantise to the beat
            <small>
              {settings.quantise
                ? "notes wait for the next sixteenth"
                : "notes play the instant the ball lands"}
            </small>
          </span>
        </label>

        <Slider
          label="Tempo"
          value={settings.tempo}
          display={`${settings.tempo} bpm`}
          min={60}
          max={180}
          onChange={value => settingsSet(previous => ({ ...previous, tempo: value }))}
        />

        <Slider
          label="Gravity"
          value={settings.gravity}
          display={`${settings.gravity}`}
          min={0}
          max={2200}
          step={50}
          onChange={value => settingsSet(previous => ({ ...previous, gravity: value }))}
        />

        <Slider
          label="Bounce"
          value={Math.round(settings.damping * 100)}
          display={`${Math.round(settings.damping * 100)}%`}
          min={50}
          max={100}
          onChange={value => settingsSet(previous => ({ ...previous, damping: value / 100 }))}
        />

        <Slider
          label="Root"
          value={settings.root}
          display={noteName(settings.root)}
          min={40}
          max={64}
          onChange={value => settingsSet(previous => ({ ...previous, root: value }))}
        />

        <label className={styles.field}>
          <span className="label labelPlain">Scale</span>
          <select
            value={settings.scale}
            onChange={event => settingsSet(previous => ({ ...previous, scale: event.target.value }))}
          >
            {SCALE_NAMES.map(eachName => (
              <option key={eachName} value={eachName}>{eachName}</option>
            ))}
          </select>
        </label>

        <Slider
          label="Volume"
          value={Math.round(volume * 100)}
          display={`${Math.round(volume * 100)}%`}
          min={0}
          max={100}
          onChange={value => volumeSet(value / 100)}
        />

        <p className={styles.note}>
          <span className="readout">{count}</span> balls · the top and bottom
          walls are bells, the sides are plucks, and where along a wall you land
          picks the note.
        </p>
      </aside>
    </main>
  )
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  display: string
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label className={styles.field}>
      <span className="label labelPlain">{label}</span>
      <span className="readout">{display}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
    </label>
  )
}
