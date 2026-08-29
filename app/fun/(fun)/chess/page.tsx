"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  BISHOP,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  START_FEN,
  WHITE,
  colorOf,
  evaluateOutcome,
  findMove,
  generateMoves,
  makeMove,
  moveToSan,
  parseFen,
  repetitionKey,
  squareAt,
  toFen,
  typeOf,
  type color,
  type move,
} from "./engine"
import { chooseMove, type difficulty } from "./ai"
import styles from "./chess.module.css"

/* ============================================================================
   CHESS

   The rules live in engine.ts and are verified by perft — the standard node
   counts for six reference positions, matched exactly to depth four and five.
   That is the only way to know a move generator is right; a chess board that
   looks correct while quietly allowing an illegal en-passant is the normal
   outcome of writing one by eye.

   This file is only the board: picking pieces up, drawing what is legal, and
   handing turns to the opponent in ai.ts.
   ========================================================================= */

const PIECE_IMAGE: Record<number, string> = {
  [PAWN]: "pawn",
  [KNIGHT]: "knight",
  [BISHOP]: "bishop",
  [ROOK]: "rook",
  [QUEEN]: "queen",
  [KING]: "king",
}

const PIECE_VALUE: Record<number, number> = {
  [PAWN]: 1,
  [KNIGHT]: 3,
  [BISHOP]: 3,
  [ROOK]: 5,
  [QUEEN]: 9,
  [KING]: 0,
}

const DIFFICULTY_LABEL: Record<difficulty, string> = {
  friendly: "Friendly",
  club: "Club",
  sharp: "Sharp",
}

type opponent = "computer" | "human"

type engineReadout = { depth: number; ms: number; nodes: number; score: number } | null

