/* ============================================================================
   PERFT — the only honest way to check a chess move generator.

   Count the leaf nodes reachable in N plies from a position and compare against
   the published figures. A generator that is wrong about en passant, castling
   rights or a pinned piece capturing its pinner will match at depth two and
   diverge at depth four, which is exactly why eyeballing the board does not
   work.

   Run it with: npm run perft
   ========================================================================= */

import {
  START_FEN,
  clonePosition,
  generateMoves,
  makeMove,
  parseFen,
  unmakeMove,
  type position,
} from "../app/fun/(fun)/chess/engine"

function perft(pos: position, depth: number): number {
  if (depth === 0) return 1

  const moves = generateMoves(pos)
  if (depth === 1) return moves.length

  let nodes = 0
  for (const m of moves) {
    const undo = makeMove(pos, m)
    nodes += perft(pos, depth - 1)
    unmakeMove(pos, m, undo)
  }
  return nodes
}

const cases: { name: string; fen: string; expected: number[] }[] = [
  { name: "start", fen: START_FEN, expected: [20, 400, 8902, 197281, 4865609] },
  {
    name: "kiwipete",
    fen: "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
    expected: [48, 2039, 97862, 4085603],
  },
  {
    name: "position 3 (ep + pins)",
    fen: "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1",
    expected: [14, 191, 2812, 43238, 674624],
  },
  {
    name: "position 4 (promotions)",
    fen: "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1",
    expected: [6, 264, 9467, 422333],
  },
  {
    name: "position 5",
    fen: "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8",
    expected: [44, 1486, 62379, 2103487],
  },
  {
    name: "position 6",
    fen: "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10",
    expected: [46, 2079, 89890, 3894594],
  },
]

let failures = 0

for (const eachCase of cases) {
  const base = parseFen(eachCase.fen)

  eachCase.expected.forEach((expected, index) => {
    const depth = index + 1
    const pos = clonePosition(base)
    const started = Date.now()
    const got = perft(pos, depth)
    const ms = Date.now() - started
    const ok = got === expected

    if (!ok) failures += 1
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${eachCase.name.padEnd(24)} depth ${depth}  ${String(got).padStart(9)} / ${String(expected).padStart(9)}  ${ms}ms`,
    )
  })
}

// Round-trip check: the position must be restored exactly by unmake
const pos = parseFen(START_FEN)
const before = JSON.stringify([Array.from(pos.board), pos.turn, pos.castling, pos.epSquare, pos.halfmoves, pos.fullmoves, pos.kings])
perft(pos, 4)
const after = JSON.stringify([Array.from(pos.board), pos.turn, pos.castling, pos.epSquare, pos.halfmoves, pos.fullmoves, pos.kings])
console.log(`${before === after ? "PASS" : "FAIL"}  make/unmake restores the position exactly`)
if (before !== after) failures += 1

console.log(failures === 0 ? "\nAll perft counts correct." : `\n${failures} failures.`)
process.exit(failures === 0 ? 0 : 1)
