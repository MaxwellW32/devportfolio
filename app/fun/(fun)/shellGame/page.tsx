"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import styles from "./luck.module.css"

/* ============================================================================
   LUCK RANKED — can you actually follow a shuffle?

   The version of this I wrote first chose the winning cup at the moment you
   clicked. It felt like a game, it kept a score, and the score meant nothing:
   the answer did not exist until after the guess, so skill could not affect
   it. It was a random number generator with cups drawn on it.

   Here the ball is placed before the shuffle and moves with its cup through
   every swap, so following it is genuinely possible — and the scoreboard says
   whether you are doing it. Guessing at random on three cups gets a third of
   them right, so "62% correct" is meaningless on its own. The number that
   means something is how far above chance you are and whether that gap is
   larger than the noise, which is what the z-score at the bottom reports.
   ========================================================================= */

type phase = "ready" | "showing" | "shuffling" | "guessing" | "revealed"

type cup = {
  id: number
  slot: number
}

type round = {
  cups: number
  correct: boolean
}

const MIN_CUPS = 3
const MAX_CUPS = 7
const SHOW_MS = 900
const REVEAL_MS = 1400

/** Difficulty rises with the streak: more cups, more swaps, faster. */
function difficultyFor(streak: number) {
  const cups = Math.min(MAX_CUPS, MIN_CUPS + Math.floor(streak / 2))
  const swaps = 4 + Math.floor(streak * 1.5)
  const swapMs = Math.max(160, 460 - streak * 26)
  return { cups, swaps, swapMs }
}

