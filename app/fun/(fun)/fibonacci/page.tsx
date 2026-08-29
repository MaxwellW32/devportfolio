"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import styles from "./fibonacci.module.css"

/* ============================================================================
   FIBONACCI — the claim, and the proof

   The goal I set myself: show *why* the Fibonacci sequence and the golden
   ratio are the same fact.

   Take consecutive terms and divide them. The ratio oscillates — over, under,
   over, under — and the error halves-ish each time. It converges on φ, and it
   does so fast enough that by term 20 you cannot see the difference.

   The tiling is the same statement drawn instead of computed: squares of
   Fibonacci side lengths fill a rectangle with no gaps and no overlaps, and
   that rectangle is F(n) by F(n+1) — so its aspect ratio IS the ratio in the
   panel beside it. Both halves of the page are one claim.
   ========================================================================= */

const PHI = (1 + Math.sqrt(5)) / 2

/** Fibonacci as BigInt so the sequence stays exact well past 2^53. */
function buildSequence(count: number) {
  const values: bigint[] = [0n, 1n]
  for (let i = 2; i < count; i++) {
    values.push(values[i - 1] + values[i - 2])
  }
  return values
}

/** Ratio of consecutive terms, taken in floating point for display. */
function ratioAt(values: bigint[], index: number) {
  if (index < 2) return null
  const previous = values[index - 1]
  if (previous === 0n) return null

  // Divide as numbers where safe, else scale the BigInt division up first
  const a = values[index]
  const b = previous

  if (a < Number.MAX_SAFE_INTEGER) return Number(a) / Number(b)

  const SCALE = 1_000_000_000_000n
  return Number((a * SCALE) / b) / 1e12
}

function formatBig(value: bigint) {
  const text = value.toString()
  if (text.length <= 18) return text.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  // Past a point the digits stop meaning anything — show magnitude instead
  return `${text[0]}.${text.slice(1, 5)}e+${text.length - 1}`
}

const MAX_TERMS = 90