export default function Page() {
  /* ---- Game state ---------------------------------------------------------
     The game is a list of positions rather than a mutated board. Undo is a
     pop, browsing the history is an index, and there is no way for the board
     on screen to drift out of step with the rules. */
  const [fens, fensSet] = useState<string[]>([START_FEN])
  const [sans, sansSet] = useState<string[]>([])
  const [viewIndex, viewIndexSet] = useState(0)

  const [flipped, flippedSet] = useState(false)
  const [opponent, opponentSet] = useState<opponent>("computer")
  const [level, levelSet] = useState<difficulty>("club")
  const [humanSide, humanSideSet] = useState<color>(WHITE)

  const [selected, selectedSet] = useState(-1)
  const [pending, pendingSet] = useState<{ from: number; to: number } | null>(null)
  const [readout, readoutSet] = useState<engineReadout>(null)

  const boardRef = useRef<HTMLDivElement | null>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ from: number; pointerId: number } | null>(null)
  const [dragFrom, dragFromSet] = useState(-1)

  /* ---- Derived ----------------------------------------------------------- */
  const liveIndex = fens.length - 1
  const atLive = viewIndex === liveIndex

  const viewing = useMemo(() => parseFen(fens[viewIndex]), [fens, viewIndex])

  const repetitions = useMemo(() => {
    const counts = new Map<string, number>()
    for (let index = 0; index <= viewIndex; index += 1) {
      const key = repetitionKey(parseFen(fens[index]))
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [fens, viewIndex])

  const outcome = useMemo(() => evaluateOutcome(viewing, repetitions), [viewing, repetitions])
  const finished = outcome.kind !== "playing"

  const legalMoves = useMemo(() => generateMoves(viewing), [viewing])

  const humanToMove =
    atLive && !finished && (opponent === "human" || viewing.turn === humanSide)

  // "Thinking" is not a piece of state to keep in step — it is exactly the
  // condition under which the search effect below is running.
  const thinking = opponent === "computer" && atLive && !finished && !humanToMove

  const targets = useMemo(() => {
    if (selected < 0 || !humanToMove) return new Map<number, move[]>()

    const map = new Map<number, move[]>()
    for (const eachMove of legalMoves) {
      if (eachMove.from !== selected) continue
      const existing = map.get(eachMove.to)
      if (existing) existing.push(eachMove)
      else map.set(eachMove.to, [eachMove])
    }
    return map
  }, [legalMoves, selected, humanToMove])

  const lastMove = useMemo(() => {
    if (viewIndex === 0) return null
    const previous = parseFen(fens[viewIndex - 1])
    const played = generateMoves(previous).find(eachMove => {
      const copy = parseFen(fens[viewIndex - 1])
      const found = findMove(generateMoves(copy), eachMove.from, eachMove.to, eachMove.promotion)
      if (!found) return false
      makeMove(copy, found)
      return toFen(copy) === fens[viewIndex]
    })
    return played ?? null
  }, [fens, viewIndex])

  const material = useMemo(() => {
    const captured: { white: number[]; black: number[] } = { white: [], black: [] }
    const counts = new Map<number, number>()

    for (let square = 0; square < 128; square += 1) {
      if ((square & 0x88) !== 0) continue
      const piece = viewing.board[square]
      if (piece !== 0) counts.set(piece, (counts.get(piece) ?? 0) + 1)
    }

    const start: [number, number][] = [
      [PAWN, 8],
      [KNIGHT, 2],
      [BISHOP, 2],
      [ROOK, 2],
      [QUEEN, 1],
    ]

    let balance = 0

    for (const [eachType, eachCount] of start) {
      const whiteLeft = counts.get(eachType) ?? 0
      const blackLeft = counts.get(-eachType) ?? 0

      for (let index = 0; index < eachCount - whiteLeft; index += 1) captured.black.push(eachType)
      for (let index = 0; index < eachCount - blackLeft; index += 1) captured.white.push(eachType)

      balance += (whiteLeft - blackLeft) * PIECE_VALUE[eachType]
    }

    return { ...captured, balance }
  }, [viewing])

  /* ---- Playing a move ---------------------------------------------------- */
  const play = useCallback(
    (chosen: move) => {
      const next = parseFen(fens[fens.length - 1])
      const legal = findMove(generateMoves(next), chosen.from, chosen.to, chosen.promotion)
      if (legal === null) return

      const san = moveToSan(next, legal)
      makeMove(next, legal)

      fensSet(previous => {
        const updated = [...previous, toFen(next)]
        viewIndexSet(updated.length - 1)
        return updated
      })
      sansSet(previous => [...previous, san])
      selectedSet(-1)
      pendingSet(null)
    },
    [fens],
  )

  /* ---- The opponent ------------------------------------------------------ */
  const searchToken = useRef(0)

  useEffect(() => {
    if (opponent !== "computer") return
    if (!atLive || finished) return
    if (viewing.turn === humanSide) return

    const token = (searchToken.current += 1)

    // A beat's delay so the "thinking" state paints before the search — which
    // is synchronous — takes the main thread away for a second or two.
    const timer = window.setTimeout(() => {
      if (searchToken.current !== token) return

      const searchPosition = parseFen(fens[fens.length - 1])
      const result = chooseMove(searchPosition, level)

      if (searchToken.current !== token) return

      if (result.move !== null) {
        readoutSet({ depth: result.depth, ms: result.ms, nodes: result.nodes, score: result.score })
        play(result.move)
      }
    }, 60)

    return () => window.clearTimeout(timer)
  }, [opponent, atLive, finished, viewing.turn, humanSide, level, fens, play])

  /* ---- Choosing squares -------------------------------------------------- */
  const attemptMove = useCallback(
    (from: number, to: number) => {
      const options = legalMoves.filter(
        eachMove => eachMove.from === from && eachMove.to === to,
      )
      if (options.length === 0) return false

      if (options.length > 1 && options[0].promotion !== 0) {
        pendingSet({ from, to })
        return true
      }

      play(options[0])
      return true
    },
    [legalMoves, play],
  )

  const squareChosen = useCallback(
    (square: number) => {
      if (!humanToMove) return

      if (selected >= 0 && attemptMove(selected, square)) return

      const piece = viewing.board[square]
      if (piece !== 0 && colorOf(piece) === viewing.turn) {
        selectedSet(square === selected ? -1 : square)
      } else {
        selectedSet(-1)
      }
    },
    [humanToMove, selected, attemptMove, viewing],
  )

  /* ---- Dragging ----------------------------------------------------------
     Pointer events rather than HTML drag-and-drop: a drag image that follows
     the cursor exactly, and the same code path on mouse, pen and trackpad. */
  const squareFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const board = boardRef.current
      if (board === null) return -1

      const rect = board.getBoundingClientRect()
      const size = rect.width / 8

      let file = Math.floor((clientX - rect.left) / size)
      let rank = 7 - Math.floor((clientY - rect.top) / size)

      if (flipped) {
        file = 7 - file
        rank = 7 - rank
      }

      if (file < 0 || file > 7 || rank < 0 || rank > 7) return -1
      return squareAt(file, rank)
    },
    [flipped],
  )

  // One handler on the board rather than sixty-four on the squares: the square
  // is recoverable from the pointer position, and it is the same arithmetic
  // the drop already needs.
  const onPointerDown = (event: React.PointerEvent) => {
    if (!humanToMove) return

    const square = squareFromPoint(event.clientX, event.clientY)
    if (square < 0) return

    const piece = viewing.board[square]
    if (piece === 0 || colorOf(piece) !== viewing.turn) {
      squareChosen(square)
      return
    }

    selectedSet(square)
    dragRef.current = { from: square, pointerId: event.pointerId }
    dragFromSet(square)
    boardRef.current?.setPointerCapture(event.pointerId)
    moveGhost(event.clientX, event.clientY)
  }

  const moveGhost = (clientX: number, clientY: number) => {
    const ghost = ghostRef.current
    const board = boardRef.current
    if (ghost === null || board === null) return

    const rect = board.getBoundingClientRect()
    const size = rect.width / 8
    ghost.style.width = `${size}px`
    ghost.style.height = `${size}px`
    ghost.style.transform = `translate3d(${clientX - rect.left - size / 2}px, ${clientY - rect.top - size / 2}px, 0)`
  }

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragRef.current === null) return
    moveGhost(event.clientX, event.clientY)
  }

  const onPointerUp = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (drag === null) return

    dragRef.current = null
    dragFromSet(-1)
    boardRef.current?.releasePointerCapture(event.pointerId)

    const to = squareFromPoint(event.clientX, event.clientY)
    if (to < 0 || to === drag.from) return

    if (!attemptMove(drag.from, to)) selectedSet(-1)
  }

  /* ---- Controls ---------------------------------------------------------- */
  const newGame = (side: color = humanSide) => {
    searchToken.current += 1
    fensSet([START_FEN])
    sansSet([])
    viewIndexSet(0)
    selectedSet(-1)
    pendingSet(null)
    readoutSet(null)
    humanSideSet(side)
    flippedSet(side !== WHITE)
  }

  const takeBack = () => {
    searchToken.current += 1

    fensSet(previous => {
      let count = 1
      // Against the computer, one takeback should hand the move back to you,
      // not hand it straight back to the engine.
      if (opponent === "computer" && previous.length > 2) count = 2

      const updated = previous.slice(0, Math.max(1, previous.length - count))
      sansSet(list => list.slice(0, updated.length - 1))
      viewIndexSet(updated.length - 1)
      return updated
    })

    selectedSet(-1)
    pendingSet(null)
  }

  /* ---- History browsing -------------------------------------------------- */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        viewIndexSet(previous => Math.max(0, previous - 1))
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        viewIndexSet(previous => Math.min(liveIndex, previous + 1))
      } else if (event.key === "Home") {
        viewIndexSet(0)
      } else if (event.key === "End") {
        viewIndexSet(liveIndex)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [liveIndex])

  /* ---- Render ------------------------------------------------------------ */
  const files = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]
  const ranks = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]

  const checkedKing =
    outcome.kind === "checkmate"
      ? viewing.kings[viewing.turn]
      : outcome.kind === "playing" && outcome.check
        ? viewing.kings[viewing.turn]
        : -1

  const draggedPiece = dragFrom >= 0 ? viewing.board[dragFrom] : 0

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>

        <p className="label labelPlain labelSignal">
          Verified by perft to depth 5
        </p>
      </header>

      <div className={styles.layout}>
        {/* ---- Board -------------------------------------------------- */}
        <section className={styles.boardArea}>
          <PlayerStrip
            side={flipped ? WHITE : -1 as color}
            name={opponent === "human" ? "Black" : humanSide === WHITE ? DIFFICULTY_LABEL[level] : "You"}
            captured={flipped ? material.white : material.black}
            balance={flipped ? material.balance : -material.balance}
            toMove={viewing.turn === (flipped ? WHITE : -1)}
            thinking={thinking && viewing.turn === (flipped ? WHITE : -1)}
          />

          <div className={styles.boardFrame}>
            <div
              ref={boardRef}
              className={styles.board}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {ranks.map(eachRank =>
                files.map(eachFile => {
                  const square = squareAt(eachFile, eachRank)
                  const piece = viewing.board[square]
                  const light = (eachFile + eachRank) % 2 === 1

                  const isTarget = targets.has(square)
                  const isCapture = isTarget && piece !== 0

                  return (
                    <div
                      key={square}
                      className={styles.square}
                      data-light={light}
                      data-selected={square === selected}
                      data-from={lastMove !== null && lastMove.from === square}
                      data-to={lastMove !== null && lastMove.to === square}
                      data-check={square === checkedKing}
                    >
                      {eachFile === (flipped ? 7 : 0) && (
                        <span className={styles.rankLabel}>{eachRank + 1}</span>
                      )}
                      {eachRank === (flipped ? 7 : 0) && (
                        <span className={styles.fileLabel}>{"abcdefgh"[eachFile]}</span>
                      )}

                      {piece !== 0 && square !== dragFrom && (
                        <Image
                          className={styles.piece}
                          src={`/chess/${colorOf(piece) === WHITE ? "w" : "b"}${PIECE_IMAGE[typeOf(piece)]}.png`}
                          alt=""
                          width={90}
                          height={90}
                          draggable={false}
                          priority={typeOf(piece) === PAWN}
                        />
                      )}

                      {isTarget && <span className={styles.hint} data-capture={isCapture} />}
                    </div>
                  )
                }),
              )}

              {/* The piece being dragged, following the pointer exactly */}
              <div ref={ghostRef} className={styles.ghost} data-on={dragFrom >= 0}>
                {draggedPiece !== 0 && (
                  <Image
                    src={`/chess/${colorOf(draggedPiece) === WHITE ? "w" : "b"}${PIECE_IMAGE[typeOf(draggedPiece)]}.png`}
                    alt=""
                    width={90}
                    height={90}
                    draggable={false}
                  />
                )}
              </div>
            </div>

            {pending !== null && (
              <PromotionPicker
                side={viewing.turn}
                onPick={type => {
                  const chosen = findMove(legalMoves, pending.from, pending.to, type)
                  if (chosen !== null) play(chosen)
                  else pendingSet(null)
                }}
                onCancel={() => {
                  pendingSet(null)
                  selectedSet(-1)
                }}
              />
            )}

            {finished && atLive && (
              <div className={styles.result}>
                <p className={styles.resultTitle}>{outcomeTitle(outcome)}</p>
                <p className={styles.resultBody}>{outcomeBody(outcome)}</p>
                <button type="button" className="btn btnPrimary" onClick={() => newGame()}>
                  <span>Play again</span>
                </button>
              </div>
            )}
          </div>

          <PlayerStrip
            side={flipped ? -1 as color : WHITE}
            name={opponent === "human" ? "White" : humanSide === WHITE ? "You" : DIFFICULTY_LABEL[level]}
            captured={flipped ? material.black : material.white}
            balance={flipped ? -material.balance : material.balance}
            toMove={viewing.turn === (flipped ? -1 : WHITE)}
            thinking={thinking && viewing.turn === (flipped ? -1 : WHITE)}
          />
        </section>

        {/* ---- Panel -------------------------------------------------- */}
        <aside className={styles.panel}>
          <div className={styles.status} data-state={finished ? "over" : "playing"}>
            <p className="label labelPlain">
              {finished ? "Result" : thinking ? "Thinking" : "To move"}
            </p>
            <p className={styles.statusText}>
              {finished
                ? outcomeTitle(outcome)
                : `${viewing.turn === WHITE ? "White" : "Black"}${outcome.kind === "playing" && outcome.check ? " — in check" : ""}`}
            </p>
          </div>

          <div className={styles.controlGroup}>
            <p className="label labelPlain">Opponent</p>
            <div className={styles.segmented}>
              {(["computer", "human"] as opponent[]).map(eachOption => (
                <button
                  key={eachOption}
                  type="button"
                  data-active={opponent === eachOption}
                  onClick={() => opponentSet(eachOption)}
                >
                  {eachOption === "computer" ? "Computer" : "Two players"}
                </button>
              ))}
            </div>
          </div>

          {opponent === "computer" && (
            <>
              <div className={styles.controlGroup}>
                <p className="label labelPlain">Strength</p>
                <div className={styles.segmented}>
                  {(Object.keys(DIFFICULTY_LABEL) as difficulty[]).map(eachLevel => (
                    <button
                      key={eachLevel}
                      type="button"
                      data-active={level === eachLevel}
                      onClick={() => levelSet(eachLevel)}
                    >
                      {DIFFICULTY_LABEL[eachLevel]}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.controlGroup}>
                <p className="label labelPlain">You play</p>
                <div className={styles.segmented}>
                  <button type="button" data-active={humanSide === WHITE} onClick={() => newGame(WHITE)}>
                    White
                  </button>
                  <button type="button" data-active={humanSide !== WHITE} onClick={() => newGame(-1 as color)}>
                    Black
                  </button>
                </div>
              </div>
            </>
          )}

          <div className={styles.buttons}>
            <button type="button" className="btn btnSm" onClick={() => newGame()}>
              <span>New game</span>
            </button>
            <button
              type="button"
              className="btn btnSm"
              onClick={takeBack}
              disabled={liveIndex === 0}
            >
              <span>Take back</span>
            </button>
            <button type="button" className="btn btnSm" onClick={() => flippedSet(previous => !previous)}>
              <span>Flip board</span>
            </button>
          </div>

          <div className={styles.moves}>
            <div className={styles.movesHead}>
              <p className="label labelPlain">Moves</p>
              {!atLive && (
                <button type="button" className={styles.jump} onClick={() => viewIndexSet(liveIndex)}>
                  Back to live
                </button>
              )}
            </div>

            <ol className={styles.moveList}>
              {sans.length === 0 && <li className={styles.empty}>No moves yet.</li>}

              {Array.from({ length: Math.ceil(sans.length / 2) }, (unused, eachPair) => (
                <li key={eachPair}>
                  <span className="readout">{eachPair + 1}.</span>

                  {[0, 1].map(eachHalf => {
                    const index = eachPair * 2 + eachHalf
                    if (index >= sans.length) return <span key={eachHalf} />

                    return (
                      <button
                        key={eachHalf}
                        type="button"
                        data-active={viewIndex === index + 1}
                        onClick={() => viewIndexSet(index + 1)}
                      >
                        {sans[index]}
                      </button>
                    )
                  })}
                </li>
              ))}
            </ol>

            <p className={styles.browseHint}>
              <kbd>←</kbd> <kbd>→</kbd> step through the game
            </p>
          </div>

          <div className={styles.readouts}>
            {readout !== null && (
              <p className="readout">
                engine · depth {readout.depth} · {readout.nodes.toLocaleString()} nodes ·{" "}
                {readout.ms}ms · eval {(readout.score / 100).toFixed(2)}
              </p>
            )}
            <p className={`readout ${styles.fen}`}>{fens[viewIndex]}</p>
          </div>
        </aside>
      </div>
    </main>
  )
}

