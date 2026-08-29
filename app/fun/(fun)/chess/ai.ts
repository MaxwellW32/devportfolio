/* ============================================================================
   THE OPPONENT

   Negamax with alpha-beta, iterative deepening under a wall-clock deadline,
   and a quiescence search at the leaves.

   The quiescence search is the part that matters. Without it, a fixed-depth
   search stops mid-exchange and cheerfully reports that giving away a queen is
   fine, because the recapture happens on the first ply it never looked at.
   So at depth zero the search keeps going through captures only, until the
   position is quiet enough to be worth a number.
   ========================================================================= */

import {
  BISHOP,
  BLACK,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
  colorOf,
  fileOf,
  generateMoves,
  inCheck,
  makeMove,
  onBoard,
  rankOf,
  typeOf,
  unmakeMove,
  type color,
  type move,
  type position,
} from "./engine"

export type difficulty = "random" | "friendly" | "club" | "sharp"

const PIECE_VALUE: Record<number, number> = {
  [PAWN]: 100,
  [KNIGHT]: 320,
  [BISHOP]: 330,
  [ROOK]: 500,
  [QUEEN]: 900,
  [KING]: 20000,
}

/* ---- Piece-square tables -------------------------------------------------
   Written the way a board is drawn — rank 8 on the first line — then flipped
   so index 0 is a1, which is how the engine numbers its squares. */
function fromDiagram(rows: number[][]) {
  const table = new Int16Array(64)

  rows.forEach((eachRow, eachRowIndex) => {
    const rank = 7 - eachRowIndex
    eachRow.forEach((eachValue, eachFile) => {
      table[rank * 8 + eachFile] = eachValue
    })
  })

  return table
}

const PAWN_TABLE = fromDiagram([
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
])

const KNIGHT_TABLE = fromDiagram([
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
])

const BISHOP_TABLE = fromDiagram([
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
])

const ROOK_TABLE = fromDiagram([
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
])

const QUEEN_TABLE = fromDiagram([
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
])

const KING_MIDDLE_TABLE = fromDiagram([
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
])

const KING_END_TABLE = fromDiagram([
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
])

const TABLES: Record<number, Int16Array> = {
  [PAWN]: PAWN_TABLE,
  [KNIGHT]: KNIGHT_TABLE,
  [BISHOP]: BISHOP_TABLE,
  [ROOK]: ROOK_TABLE,
  [QUEEN]: QUEEN_TABLE,
}

const MATE_SCORE = 100000

/** Index a piece-square table, mirrored vertically for black. */
function tableIndex(square: number, side: color) {
  const file = fileOf(square)
  const rank = rankOf(square)
  return side === WHITE ? rank * 8 + file : (7 - rank) * 8 + file
}

/**
 * Positive is good for the side to move.
 * Material dominates; the tables supply the taste — knights toward the centre,
 * rooks onto the seventh, a king that hides in the middlegame and walks in the
 * endgame.
 */
export function evaluate(position: position) {
  let score = 0
  let material = 0

  for (let eachSquare = 0; eachSquare < 128; eachSquare += 1) {
    if (!onBoard(eachSquare)) continue

    const piece = position.board[eachSquare]
    if (piece === 0) continue

    const type = typeOf(piece)
    const side = colorOf(piece)

    if (type !== KING && type !== PAWN) material += PIECE_VALUE[type]
    if (type === KING) continue

    const value = PIECE_VALUE[type] + TABLES[type][tableIndex(eachSquare, side)]
    score += side === WHITE ? value : -value
  }

  // One number decides which king table to use, so the king stops hiding once
  // the pieces that were threatening it have come off.
  const endgame = material < 1800

  const sides: color[] = [WHITE, BLACK]

  for (const eachSide of sides) {
    const kingSquare = position.kings[eachSide]
    if (kingSquare < 0) continue

    const table = endgame ? KING_END_TABLE : KING_MIDDLE_TABLE
    const value = table[tableIndex(kingSquare, eachSide)]
    score += eachSide === WHITE ? value : -value
  }

  return position.turn === WHITE ? score : -score
}

/* ---- Move ordering -------------------------------------------------------
   Alpha-beta is only fast if good moves come first. Most valuable victim,
   least valuable attacker is the cheapest ordering that works. */
function scoreMove(eachMove: move) {
  if (eachMove.captured !== 0) {
    return 10000 + PIECE_VALUE[typeOf(eachMove.captured)] * 10 - PIECE_VALUE[typeOf(eachMove.piece)]
  }
  if (eachMove.promotion !== 0) return 9000 + PIECE_VALUE[eachMove.promotion]
  return 0
}

function ordered(moves: move[]) {
  return moves.sort((a, b) => scoreMove(b) - scoreMove(a))
}

/* ---- Search bookkeeping --------------------------------------------------
   The search is fail-soft: it returns the best score it actually saw rather
   than the window bound. Fail-hard was the original bug here — every move that
   failed low came back with a score exactly equal to the best move's, so the
   "pick anything within a pawn of best" logic on the easier settings was
   really picking uniformly at random, and the engine answered 1.e4 with a6. */
let nodeCount = 0
let aborted = false
let searchDeadline = 0

function outOfTime() {
  // Checking the clock on every node costs more than the check saves
  if ((nodeCount & 1023) !== 0) return aborted
  if (performance.now() > searchDeadline) aborted = true
  return aborted
}

