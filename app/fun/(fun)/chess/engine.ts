/* ============================================================================
   CHESS — the rules, with nothing in them about how a board looks.

   The board is 0x88: a 16×8 array where the right-hand half is off the edge.
   The whole point is the off-board test — `square & 0x88` is non-zero exactly
   when a square has fallen off the side — which means a knight on h1 cannot
   silently wrap round to a1, the bug every naive 8×8 array version has.

   Legality is done the honest way: generate pseudo-legal moves, play each one,
   and keep it only if your own king is not attacked afterwards. That is
   slower than computing pin rays, and it is right first time, including for
   the awkward cases — a pinned piece capturing the pinner, en passant that
   would expose a rank-5 skewer, castling out of, through, or into check.

   Squares are indexed with a1 = 0, so white's pawns move by +16.
   ========================================================================= */

export const PAWN = 1
export const KNIGHT = 2
export const BISHOP = 3
export const ROOK = 4
export const QUEEN = 5
export const KING = 6

export const WHITE = 1
export const BLACK = -1

export type pieceType = 1 | 2 | 3 | 4 | 5 | 6
export type color = 1 | -1

/* ---- Castling rights, as bits ------------------------------------------- */
export const CASTLE_WK = 1
export const CASTLE_WQ = 2
export const CASTLE_BK = 4
export const CASTLE_BQ = 8

/* ---- Move flags ---------------------------------------------------------- */
export const FLAG_CAPTURE = 1
export const FLAG_DOUBLE_PUSH = 2
export const FLAG_EN_PASSANT = 4
export const FLAG_KING_CASTLE = 8
export const FLAG_QUEEN_CASTLE = 16
export const FLAG_PROMOTION = 32

export type move = {
  from: number
  to: number
  /** Signed: positive is white, negative is black. */
  piece: number
  /** Signed, 0 when the move is quiet. */
  captured: number
  /** 0, or the piece type the pawn becomes. */
  promotion: number
  flags: number
}

export type position = {
  /** 128 signed entries; only the 64 with (index & 0x88) === 0 are real. */
  board: Int8Array
  turn: color
  castling: number
  /** The square a pawn could capture onto, or -1. */
  epSquare: number
  halfmoves: number
  fullmoves: number
  kings: { 1: number; "-1": number }
}

export type undoRecord = {
  castling: number
  epSquare: number
  halfmoves: number
  fullmoves: number
  kingSquare: number
}

/* ---- Geometry ------------------------------------------------------------ */
const KNIGHT_OFFSETS = [33, 31, 18, 14, -14, -18, -31, -33]
const BISHOP_OFFSETS = [17, 15, -15, -17]
const ROOK_OFFSETS = [16, 1, -1, -16]
const KING_OFFSETS = [17, 16, 15, 1, -1, -15, -16, -17]

export const fileOf = (square: number) => square & 15
export const rankOf = (square: number) => square >> 4
export const onBoard = (square: number) => (square & 0x88) === 0
export const squareAt = (file: number, rank: number) => rank * 16 + file

export const A1 = 0
export const E1 = 4
export const H1 = 7
export const A8 = 112
export const E8 = 116
export const H8 = 119

export function algebraic(square: number) {
  return `${"abcdefgh"[fileOf(square)]}${rankOf(square) + 1}`
}

export function parseSquare(name: string) {
  const file = "abcdefgh".indexOf(name[0])
  const rank = Number(name[1]) - 1
  if (file < 0 || rank < 0 || rank > 7) return -1
  return squareAt(file, rank)
}

const PIECE_LETTERS: Record<number, string> = {
  [PAWN]: "P",
  [KNIGHT]: "N",
  [BISHOP]: "B",
  [ROOK]: "R",
  [QUEEN]: "Q",
  [KING]: "K",
}

const LETTER_PIECES: Record<string, number> = {
  p: PAWN,
  n: KNIGHT,
  b: BISHOP,
  r: ROOK,
  q: QUEEN,
  k: KING,
}

export const colorOf = (piece: number): color => (piece > 0 ? WHITE : BLACK)
export const typeOf = (piece: number) => Math.abs(piece) as pieceType

/* ---- Castling bookkeeping ------------------------------------------------
   Moving to or from one of these squares gives up the rights it carries — so
   capturing a rook on h8 removes black's kingside castling without anyone
   having to remember to do it. */
const CASTLE_MASK: Record<number, number> = {
  [E1]: CASTLE_WK | CASTLE_WQ,
  [H1]: CASTLE_WK,
  [A1]: CASTLE_WQ,
  [E8]: CASTLE_BK | CASTLE_BQ,
  [H8]: CASTLE_BK,
  [A8]: CASTLE_BQ,
}

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

