"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import styles from "./luckRanked.module.css"

/* ============================================================================
   LUCK RANKED

   Pick a tile. The winning tile is chosen at the moment you click, not before —
   so there is nothing on the page to read, nothing to track, and no way to be
   good at this. That is deliberate. Every other guessing game quietly rewards
   attention; this one measures nothing but luck, which is the only honest way
   to rank it.

   Win and another tile joins the board, so the odds get worse the better you
   are doing: 1 in 3, then 1 in 4, then 1 in 5, up to 1 in 50. A streak of six
   here is a genuinely rare thing rather than a sign you were paying attention.

   The scoreboard is the point. Because the odds change every round, "40%
   correct" means nothing on its own — so it also tracks how many hits pure
   chance would have produced across exactly the rounds you played, and how
   many standard deviations you are from it. That number is your luck.

   (If you want the version where skill is possible, the shell game next door
   places the ball before the shuffle: /fun/shellGame)
   ========================================================================= */

const MAX_COLUMNS = 10
const MAX_ROWS = 5
const MAX_TILES = MAX_COLUMNS * MAX_ROWS
const START_TILES = 3
const REVEAL_MS = 900

/* The grid grows with the board rather than always being 10 x 5, so three
   tiles are three big tiles instead of three small ones in a corner. It ends
   up exactly 10 x 5 at fifty, which is the cap. */
function gridFor(count: number) {
  const columns = Math.min(MAX_COLUMNS, Math.max(1, Math.ceil(Math.sqrt(count * (MAX_COLUMNS / MAX_ROWS)))))
  const rows = Math.max(1, Math.ceil(count / columns))
  return { columns, rows }
}

type tile = {
  id: number
  label: number
  hue: number
  /** Where it sits in the grid, as [column, row]. */
  slot: [number, number]
  /** Each tile slides at its own speed, which is what sells the shuffle. */
  speed: number
}

type round = { tiles: number; correct: boolean }

function slotFor(index: number, columns: number): [number, number] {
  return [index % columns, Math.floor(index / columns)]
}

/* Hue comes from the index by the golden angle rather than from Math.random():
   the first render happens on the server, and a random colour there would not
   match the one the browser picks, which React reports as a hydration
   mismatch. Every tile still gets its own colour, and no two adjacent ones
   collide. The random slide speeds are applied on the first shuffle instead,
   which is after hydration. */
const GOLDEN_ANGLE = 137.508

function makeTile(index: number, columns: number): tile {
  return {
    id: index,
    label: index + 1,
    hue: Math.round((index * GOLDEN_ANGLE + 210) % 360),
    slot: slotFor(index, columns),
    speed: 1200,
  }
}

function shuffled<T>(input: T[]) {
  const output = [...input]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[output[index], output[swap]] = [output[swap], output[index]]
  }
  return output
}