/* ---- Quiescence ---------------------------------------------------------- */
function quiescence(position: position, alpha: number, beta: number, depth: number): number {
  nodeCount += 1

  const standPat = evaluate(position)
  if (standPat >= beta) return standPat
  if (standPat > alpha) alpha = standPat
  if (depth <= 0) return standPat

  let best = standPat

  const captures = ordered(generateMoves(position).filter(eachMove => eachMove.captured !== 0))

  for (const eachMove of captures) {
    const undo = makeMove(position, eachMove)
    const score = -quiescence(position, -beta, -alpha, depth - 1)
    unmakeMove(position, eachMove, undo)

    if (score > best) best = score
    if (best > alpha) alpha = best
    if (alpha >= beta) break
  }

  return best
}

/* ---- Negamax with alpha-beta --------------------------------------------- */
function negamax(position: position, depth: number, alpha: number, beta: number, ply: number): number {
  nodeCount += 1
  if (outOfTime()) return 0

  const moves = generateMoves(position)

  if (moves.length === 0) {
    // Mate scores are pushed away from the root, so a mate in two is preferred
    // to a mate in four rather than merely tied with it.
    if (inCheck(position)) return -MATE_SCORE + ply
    return 0
  }

  if (position.halfmoves >= 100) return 0
  if (depth <= 0) return quiescence(position, alpha, beta, 5)

  let best = -Infinity

  for (const eachMove of ordered(moves)) {
    const undo = makeMove(position, eachMove)
    const score = -negamax(position, depth - 1, -beta, -alpha, ply + 1)
    unmakeMove(position, eachMove, undo)

    if (aborted) return best === -Infinity ? 0 : best

    if (score > best) best = score
    if (best > alpha) alpha = best
    if (alpha >= beta) break
  }

  return best
}

const SETTINGS: Record<difficulty, { depth: number; budget: number; slack: number }> = {
  // `random` never reaches the search — chooseMove hands it straight to
  // chooseRandomMove below — but the table has to be total.
  random: { depth: 1, budget: 50, slack: 0 },
  // `slack` is how far below best a move may still be chosen, in centipawns.
  // It is what makes the easy setting beatable without making it play nonsense
  // — and it only means anything because the root scores are exact.
  friendly: { depth: 2, budget: 300, slack: 70 },
  club: { depth: 3, budget: 800, slack: 20 },
  sharp: { depth: 5, budget: 1500, slack: 0 },
}

export type searchResult = {
  move: move | null
  score: number
  depth: number
  nodes: number
  ms: number
}

export function chooseMove(position: position, level: difficulty): searchResult {
  const settings = SETTINGS[level]
  const started = performance.now()

  nodeCount = 0
  aborted = false
  searchDeadline = started + settings.budget

  const rootMoves = ordered(generateMoves(position))
  if (rootMoves.length === 0) {
    return { move: null, score: 0, depth: 0, nodes: 0, ms: 0 }
  }

  let scored = rootMoves.map(eachMove => ({ move: eachMove, score: 0 }))
  let reachedDepth = 0

  // Iterative deepening. Each pass costs a fraction of the next, and it means
  // a pass cut short by the clock can be thrown away with a complete, shallower
  // answer still in hand.
  for (let depth = 1; depth <= settings.depth; depth += 1) {
    const pass: { move: move; score: number }[] = []

    for (const eachEntry of scored) {
      const undo = makeMove(position, eachEntry.move)
      // A full window at the root: alpha-beta inside each child still does the
      // pruning, but every root move comes back with a real number rather than
      // a bound, which is what `slack` needs to mean anything.
      const score = -negamax(position, depth - 1, -Infinity, Infinity, 1)
      unmakeMove(position, eachEntry.move, undo)

      if (aborted) break
      pass.push({ move: eachEntry.move, score })
    }

    if (aborted) break

    pass.sort((a, b) => b.score - a.score)
    scored = pass
    reachedDepth = depth

    // A forced mate is found; there is nothing deeper worth looking for
    if (Math.abs(scored[0].score) > MATE_SCORE - 100) break
    if (performance.now() > searchDeadline) break
  }

  const best = scored[0]
  const candidates = scored.filter(eachEntry => best.score - eachEntry.score <= settings.slack)
  const pick = candidates[Math.floor(Math.random() * candidates.length)]

  return {
    move: pick.move,
    score: pick.score,
    depth: reachedDepth,
    nodes: nodeCount,
    ms: Math.round(performance.now() - started),
  }
}

/* ============================================================================
   THE DUMB ONE

   Picks a piece at random, then one of that piece's legal moves at random.

   That is deliberately NOT the same as picking uniformly from all legal moves.
   Choosing the piece first gives every piece an equal say regardless of how
   many squares it can reach, so a cornered rook is as likely to be chosen as a
   queen in the open — which is exactly why a lone king and pawn can run rings
   round a full roster that keeps picking its most boring piece.

   It is the original behaviour of this page, and it is still the most
   entertaining thing on it.
   ========================================================================= */
export function chooseRandomMove(position: position): searchResult {
  const started = performance.now()
  const legal = generateMoves(position)

  if (legal.length === 0) {
    return { move: null, score: 0, depth: 0, nodes: 0, ms: 0 }
  }

  // Group by origin square so a piece is picked before one of its squares is
  const byPiece = new Map<number, move[]>()
  for (const eachMove of legal) {
    const existing = byPiece.get(eachMove.from)
    if (existing === undefined) byPiece.set(eachMove.from, [eachMove])
    else existing.push(eachMove)
  }

  const origins = Array.from(byPiece.keys())
  const chosenPiece = origins[Math.floor(Math.random() * origins.length)]
  const options = byPiece.get(chosenPiece) ?? legal
  const chosen = options[Math.floor(Math.random() * options.length)]

  return {
    move: chosen,
    score: 0,
    depth: 0,
    nodes: legal.length,
    ms: Math.round(performance.now() - started),
  }
}