export default function Page() {
  const [phase, phaseSet] = useState<phase>("ready")
  const [cups, cupsSet] = useState<cup[]>([])
  const [ballCup, ballCupSet] = useState<number | null>(null)
  const [picked, pickedSet] = useState<number | null>(null)
  const [streak, streakSet] = useState(0)
  const [best, bestSet] = useState(0)
  const [history, historySet] = useState<round[]>([])

  const timers = useRef<number[]>([])

  const difficulty = useMemo(() => difficultyFor(streak), [streak])

  const clearTimers = useCallback(() => {
    for (const eachTimer of timers.current) window.clearTimeout(eachTimer)
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const after = useCallback((delay: number, action: () => void) => {
    timers.current.push(window.setTimeout(action, delay))
  }, [])

  /* ---- A round ------------------------------------------------------------
     The ball goes under a cup, that cup is shown, then the cups swap places in
     a sequence the player can follow. The ball never moves on its own. */
  const startRound = useCallback(() => {
    clearTimers()

    const { cups: cupCount, swaps, swapMs } = difficultyFor(streak)

    const fresh: cup[] = Array.from({ length: cupCount }, (unused, eachIndex) => ({
      id: eachIndex,
      slot: eachIndex,
    }))

    const hiding = Math.floor(Math.random() * cupCount)

    cupsSet(fresh)
    ballCupSet(hiding)
    pickedSet(null)
    phaseSet("showing")

    // Precompute the swaps so the animation is a replay of a decided sequence
    // rather than something being invented while it plays.
    const sequence: [number, number][] = []
    for (let index = 0; index < swaps; index += 1) {
      const a = Math.floor(Math.random() * cupCount)
      let b = Math.floor(Math.random() * cupCount)
      if (b === a) b = (a + 1 + Math.floor(Math.random() * (cupCount - 1))) % cupCount
      sequence.push([a, b])
    }

    after(SHOW_MS, () => {
      phaseSet("shuffling")

      sequence.forEach(([slotA, slotB], eachIndex) => {
        after(eachIndex * swapMs, () => {
          cupsSet(previous =>
            previous.map(eachCup => {
              if (eachCup.slot === slotA) return { ...eachCup, slot: slotB }
              if (eachCup.slot === slotB) return { ...eachCup, slot: slotA }
              return eachCup
            }),
          )
        })
      })

      after(sequence.length * swapMs + 320, () => phaseSet("guessing"))
    })
  }, [after, clearTimers, streak])

  const guess = (cupId: number) => {
    if (phase !== "guessing") return

    const correct = cupId === ballCup

    pickedSet(cupId)
    phaseSet("revealed")
    historySet(previous => [...previous, { cups: cups.length, correct }])

    if (correct) {
      streakSet(previous => {
        const next = previous + 1
        bestSet(current => Math.max(current, next))
        return next
      })
    } else {
      streakSet(0)
    }

    after(REVEAL_MS, startRound)
  }

  /* ---- The scoreboard -----------------------------------------------------
     Every round has its own chance of a lucky hit — one in three with three
     cups, one in seven with seven — so the baseline is the sum of those, not a
     single number. The z-score is the gap between what you got and what luck
     would have got, measured in standard deviations of that sum. */
  const stats = useMemo(() => {
    const attempts = history.length
    const hits = history.filter(eachRound => eachRound.correct).length

    let expected = 0
    let variance = 0

    for (const eachRound of history) {
      const chance = 1 / eachRound.cups
      expected += chance
      variance += chance * (1 - chance)
    }

    const z = variance > 0 ? (hits - expected) / Math.sqrt(variance) : 0

    return {
      attempts,
      hits,
      rate: attempts === 0 ? 0 : hits / attempts,
      chance: attempts === 0 ? 0 : expected / attempts,
      z,
      // Two standard deviations is the usual line for "this is not luck"
      convincing: attempts >= 8 && z >= 1.96,
    }
  }, [history])

  const reset = () => {
    clearTimers()
    historySet([])
    streakSet(0)
    bestSet(0)
    phaseSet("ready")
    cupsSet([])
    ballCupSet(null)
    pickedSet(null)
  }

  const message: Record<phase, string> = {
    ready: "The ball goes under a cup, then the cups move. Follow it.",
    showing: "Here it is.",
    shuffling: "Keep your eye on it…",
    guessing: "Where is it?",
    revealed: picked === ballCup ? "Correct." : "Not that one.",
  }

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>
        <p className="label labelPlain labelSignal">
          The ball is placed before the shuffle, not after your guess
        </p>
      </header>

      <section className={styles.stage}>
        <p className={styles.message} data-phase={phase}>{message[phase]}</p>

        {phase === "ready" ? (
          <button type="button" className="btn btnPrimary" onClick={startRound}>
            <span>Start</span>
          </button>
        ) : (
          <div
            className={styles.table}
            style={{ "--cups": cups.length } as React.CSSProperties}
          >
            {cups.map(eachCup => {
              const holdsBall = eachCup.id === ballCup
              // Only the cup with the ball goes up at the start — lifting all of
              // them gives the game away and looks like a bug.
              const lifted =
                (phase === "showing" && holdsBall) ||
                (phase === "revealed" && (holdsBall || eachCup.id === picked))

              return (
                <button
                  key={eachCup.id}
                  type="button"
                  className={styles.cup}
                  style={{ "--slot": eachCup.slot } as React.CSSProperties}
                  data-lifted={lifted}
                  data-shuffling={phase === "shuffling"}
                  data-guessable={phase === "guessing"}
                  data-picked={eachCup.id === picked}
                  data-wrong={phase === "revealed" && eachCup.id === picked && !holdsBall}
                  onClick={() => guess(eachCup.id)}
                  aria-label={`Cup ${eachCup.slot + 1}`}
                >
                  <span className={styles.ball} data-on={holdsBall} aria-hidden="true" />
                  <span className={styles.shell} aria-hidden="true" />
                </button>
              )
            })}
          </div>
        )}

        <div className={styles.streak}>
          <span className="label labelPlain">Streak</span>
          <span className="readout">{streak}</span>
          <span className={styles.sep}>·</span>
          <span className="label labelPlain">Best</span>
          <span className="readout">{best}</span>
          <span className={styles.sep}>·</span>
          <span className="label labelPlain">Cups</span>
          <span className="readout">{difficulty.cups}</span>
        </div>
      </section>

      <section className={styles.scoreboard}>
        <div className={styles.figures}>
          <Figure label="Rounds" value={String(stats.attempts)} />
          <Figure label="Correct" value={String(stats.hits)} />
          <Figure
            label="Your rate"
            value={stats.attempts === 0 ? "—" : `${Math.round(stats.rate * 100)}%`}
          />
          <Figure
            label="Chance would get"
            value={stats.attempts === 0 ? "—" : `${Math.round(stats.chance * 100)}%`}
            muted
          />
        </div>

        <div className={styles.verdict} data-convincing={stats.convincing}>
          <p className="label labelPlain">Is it skill?</p>

          <p className={styles.verdictText}>
            {stats.attempts < 8
              ? `Not enough rounds to tell. ${8 - stats.attempts} more.`
              : stats.convincing
                ? "Yes — you are beating chance by more than two standard deviations."
                : stats.z >= 0
                  ? "Ahead of chance, but not by more than the noise yet."
                  : "Behind what guessing at random would have got."}
          </p>

          <p className={`readout ${styles.z}`}>
            z = {stats.z >= 0 ? "+" : ""}{stats.z.toFixed(2)}
          </p>
        </div>

        <button type="button" className="btn btnSm" onClick={reset}>
          <span>Reset the record</span>
        </button>
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