/* ============================================================================
   FEN
   ========================================================================= */
export function parseFen(fen: string): position {
  const parts = fen.trim().split(/\s+/)
  const board = new Int8Array(128)

  let rank = 7
  let file = 0

  for (const eachCharacter of parts[0]) {
    if (eachCharacter === "/") {
      rank -= 1
      file = 0
      continue
    }

    if (eachCharacter >= "1" && eachCharacter <= "8") {
      file += Number(eachCharacter)
      continue
    }

    const type = LETTER_PIECES[eachCharacter.toLowerCase()]
    const signed = eachCharacter === eachCharacter.toUpperCase() ? type : -type
    board[squareAt(file, rank)] = signed
    file += 1
  }

  const castlingText = parts[2] ?? "-"
  let castling = 0
  if (castlingText.includes("K")) castling |= CASTLE_WK
  if (castlingText.includes("Q")) castling |= CASTLE_WQ
  if (castlingText.includes("k")) castling |= CASTLE_BK
  if (castlingText.includes("q")) castling |= CASTLE_BQ

  const position: position = {
    board,
    turn: parts[1] === "b" ? BLACK : WHITE,
    castling,
    epSquare: parts[3] && parts[3] !== "-" ? parseSquare(parts[3]) : -1,
    halfmoves: Number(parts[4] ?? 0),
    fullmoves: Number(parts[5] ?? 1),
    kings: { 1: -1, "-1": -1 },
  }

  for (let eachSquare = 0; eachSquare < 128; eachSquare += 1) {
    if (!onBoard(eachSquare)) continue
    const piece = board[eachSquare]
    if (typeOf(piece) === KING) position.kings[colorOf(piece)] = eachSquare
  }

  return position
}

export function toFen(position: position) {
  let placement = ""

  for (let rank = 7; rank >= 0; rank -= 1) {
    let empty = 0

    for (let file = 0; file < 8; file += 1) {
      const piece = position.board[squareAt(file, rank)]

      if (piece === 0) {
        empty += 1
        continue
      }

      if (empty > 0) {
        placement += String(empty)
        empty = 0
      }

      const letter = PIECE_LETTERS[typeOf(piece)]
      placement += piece > 0 ? letter : letter.toLowerCase()
    }

    if (empty > 0) placement += String(empty)
    if (rank > 0) placement += "/"
  }

  let castling = ""
  if (position.castling & CASTLE_WK) castling += "K"
  if (position.castling & CASTLE_WQ) castling += "Q"
  if (position.castling & CASTLE_BK) castling += "k"
  if (position.castling & CASTLE_BQ) castling += "q"
  if (castling === "") castling = "-"

  const ep = position.epSquare >= 0 ? algebraic(position.epSquare) : "-"

  return `${placement} ${position.turn === WHITE ? "w" : "b"} ${castling} ${ep} ${position.halfmoves} ${position.fullmoves}`
}

/** The repetition key: a FEN with the clocks stripped off. */
export function repetitionKey(position: position) {
  const fen = toFen(position)
  return fen.slice(0, fen.lastIndexOf(" ", fen.lastIndexOf(" ") - 1))
}

export function clonePosition(position: position): position {
  return {
    board: Int8Array.from(position.board),
    turn: position.turn,
    castling: position.castling,
    epSquare: position.epSquare,
    halfmoves: position.halfmoves,
    fullmoves: position.fullmoves,
    kings: { 1: position.kings[1], "-1": position.kings["-1"] },
  }
}

/* ============================================================================
   ATTACK DETECTION
   Is `square` attacked by anything of colour `by`? Used for check, for
   castling legality, and by the search.
   ========================================================================= */
