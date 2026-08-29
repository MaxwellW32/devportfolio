"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"

import { biomes, deriveSeeds, isWalkable, sampleWorld, type worldSample } from "./worldGen"
import styles from "./seedWorld.module.css"

/* ============================================================================
   SEED WORLD

   Type a seed, walk around. Type the same seed tomorrow and every tile is
   where you left it — because nothing is stored. Every tile is a pure function
   of (seed, x, y), so the world is infinite and free.

   See worldGen.ts for the generator itself.
   ========================================================================= */

const TILE = 16
const DETAIL_CUTOFF = 10 // below this zoom, skip per-tile decoration

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"

function randomSeed() {
  let out = ""
  for (let i = 0; i < 12; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
    if (i === 3 || i === 7) out += "-"
  }
  return out
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const [seed, seedSet] = useState("kingston-signal-01")
  const [draftSeed, draftSeedSet] = useState("kingston-signal-01")
  const [zoom, zoomSet] = useState(0.7)
  // The readout is throttled state rather than a ref read during render — a
  // ref read would not re-render, so the coordinates would sit frozen.
  const [standing, standingSet] = useState<(worldSample & { x: number; y: number }) | null>(null)
  const [showLegend, showLegendSet] = useState(true)

  // Mutable per-frame state kept out of React so the loop never re-renders
  const player = useRef({ x: 0, y: 0 })
  const keys = useRef({ up: false, down: false, left: false, right: false, boost: false })
  const seeds = useRef(deriveSeeds(seed))
  const zoomRef = useRef(zoom)

  useEffect(() => {
    seeds.current = deriveSeeds(seed)
    player.current = { x: 0, y: 0 }
  }, [seed])

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  /* ---- Input ------------------------------------------------------------ */
  useEffect(() => {
    const setKey = (e: KeyboardEvent, down: boolean) => {
      const key = e.key.toLowerCase()

      if (key === "w" || key === "arrowup") keys.current.up = down
      else if (key === "s" || key === "arrowdown") keys.current.down = down
      else if (key === "a" || key === "arrowleft") keys.current.left = down
      else if (key === "d" || key === "arrowright") keys.current.right = down
      else if (key === "shift") keys.current.boost = down
      else return

      // Arrow keys would otherwise scroll the page under the canvas
      e.preventDefault()
    }

    const onDown = (e: KeyboardEvent) => {
      // Never swallow keystrokes meant for the seed field
      if (e.target instanceof HTMLInputElement) return
      setKey(e, true)
    }
    const onUp = (e: KeyboardEvent) => setKey(e, false)

    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)

    return () => {
      window.removeEventListener("keydown", onDown)
      window.removeEventListener("keyup", onUp)
    }
  }, [])

  /* ---- Render loop ------------------------------------------------------ */
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (canvas === null || wrap === null) return

    const ctx = canvas.getContext("2d")
    if (ctx === null) return

    let width = 0
    let height = 0
    let frameId = 0
    let lastTime = performance.now()
    let sinceReadout = 0

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)

    const frame = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const tileSize = TILE * zoomRef.current
      const speed = (keys.current.boost ? 26 : 9) * delta

      // --- move, refusing to walk into deep water ---
      let nextX = player.current.x
      let nextY = player.current.y

      if (keys.current.up) nextY -= speed
      if (keys.current.down) nextY += speed
      if (keys.current.left) nextX -= speed
      if (keys.current.right) nextX += speed

      // Axis-separated so sliding along a coastline still works
      if (isWalkable(sampleWorld(seeds.current, nextX, player.current.y))) {
        player.current.x = nextX
      }
      if (isWalkable(sampleWorld(seeds.current, player.current.x, nextY))) {
        player.current.y = nextY
      }

      // --- draw ---
      const cols = Math.ceil(width / tileSize) + 2
      const rows = Math.ceil(height / tileSize) + 2

      const originX = Math.floor(player.current.x - cols / 2)
      const originY = Math.floor(player.current.y - rows / 2)

      // Sub-tile offset keeps scrolling smooth rather than snapping
      const shiftX = (player.current.x - cols / 2 - originX) * tileSize
      const shiftY = (player.current.y - rows / 2 - originY) * tileSize

      ctx.clearRect(0, 0, width, height)

      const drawDetail = tileSize >= DETAIL_CUTOFF

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const worldX = originX + col
          const worldY = originY + row
          const sample = sampleWorld(seeds.current, worldX, worldY)

          const screenX = Math.floor(col * tileSize - shiftX)
          const screenY = Math.floor(row * tileSize - shiftY)
          const size = Math.ceil(tileSize) + 1

          ctx.fillStyle = sample.biome.colour
          ctx.fillRect(screenX, screenY, size, size)

          // Shade by elevation so relief reads even within one biome
          const shade = (sample.elevation - 0.5) * 0.34
          if (shade > 0.01) {
            ctx.fillStyle = `rgba(255,255,255,${Math.min(shade, 0.18)})`
            ctx.fillRect(screenX, screenY, size, size)
          } else if (shade < -0.01) {
            ctx.fillStyle = `rgba(0,0,0,${Math.min(-shade, 0.2)})`
            ctx.fillRect(screenX, screenY, size, size)
          }

          if (!drawDetail || sample.biome.detail === "none") continue

          // Decoration is itself seeded, so it never shimmers between frames
          const jitter = ((worldX * 73856093) ^ (worldY * 19349663)) >>> 0
          if (jitter % 5 !== 0) continue

          const dx = screenX + ((jitter >>> 4) % Math.max(1, Math.floor(tileSize)))
          const dy = screenY + ((jitter >>> 9) % Math.max(1, Math.floor(tileSize)))

          ctx.fillStyle = sample.biome.detailColour

          if (sample.biome.detail === "trees") {
            ctx.fillRect(dx, dy - tileSize * 0.18, Math.max(1, tileSize * 0.16), tileSize * 0.34)
          } else if (sample.biome.detail === "rocks") {
            ctx.fillRect(dx, dy, Math.max(1, tileSize * 0.2), Math.max(1, tileSize * 0.14))
          } else if (sample.biome.detail === "waves") {
            ctx.fillRect(dx, dy, Math.max(1, tileSize * 0.34), 1)
          } else {
            ctx.fillRect(dx, dy, Math.max(1, tileSize * 0.1), Math.max(1, tileSize * 0.2))
          }
        }
      }

      // --- the player, always dead centre ---
      const cx = width / 2
      const cy = height / 2
      const bodyRadius = Math.max(3, tileSize * 0.3)

      ctx.beginPath()
      ctx.arc(cx, cy + 1, bodyRadius * 1.1, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0,0,0,0.35)"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx, cy, bodyRadius, 0, Math.PI * 2)
      ctx.fillStyle = "oklch(88% 0.21 122)"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx, cy, bodyRadius + 4, 0, Math.PI * 2)
      ctx.strokeStyle = "oklch(88% 0.21 122 / 0.35)"
      ctx.lineWidth = 1
      ctx.stroke()

      // --- readout, throttled well below frame rate ---
      sinceReadout += delta
      if (sinceReadout > 0.15) {
        sinceReadout = 0
        standingSet({
          ...sampleWorld(seeds.current, player.current.x, player.current.y),
          x: Math.round(player.current.x),
          y: Math.round(player.current.y),
        })
      }

      frameId = requestAnimationFrame(frame)
    }

    frameId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [])

  const applySeed = useCallback(() => {
    const cleaned = draftSeed.trim().toLowerCase()
    if (cleaned.length === 0) return
    seedSet(cleaned)
  }, [draftSeed])

  const legendEntries = Object.values(biomes)

  return (
    <main className={styles.page}>
      <div ref={wrapRef} className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      {/* ---- Overlay chrome --------------------------------------------- */}
      <header className={styles.topBar}>
        <Link href="/fun" className={styles.back}>← Playground</Link>

        <div className={styles.seedBox}>
          <label className="label labelPlain" htmlFor="seed">Seed</label>

          <input
            id="seed"
            value={draftSeed}
            spellCheck={false}
            onChange={e => draftSeedSet(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") applySeed()
            }}
          />

          <button type="button" className="btn btnSm" onClick={applySeed}>
            <span>Generate</span>
          </button>

          <button
            type="button"
            className="btn btnSm"
            onClick={() => {
              const next = randomSeed()
              draftSeedSet(next)
              seedSet(next)
            }}
          >
            <span>Random</span>
          </button>
        </div>
      </header>

      <aside className={styles.readout}>
        <p className="label labelSignal">Standing on</p>

        <p className={styles.biomeName}>{standing?.biome.name ?? "—"}</p>

        <dl>
          <div>
            <dt>Position</dt>
            <dd className="readout">
              {standing ? `${standing.x}, ${standing.y}` : "—"}
            </dd>
          </div>
          <div>
            <dt>Elevation</dt>
            <dd className="readout">{standing ? standing.elevation.toFixed(3) : "—"}</dd>
          </div>
          <div>
            <dt>Moisture</dt>
            <dd className="readout">{standing ? standing.moisture.toFixed(3) : "—"}</dd>
          </div>
          <div>
            <dt>Temperature</dt>
            <dd className="readout">{standing ? standing.temperature.toFixed(3) : "—"}</dd>
          </div>
        </dl>

        <p className={styles.note}>
          Nothing here is stored. Every tile is a pure function of the seed and
          its coordinates, so the world is infinite and identical every time.
        </p>
      </aside>

      <footer className={styles.bottomBar}>
        <p className={styles.keys}>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move
          <span>·</span>
          <kbd>Shift</kbd> sprint
        </p>

        <label className={styles.zoom}>
          <span className="label labelPlain">Zoom</span>
          <input
            type="range"
            min={0.35}
            max={3}
            step={0.1}
            value={zoom}
            onChange={e => zoomSet(Number(e.target.value))}
          />
          <span className="readout">{zoom.toFixed(1)}×</span>
        </label>

        <button
          type="button"
          className="btn btnSm"
          onClick={() => showLegendSet(prev => !prev)}
        >
          <span>{showLegend ? "Hide" : "Show"} biomes</span>
        </button>
      </footer>

      {showLegend && (
        <ul className={styles.legend}>
          {legendEntries.map(eachBiome => (
            <li key={eachBiome.id} data-active={standing?.biome.id === eachBiome.id}>
              <span style={{ background: eachBiome.colour }} />
              {eachBiome.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