/* ---- Sub-components ------------------------------------------------------ */
function PlayerStrip({
  side,
  name,
  captured,
  balance,
  toMove,
  thinking,
}: {
  side: color
  name: string
  captured: number[]
  balance: number
  toMove: boolean
  thinking: boolean
}) {
  return (
    <div className={styles.strip} data-tomove={toMove}>
      <span className={styles.stripDot} data-side={side === WHITE ? "white" : "black"} />
      <span className={styles.stripName}>{name}</span>

      <span className={styles.taken}>
        {captured
          .slice()
          .sort((a, b) => PIECE_VALUE[b] - PIECE_VALUE[a])
          .map((eachType, eachIndex) => (
            <Image
              key={`${eachType}-${eachIndex}`}
              src={`/chess/${side === WHITE ? "b" : "w"}${PIECE_IMAGE[eachType]}.png`}
              alt=""
              width={22}
              height={22}
            />
          ))}
      </span>

      {balance > 0 && <span className={`readout ${styles.balance}`}>+{balance}</span>}
      {thinking && <span className={styles.thinking}>thinking…</span>}
    </div>
  )
}

function PromotionPicker({
  side,
  onPick,
  onCancel,
}: {
  side: color
  onPick: (type: number) => void
  onCancel: () => void
}) {
  return (
    <div className={styles.promotion} role="dialog" aria-label="Choose a promotion">
      <div className={styles.promotionInner}>
        <p className="label labelPlain">Promote to</p>

        <div className={styles.promotionOptions}>
          {[QUEEN, ROOK, BISHOP, KNIGHT].map(eachType => (
            <button key={eachType} type="button" onClick={() => onPick(eachType)}>
              <Image
                src={`/chess/${side === WHITE ? "w" : "b"}${PIECE_IMAGE[eachType]}.png`}
                alt={PIECE_IMAGE[eachType]}
                width={64}
                height={64}
              />
            </button>
          ))}
        </div>

        <button type="button" className={styles.cancel} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ---- Wording ------------------------------------------------------------- */
function outcomeTitle(outcome: ReturnType<typeof evaluateOutcome>) {
  switch (outcome.kind) {
    case "checkmate":
      return `Checkmate — ${outcome.winner === WHITE ? "white" : "black"} wins`
    case "stalemate":
      return "Stalemate — draw"
    case "fifty":
      return "Draw — fifty-move rule"
    case "repetition":
      return "Draw — threefold repetition"
    case "material":
      return "Draw — insufficient material"
    default:
      return outcome.check ? "Check" : "Playing"
  }
}

function outcomeBody(outcome: ReturnType<typeof evaluateOutcome>) {
  switch (outcome.kind) {
    case "checkmate":
      return "The king is attacked and every reply still leaves it attacked."
    case "stalemate":
      return "No legal move, and the king is not in check. Half a point each."
    case "fifty":
      return "A hundred half-moves with no capture and no pawn move."
    case "repetition":
      return "The same position, with the same rights, for the third time."
    case "material":
      return "Neither side has the material to force mate."
    default:
      return ""
  }
}