export function isSquareAttacked(board: Int8Array, square: number, by: color) {
  /* Pawns. A white pawn on square-17 or square-15 attacks `square`. */
  const pawnFrom = by === WHITE ? [-17, -15] : [17, 15]
  for (const eachOffset of pawnFrom) {
    const from = square + eachOffset
    if (!onBoard(from)) continue
    if (board[from] === PAWN * by) return true
  }

  /* Knights */
  for (const eachOffset of KNIGHT_OFFSETS) {
    const from = square + eachOffset
    if (!onBoard(from)) continue
    if (board[from] === KNIGHT * by) return true
  }

  /* King */
  for (const eachOffset of KING_OFFSETS) {
    const from = square + eachOffset
    if (!onBoard(from)) continue
    if (board[from] === KING * by) return true
  }

  /* Bishops and queens along the diagonals */
  for (const eachOffset of BISHOP_OFFSETS) {
    let from = square + eachOffset

    while (onBoard(from)) {
      const piece = board[from]

      if (piece !== 0) {
        if (colorOf(piece) === by) {
          const type = typeOf(piece)
          if (type === BISHOP || type === QUEEN) return true
        }
        break
      }

      from += eachOffset
    }
  }

  /* Rooks and queens along the ranks and files */
  for (const eachOffset of ROOK_OFFSETS) {
    let from = square + eachOffset

    while (onBoard(from)) {
      const piece = board[from]

      if (piece !== 0) {
        if (colorOf(piece) === by) {
          const type = typeOf(piece)
          if (type === ROOK || type === QUEEN) return true
        }
        break
      }

      from += eachOffset
    }
  }

  return false
}

export function inCheck(position: position, side: color = position.turn) {
  const kingSquare = position.kings[side]
  if (kingSquare < 0) return false
  return isSquareAttacked(position.board, kingSquare, -side as color)
}

/* ============================================================================
   MOVE GENERATION
   ========================================================================= */
function pushPawnMoves(list: move[], position: position, from: number, to: number, flags: number) {
  const piece = position.board[from]
  const captured = flags & FLAG_EN_PASSANT ? -piece : position.board[to]
  const promotionRank = position.turn === WHITE ? 7 : 0

  if (rankOf(to) === promotionRank) {
    for (const eachPromotion of [QUEEN, ROOK, BISHOP, KNIGHT]) {
      list.push({
        from,
        to,
        piece,
        captured,
        promotion: eachPromotion,
        flags: flags | FLAG_PROMOTION,
      })
    }
    return
  }

  list.push({ from, to, piece, captured, promotion: 0, flags })
}

/**
 * All pseudo-legal moves — they may leave the mover's own king in check.
 * `onlySquare` restricts generation to one origin, which is what the board UI
 * asks for when you pick a piece up.
 */
export function generatePseudoMoves(position: position, onlySquare = -1) {
  const list: move[] = []
  const { board, turn } = position

  const first = onlySquare >= 0 ? onlySquare : 0
  const last = onlySquare >= 0 ? onlySquare : 127

  for (let from = first; from <= last; from += 1) {
    if (!onBoard(from)) continue

    const piece = board[from]
    if (piece === 0 || colorOf(piece) !== turn) continue

    const type = typeOf(piece)

    if (type === PAWN) {
      const forward = turn === WHITE ? 16 : -16
      const startRank = turn === WHITE ? 1 : 6

      const single = from + forward
      if (onBoard(single) && board[single] === 0) {
        pushPawnMoves(list, position, from, single, 0)

        const double = from + forward * 2
        if (rankOf(from) === startRank && board[double] === 0) {
          pushPawnMoves(list, position, from, double, FLAG_DOUBLE_PUSH)
        }
      }

      for (const eachOffset of turn === WHITE ? [15, 17] : [-15, -17]) {
        const to = from + eachOffset
        if (!onBoard(to)) continue

        if (board[to] !== 0 && colorOf(board[to]) !== turn) {
          pushPawnMoves(list, position, from, to, FLAG_CAPTURE)
        } else if (to === position.epSquare) {
          pushPawnMoves(list, position, from, to, FLAG_CAPTURE | FLAG_EN_PASSANT)
        }
      }

      continue
    }

    const offsets =
      type === KNIGHT ? KNIGHT_OFFSETS
        : type === BISHOP ? BISHOP_OFFSETS
          : type === ROOK ? ROOK_OFFSETS
            : KING_OFFSETS

    const sliding = type === BISHOP || type === ROOK || type === QUEEN
    const rays = type === QUEEN ? [...BISHOP_OFFSETS, ...ROOK_OFFSETS] : offsets

    for (const eachOffset of rays) {
      let to = from + eachOffset

      while (onBoard(to)) {
        const occupant = board[to]

        if (occupant === 0) {
          list.push({ from, to, piece, captured: 0, promotion: 0, flags: 0 })
        } else {
          if (colorOf(occupant) !== turn) {
            list.push({ from, to, piece, captured: occupant, promotion: 0, flags: FLAG_CAPTURE })
          }
          break
        }

        if (!sliding) break
        to += eachOffset
      }
    }

    /* Castling — generated from the king's square only */
    if (type === KING && (onlySquare < 0 || onlySquare === from)) {
      const home = turn === WHITE ? E1 : E8
      if (from !== home) continue

      const kingRight = turn === WHITE ? CASTLE_WK : CASTLE_BK
      const queenRight = turn === WHITE ? CASTLE_WQ : CASTLE_BQ
      const opponent = -turn as color

      // Never castle out of check, and never through an attacked square. The
      // destination is checked by the ordinary legality filter afterwards.
      const kingInCheck = isSquareAttacked(board, from, opponent)

      if ((position.castling & kingRight) !== 0 && !kingInCheck) {
        if (board[from + 1] === 0 && board[from + 2] === 0 && typeOf(board[from + 3]) === ROOK) {
          if (!isSquareAttacked(board, from + 1, opponent)) {
            list.push({
              from,
              to: from + 2,
              piece,
              captured: 0,
              promotion: 0,
              flags: FLAG_KING_CASTLE,
            })
          }
        }
      }

      if ((position.castling & queenRight) !== 0 && !kingInCheck) {
        if (
          board[from - 1] === 0 &&
          board[from - 2] === 0 &&
          board[from - 3] === 0 &&
          typeOf(board[from - 4]) === ROOK
        ) {
          if (!isSquareAttacked(board, from - 1, opponent)) {
            list.push({
              from,
              to: from - 2,
              piece,
              captured: 0,
              promotion: 0,
              flags: FLAG_QUEEN_CASTLE,
            })
          }
        }
      }
    }
  }

  return list
}