export default function Page() {
  const [tiles, tilesSet] = useState<tile[]>(() =>
    Array.from({ length: START_TILES }, (unused, eachIndex) =>
      makeTile(eachIndex, gridFor(START_TILES).columns),
    ),
  )
  const [history, historySet] = useState<round[]>([])
  const [streak, streakSet] = useState(0)
  const [best, bestSet] = useState(0)
  const [reveal, revealSet] = useState<{ picked: number; winner: number } | null>(null)
  const [locked, lockedSet] = useState(false)

  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      for (const eachTimer of timers.current) window.clearTimeout(eachTimer)
    },
    [],
  )

  /* ---- One guess ----------------------------------------------------------
     This is the whole game, and the order of the two lines below is the
     entire design: the winner does not exist until after the pick. */
  const guess = useCallback(
    (pickedId: number) => {
      if (locked) return

      const winnerId = tiles[Math.floor(Math.random() * tiles.length)].id
      const correct = pickedId === winnerId

      lockedSet(true)
      revealSet({ picked: pickedId, winner: winnerId })
      historySet(previous => [...previous, { tiles: tiles.length, correct }])

      if (correct) {
        streakSet(previous => {
          const next = previous + 1
          bestSet(current => Math.max(current, next))
          return next
        })
      } else {
        streakSet(0)
      }

      timers.current.push(
        window.setTimeout(() => {
          revealSet(null)
          lockedSet(false)

          tilesSet(previous => {
            // A correct guess makes the next one harder, which is the only
            // consequence a game of pure chance can honestly hand out.
            const nextCount =
              correct && previous.length < MAX_TILES ? previous.length + 1 : previous.length
            const { columns } = gridFor(nextCount)

            const grown =
              nextCount > previous.length
                ? [...previous, makeTile(previous.length, columns)]
                : previous

            // Reshuffle which tile sits in which slot
            const slots = shuffled(grown.map((unused, eachIndex) => slotFor(eachIndex, columns)))

            return grown.map((eachTile, eachIndex) => ({
              ...eachTile,
              slot: slots[eachIndex],
              speed: 900 + Math.floor(Math.random() * 700),
            }))
          })
        }, REVEAL_MS),
      )
    },
    [locked, tiles],
  )

  /* ---- Ranking the luck --------------------------------------------------
     Each round had its own odds, so the baseline is the sum of them, and the
     spread is the sum of their variances. Everything below is that. */
  const stats = useMemo(() => {
    const attempts = history.length
    const hits = history.filter(eachRound => eachRound.correct).length

    let expected = 0
    let variance = 0

    for (const eachRound of history) {
      const chance = 1 / eachRound.tiles
      expected += chance
      variance += chance * (1 - chance)
    }

    const z = variance > 0 ? (hits - expected) / Math.sqrt(variance) : 0

    return {
      attempts,
      hits,
      expected,
      rate: attempts === 0 ? 0 : hits / attempts,
      chance: attempts === 0 ? 0 : expected / attempts,
      z,
    }
  }, [history])

  const rank = useMemo(() => {
    if (stats.attempts < 6) return { name: "Unranked", note: `${6 - stats.attempts} more rounds` }
    if (stats.z >= 2.5) return { name: "Uncanny", note: "This should not be happening" }
    if (stats.z >= 1.5) return { name: "Blessed", note: "Well above what chance owes you" }
    if (stats.z >= 0.5) return { name: "Fortunate", note: "Comfortably ahead" }
    if (stats.z > -0.5) return { name: "Ordinary", note: "Exactly as arbitrary as expected" }
    if (stats.z > -1.5) return { name: "Unlucky", note: "Behind, but within reason" }
    return { name: "Cursed", note: "Statistically, this is impressive" }
  }, [stats])

  const reset = () => {
    for (const eachTimer of timers.current) window.clearTimeout(eachTimer)
    timers.current = []
    tilesSet(
      Array.from({ length: START_TILES }, (unused, eachIndex) =>
        makeTile(eachIndex, gridFor(START_TILES).columns),
      ),
    )
    historySet([])
    streakSet(0)
    bestSet(0)
    revealSet(null)
    lockedSet(false)
  }

  const odds = `1 in ${tiles.length}`
  const grid = gridFor(tiles.length)

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>
        <p className="label labelPlain labelSignal">
          The winner is drawn after you click. There is nothing to read.
        </p>
      </header>

      <section className={styles.stage}>
        <div className={styles.prompt}>
          <p className={styles.promptLine} data-state={reveal === null ? "asking" : reveal.picked === reveal.winner ? "hit" : "miss"}>
            {reveal === null
              ? "Pick one."
              : reveal.picked === reveal.winner
                ? "That was it."
                : "It was the other one."}
          </p>

          <p className={styles.odds}>
            <span className="readout">{odds}</span>
            <span className={styles.sep}>·</span>
            streak <span className="readout">{streak}</span>
            <span className={styles.sep}>·</span>
            best <span className="readout">{best}</span>
          </p>
        </div>

        <div
          className={styles.board}
          style={{ "--columns": grid.columns, "--rows": grid.rows } as React.CSSProperties}
        >
          {tiles.map(eachTile => {
            const state =
              reveal === null
                ? "idle"
                : eachTile.id === reveal.winner
                  ? "winner"
                  : eachTile.id === reveal.picked
                    ? "wrong"
                    : "dim"

            return (
              <button
                key={eachTile.id}
                type="button"
                className={styles.tile}
                data-state={state}
                disabled={locked}
                style={{
                  "--column": eachTile.slot[0],
                  "--row": eachTile.slot[1],
                  "--hue": eachTile.hue,
                  "--speed": `${eachTile.speed}ms`,
                } as React.CSSProperties}
                onClick={() => guess(eachTile.id)}
                aria-label={`Tile ${eachTile.label}`}
              >
                <span>{eachTile.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className={styles.scoreboard}>
        <div className={styles.figures}>
          <Figure label="Rounds" value={String(stats.attempts)} />
          <Figure label="Hits" value={String(stats.hits)} />
          <Figure
            label="Chance owed you"
            value={stats.attempts === 0 ? "—" : stats.expected.toFixed(2)}
            muted
          />
          <Figure
            label="Your rate"
            value={stats.attempts === 0 ? "—" : `${Math.round(stats.rate * 100)}%`}
          />
        </div>

        <div className={styles.rank} data-tier={rank.name.toLowerCase()}>
          <p className="label labelPlain">Luck rank</p>
          <p className={styles.rankName}>{rank.name}</p>
          <p className={styles.rankNote}>{rank.note}</p>
          <p className={`readout ${styles.z}`}>
            z = {stats.z >= 0 ? "+" : ""}{stats.z.toFixed(2)}
          </p>
        </div>

        <div className={styles.asideNote}>
          <p>
            Every round is decided the instant you click, so no amount of
            attention changes anything. The rank compares your hits against the
            number pure chance owed you across exactly the odds you faced.
          </p>
          <div className={styles.asideActions}>
            <button type="button" className="btn btnSm" onClick={reset}>
              <span>Reset</span>
            </button>
            <Link href="/fun/shellGame" className="btn btnSm">
              <span>Want it to be skill?</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function Figure({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={styles.figure} data-muted={muted}>
      <p className="readout">{value}</p>
      <p>{label}</p>
    </div>
  )
}