export default function Page() {
  const [index, indexSet] = useState(2)
  const [playing, playingSet] = useState(true)
  const [speed, speedSet] = useState(600)

  const sequence = useMemo(() => buildSequence(MAX_TERMS), [])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  /* ---- Advance the sequence -------------------------------------------- */
  useEffect(() => {
    if (!playing) return

    const timer = setInterval(() => {
      indexSet(prev => (prev >= MAX_TERMS - 1 ? 2 : prev + 1))
    }, speed)

    return () => clearInterval(timer)
  }, [playing, speed])

  /* ---- Draw the tiling --------------------------------------------------
     Squares of Fibonacci side lengths tile a rectangle exactly, with no gaps
     and no overlaps. Each new square attaches to the long side of what is
     already there, rotating right → down → left → up.

     The payoff: that rectangle's width-to-height ratio IS the ratio of two
     consecutive Fibonacci numbers. So the picture and the number in the panel
     beside it are the same statement, and both walk toward φ.
     -------------------------------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const ctx = canvas.getContext("2d")
    if (ctx === null) return

    // Past ~13 terms the smallest squares are sub-pixel — nothing left to see
    const depth = Math.min(index, 13)

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)

      type square = { x: number; y: number; size: number }
      const squares: square[] = []

      let minX = 0
      let minY = 0
      let maxX = 0
      let maxY = 0

      for (let i = 1; i <= depth; i++) {
        const size = Number(sequence[i])
        if (size === 0) continue

        if (squares.length === 0) {
          squares.push({ x: 0, y: 0, size })
          maxX = size
          maxY = size
          continue
        }

        // right → down → left → up, so the rectangle grows in both axes
        const direction = (squares.length - 1) % 4

        if (direction === 0) {
          squares.push({ x: maxX, y: minY, size })
          maxX += size
        } else if (direction === 1) {
          squares.push({ x: minX, y: maxY, size })
          maxY += size
        } else if (direction === 2) {
          squares.push({ x: minX - size, y: minY, size })
          minX -= size
        } else {
          squares.push({ x: minX, y: minY - size, size })
          minY -= size
        }
      }

      const spanX = Math.max(maxX - minX, 1)
      const spanY = Math.max(maxY - minY, 1)
      const padding = 22
      const scale = Math.min(
        (rect.width - padding * 2) / spanX,
        (rect.height - padding * 2) / spanY,
      )

      const offsetX = padding + (rect.width - padding * 2 - spanX * scale) / 2 - minX * scale
      const offsetY = padding + (rect.height - padding * 2 - spanY * scale) / 2 - minY * scale

      const toScreenX = (px: number) => offsetX + px * scale
      const toScreenY = (py: number) => offsetY + py * scale

      // --- the squares, newest brightest ---
      squares.forEach((eachSquare, eachIndex) => {
        const x = toScreenX(eachSquare.x)
        const y = toScreenY(eachSquare.y)
        const size = eachSquare.size * scale
        const freshness = eachIndex / Math.max(squares.length - 1, 1)

        ctx.fillStyle = `oklch(88% 0.21 122 / ${0.04 + freshness * 0.13})`
        ctx.fillRect(x, y, size, size)

        ctx.strokeStyle = `oklch(88% 0.21 122 / ${0.3 + freshness * 0.5})`
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, size, size)

        // Label the side while the square is still big enough to read
        if (size > 30) {
          ctx.fillStyle = "oklch(96% 0.006 90 / 0.8)"
          ctx.font = "500 11px ui-monospace, monospace"
          ctx.fillText(String(eachSquare.size), x + 6, y + 17)
        }
      })

      // --- the enclosing rectangle, which is what converges ---
      ctx.strokeStyle = "oklch(96% 0.006 90 / 0.55)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 4])
      ctx.strokeRect(toScreenX(minX), toScreenY(minY), spanX * scale, spanY * scale)
      ctx.setLineDash([])
    }

    draw()
    window.addEventListener("resize", draw)
    return () => window.removeEventListener("resize", draw)
  }, [index, sequence])

  /* ---- Readouts --------------------------------------------------------- */
  const ratio = ratioAt(sequence, index)
  const error = ratio === null ? null : Math.abs(ratio - PHI)

  // The last twelve ratios, for the convergence strip
  const history = useMemo(() => {
    const out: { term: number; ratio: number }[] = []
    for (let i = Math.max(2, index - 11); i <= index; i++) {
      const r = ratioAt(sequence, i)
      if (r !== null) out.push({ term: i, ratio: r })
    }
    return out
  }, [index, sequence])

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>

        <div>
          <p className="label labelSignal">Convergence</p>
          <h1 className={styles.title}>Fibonacci → φ</h1>
          <p className={styles.lede}>
            Divide each term by the one before it. The answer overshoots, then
            undershoots, then overshoots by less — closing on the golden ratio.
            The tiling beside it is the same fact drawn: squares of Fibonacci sides fill a rectangle whose proportions are that very ratio.
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        {/* ---- Spiral ---------------------------------------------------- */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <span className="label labelPlain">Fibonacci square tiling</span>
            <span className="readout">n ≤ {Math.min(index, 12)}</span>
          </div>

          <div className={styles.canvasWrap}>
            <canvas ref={canvasRef} className={styles.canvas} />
          </div>
        </section>

        {/* ---- Numbers --------------------------------------------------- */}
        <section className={styles.side}>
          <div className={styles.readoutCard}>
            <p className="label labelPlain">Term {index}</p>
            <p className={styles.big}>{formatBig(sequence[index])}</p>
            <p className={styles.sub}>
              {formatBig(sequence[index - 1])} + {formatBig(sequence[index - 2])}
            </p>
          </div>

          <div className={styles.readoutCard}>
            <p className="label labelPlain">Ratio to previous</p>
            <p className={styles.big} data-signal>
              {ratio === null ? "—" : ratio.toFixed(12)}
            </p>
            <p className={styles.sub}>φ = {PHI.toFixed(12)}</p>
          </div>

          <div className={styles.readoutCard}>
            <p className="label labelPlain">Absolute error</p>
            <p className={styles.big} data-dim>
              {error === null ? "—" : error < 1e-12 ? "< 1e-12" : error.toExponential(3)}
            </p>
            <p className={styles.sub}>
              {error !== null && error < 1e-12
                ? "Indistinguishable at double precision"
                : "Halving roughly every step"}
            </p>
          </div>

          {/* Convergence strip: bars alternate above and below φ */}
          <div className={styles.convergence}>
            <p className="label labelPlain">Last 12 ratios</p>

            <ul>
              {history.map(eachEntry => {
                const delta = eachEntry.ratio - PHI
                const magnitude = Math.min(Math.abs(delta) / 0.05, 1) * 50
                return (
                  <li key={eachEntry.term} title={`n=${eachEntry.term} · ${eachEntry.ratio.toFixed(9)}`}>
                    <span
                      data-side={delta >= 0 ? "over" : "under"}
                      style={{ height: `${Math.max(magnitude, 1.5)}%` }}
                    />
                  </li>
                )
              })}
            </ul>

            <p className={styles.axis}>
              <span>over φ</span>
              <span>under φ</span>
            </p>
          </div>
        </section>
      </div>

      {/* ---- Controls ---------------------------------------------------- */}
      <div className={styles.controls}>
        <button type="button" className="btn btnSm" onClick={() => playingSet(prev => !prev)}>
          <span>{playing ? "Pause" : "Play"}</span>
        </button>

        <button
          type="button"
          className="btn btnSm"
          onClick={() => {
            playingSet(false)
            indexSet(prev => Math.max(2, prev - 1))
          }}
        >
          <span>Step back</span>
        </button>

        <button
          type="button"
          className="btn btnSm"
          onClick={() => {
            playingSet(false)
            indexSet(prev => Math.min(MAX_TERMS - 1, prev + 1))
          }}
        >
          <span>Step</span>
        </button>

        <button type="button" className="btn btnSm" onClick={() => indexSet(2)}>
          <span>Reset</span>
        </button>

        <label className={styles.speed}>
          <span className="label labelPlain">Speed</span>
          <input
            type="range"
            min={80}
            max={1200}
            step={20}
            value={1280 - speed}
            onChange={e => speedSet(1280 - Number(e.target.value))}
          />
        </label>
      </div>
    </main>
  )
}