/** Pseudo-legal moves filtered down to the ones that do not hang your own king. */
export function generateMoves(position: position, onlySquare = -1) {
  const pseudo = generatePseudoMoves(position, onlySquare)
  const legal: move[] = []

  for (const eachMove of pseudo) {
    const undo = makeMove(position, eachMove)
    const moverInCheck = inCheck(position, -position.turn as color)
    unmakeMove(position, eachMove, undo)

    if (!moverInCheck) legal.push(eachMove)
  }

  return legal
}

/* ============================================================================
   MAKE / UNMAKE
   ========================================================================= */
export function makeMove(position: position, move: move): undoRecord {
  const { board } = position
  const mover = position.turn

  const undo: undoRecord = {
    castling: position.castling,
    epSquare: position.epSquare,
    halfmoves: position.halfmoves,
    fullmoves: position.fullmoves,
    kingSquare: position.kings[mover],
  }

  board[move.to] = move.promotion !== 0 ? move.promotion * mover : move.piece
  board[move.from] = 0

  if (move.flags & FLAG_EN_PASSANT) {
    // The captured pawn is beside the destination, not on it
    board[move.to + (mover === WHITE ? -16 : 16)] = 0
  }

  if (move.flags & FLAG_KING_CASTLE) {
    board[move.to - 1] = board[move.to + 1]
    board[move.to + 1] = 0
  } else if (move.flags & FLAG_QUEEN_CASTLE) {
    board[move.to + 1] = board[move.to - 2]
    board[move.to - 2] = 0
  }

  if (typeOf(move.piece) === KING) position.kings[mover] = move.to

  position.castling &= ~(CASTLE_MASK[move.from] ?? 0)
  position.castling &= ~(CASTLE_MASK[move.to] ?? 0)

  position.epSquare =
    move.flags & FLAG_DOUBLE_PUSH ? move.from + (mover === WHITE ? 16 : -16) : -1

  // The fifty-move clock resets on a pawn move or a capture, and only those
  position.halfmoves =
    typeOf(move.piece) === PAWN || move.captured !== 0 ? 0 : position.halfmoves + 1

  if (mover === BLACK) position.fullmoves += 1
  position.turn = -mover as color

  return undo
}

export function unmakeMove(position: position, move: move, undo: undoRecord) {
  const { board } = position
  const mover = -position.turn as color

  position.turn = mover
  position.castling = undo.castling
  position.epSquare = undo.epSquare
  position.halfmoves = undo.halfmoves
  position.fullmoves = undo.fullmoves
  position.kings[mover] = undo.kingSquare

  board[move.from] = move.piece
  board[move.to] = 0

  if (move.flags & FLAG_EN_PASSANT) {
    board[move.to + (mover === WHITE ? -16 : 16)] = move.captured
  } else if (move.captured !== 0) {
    board[move.to] = move.captured
  }

  if (move.flags & FLAG_KING_CASTLE) {
    board[move.to + 1] = board[move.to - 1]
    board[move.to - 1] = 0
  } else if (move.flags & FLAG_QUEEN_CASTLE) {
    board[move.to - 2] = board[move.to + 1]
    board[move.to + 1] = 0
  }
}

/* ============================================================================
   NOTATION
   ========================================================================= */
export function moveToSan(position: position, move: move) {
  if (move.flags & FLAG_KING_CASTLE) return withSuffix(position, move, "O-O")
  if (move.flags & FLAG_QUEEN_CASTLE) return withSuffix(position, move, "O-O-O")

  const type = typeOf(move.piece)
  let text = ""

  if (type === PAWN) {
    if (move.flags & FLAG_CAPTURE) text += "abcdefgh"[fileOf(move.from)] + "x"
    text += algebraic(move.to)
  } else {
    text += PIECE_LETTERS[type]
    text += disambiguate(position, move)
    if (move.flags & FLAG_CAPTURE) text += "x"
    text += algebraic(move.to)
  }

  if (move.promotion !== 0) text += `=${PIECE_LETTERS[move.promotion]}`

  return withSuffix(position, move, text)
}

/** Only add a file, a rank, or both — and only when another piece could go there. */
function disambiguate(position: position, move: move) {
  const rivals = generateMoves(position).filter(
    eachMove =>
      eachMove.to === move.to &&
      eachMove.from !== move.from &&
      typeOf(eachMove.piece) === typeOf(move.piece),
  )

  if (rivals.length === 0) return ""

  const sameFile = rivals.some(eachMove => fileOf(eachMove.from) === fileOf(move.from))
  const sameRank = rivals.some(eachMove => rankOf(eachMove.from) === rankOf(move.from))

  if (!sameFile) return "abcdefgh"[fileOf(move.from)]
  if (!sameRank) return String(rankOf(move.from) + 1)
  return algebraic(move.from)
}

function withSuffix(position: position, move: move, text: string) {
  const undo = makeMove(position, move)
  const checking = inCheck(position)
  // Only worth generating the replies when it is check — that is the only
  // case where the suffix can be either of two things.
  const replies = checking ? generateMoves(position).length : 1
  unmakeMove(position, move, undo)

  if (!checking) return text
  return `${text}${replies === 0 ? "#" : "+"}`
}

/* ============================================================================
   GAME STATE
   ========================================================================= */
export type outcome =
  | { kind: "playing"; check: boolean }
  | { kind: "checkmate"; winner: color }
  | { kind: "stalemate" }
  | { kind: "fifty" }
  | { kind: "repetition" }
  | { kind: "material" }

/** True when neither side could deliver mate even with the other's help. */
export function insufficientMaterial(position: position) {
  const counts: Record<number, number> = {}
  const bishopSquares: number[] = []
  let total = 0

  for (let eachSquare = 0; eachSquare < 128; eachSquare += 1) {
    if (!onBoard(eachSquare)) continue
    const piece = position.board[eachSquare]
    if (piece === 0) continue

    total += 1
    counts[piece] = (counts[piece] ?? 0) + 1
    if (typeOf(piece) === BISHOP) bishopSquares.push(eachSquare)
  }

  if (total === 2) return true // bare kings

  if (total === 3) {
    const minor = counts[KNIGHT] || counts[-KNIGHT] || counts[BISHOP] || counts[-BISHOP]
    if (minor) return true // king and one minor piece
  }

  // Any number of bishops, all on one colour of square, can never mate
  if (
    total === 2 + bishopSquares.length &&
    bishopSquares.length > 0 &&
    counts[PAWN] === undefined &&
    counts[-PAWN] === undefined
  ) {
    const shade = (square: number) => (fileOf(square) + rankOf(square)) % 2
    if (bishopSquares.every(eachSquare => shade(eachSquare) === shade(bishopSquares[0]))) {
      return true
    }
  }

  return false
}

export function evaluateOutcome(position: position, repetitionCounts: Map<string, number>): outcome {
  const moves = generateMoves(position)
  const checking = inCheck(position)

  if (moves.length === 0) {
    if (checking) return { kind: "checkmate", winner: -position.turn as color }
    return { kind: "stalemate" }
  }

  if (position.halfmoves >= 100) return { kind: "fifty" }
  if ((repetitionCounts.get(repetitionKey(position)) ?? 0) >= 3) return { kind: "repetition" }
  if (insufficientMaterial(position)) return { kind: "material" }

  return { kind: "playing", check: checking }
}

/** Finds the generated move matching a from/to (and promotion) the UI chose. */
export function findMove(moves: move[], from: number, to: number, promotion = 0) {
  return (
    moves.find(
      eachMove =>
        eachMove.from === from &&
        eachMove.to === to &&
        (promotion === 0 || eachMove.promotion === promotion),
    ) ?? null
  )
}
