/* ============================================================================
   THE AUTOMATON

   Not Conway's. In Conway's Game of Life a cell reads its neighbours and
   decides whether to live or die. Here a cell reads its neighbours and decides
   where to MOVE, and the mapping from neighbourhood to movement is not fixed —
   it is learned as the world runs.

   The whole thing is three ideas:

   1. A SIGNATURE. Every tile looks at its eight neighbours, wrapping at the
      edges, and writes down what it sees: "grey" for an empty cell, otherwise
      the colour of the tile there. Eight values joined together are that
      tile's signature — `grey_black_grey_grey_white_grey_grey_black`.

   2. A RULE TABLE. Signatures map to a list of moves. The first time a
      signature is ever seen the table invents a rule for it, at random, and
      keeps it forever. So the rules are not designed; they accumulate. Two
      runs of the same world diverge immediately and never reconverge.

   3. NOBODY SHARES A CELL. Every tile moves at once, and any tile that would
      land on an occupied cell is put back where it started. That has to repeat
      until nothing is overlapping, because putting one tile back can block
      another that had already been allowed to move.

   The functions below are pure and take the world as an argument, which is
   what makes the whole thing steppable, resettable and testable.
   ========================================================================= */

export type moveAction = "up" | "down" | "left" | "right"

export type tileColour = "black" | "white"

/** What a tile sees in one of the eight directions. */
export type neighbour = tileColour | "grey"

export type tile = {
  id: number
  column: number
  row: number
  colour: tileColour
  /** Set for one step when the tile tried to move and was blocked. */
  blocked: boolean
}

export type ruleTable = Record<string, moveAction[]>

export type world = {
  size: number
  tiles: tile[]
  rules: ruleTable
  generation: number
}

/* The eight neighbours, in reading order: top-left across to bottom-right,
   skipping the tile itself. The order matters — it is what makes a signature
   comparable between tiles. */
const OFFSETS: [number, number][] = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
]

export const wrap = (value: number, size: number) => ((value % size) + size) % size

const key = (column: number, row: number) => `${column}_${row}`

/** Where every tile currently is, for O(1) neighbour lookups. */
export function occupancy(tiles: tile[]) {
  const map = new Map<string, tileColour>()
  for (const eachTile of tiles) map.set(key(eachTile.column, eachTile.row), eachTile.colour)
  return map
}

/** The eight-neighbour signature for one tile against a snapshot of the world. */
export function signatureFor(tile: tile, map: Map<string, tileColour>, size: number) {
  const seen: neighbour[] = []

  for (const [dx, dy] of OFFSETS) {
    const column = wrap(tile.column + dx, size)
    const row = wrap(tile.row + dy, size)
    seen.push(map.get(key(column, row)) ?? "grey")
  }

  return seen.join("_")
}

/** Splits a signature back into its eight parts, for drawing it. */
export function readSignature(signature: string) {
  return signature.split("_") as neighbour[]
}

/* ---- Inventing a rule ----------------------------------------------------
   A short random walk, collapsed to its net displacement. Walking then
   collapsing rather than picking a displacement directly is what gives the
   distribution its shape: short moves are common, long ones are rare, and
   standing still is possible but unusual. */
export function inventRule(): moveAction[] {
  const limit = 5

  let steps = Math.floor(Math.random() * limit)

  // A rare long one keeps the world from settling into small orbits
  if (Math.random() > 0.95) steps = limit + 1

  // Standing still is allowed, but only about one time in fifty
  if (steps === 0 && Math.random() < 0.98) {
    steps = Math.floor(Math.random() * limit) + 1
  }

  const directions: moveAction[] = ["up", "down", "left", "right"]
  let dx = 0
  let dy = 0

  for (let index = 0; index < steps; index += 1) {
    const move = directions[Math.floor(Math.random() * directions.length)]
    if (move === "up") dy -= 1
    if (move === "down") dy += 1
    if (move === "left") dx -= 1
    if (move === "right") dx += 1
  }

  const actions: moveAction[] = []
  if (dx > 0) actions.push(...Array<moveAction>(dx).fill("right"))
  else if (dx < 0) actions.push(...Array<moveAction>(-dx).fill("left"))
  if (dy > 0) actions.push(...Array<moveAction>(dy).fill("down"))
  else if (dy < 0) actions.push(...Array<moveAction>(-dy).fill("up"))

  return actions
}

/* ---- One generation ------------------------------------------------------ */
export type stepResult = {
  tiles: tile[]
  rules: ruleTable
  /** Signatures the table had never seen before this step. */
  learned: string[]
}

export function step(world: world, autoGenerate: boolean): stepResult {
  const { size } = world

  // Everything reads the same snapshot, so the order tiles are processed in
  // cannot change the outcome.
  const snapshot = occupancy(world.tiles)
  const rules: ruleTable = { ...world.rules }
  const learned: string[] = []

  const moved = world.tiles.map(eachTile => {
    const signature = signatureFor(eachTile, snapshot, size)
    let actions = rules[signature]

    if (actions === undefined) {
      if (!autoGenerate) return { ...eachTile, blocked: false }

      actions = inventRule()
      rules[signature] = actions
      learned.push(signature)
    }

    let column = eachTile.column
    let row = eachTile.row

    for (const eachAction of actions) {
      if (eachAction === "up") row = wrap(row - 1, size)
      else if (eachAction === "down") row = wrap(row + 1, size)
      else if (eachAction === "left") column = wrap(column - 1, size)
      else if (eachAction === "right") column = wrap(column + 1, size)
    }

    return { ...eachTile, column, row, blocked: false }
  })

  /* --- nobody shares a cell ---
     Putting one tile back can free a cell but block another, so this repeats
     until a pass changes nothing. The original compared every tile against
     every other tile on every pass; a map of occupied cells does the same job
     in one pass instead of n². */
  for (let pass = 0; pass < 32; pass += 1) {
    const occupied = new Map<string, number>()
    for (const eachTile of moved) {
      const at = key(eachTile.column, eachTile.row)
      occupied.set(at, (occupied.get(at) ?? 0) + 1)
    }

    let reverted = 0

    for (let index = 0; index < moved.length; index += 1) {
      const eachTile = moved[index]
      const original = world.tiles[index]

      const alreadyHome = eachTile.column === original.column && eachTile.row === original.row
      if (alreadyHome) continue

      if ((occupied.get(key(eachTile.column, eachTile.row)) ?? 0) > 1) {
        moved[index] = { ...original, blocked: true }
        reverted += 1
      }
    }

    if (reverted === 0) break
  }

  return { tiles: moved, rules, learned }
}

/* ---- Building a world ----------------------------------------------------
   `random` is injectable so the very first world can be built from a fixed
   seed. It has to be: the first render happens on the server, and a world laid
   out with Math.random() there will not match the one the browser builds,
   which React reports as a hydration mismatch. Every reseed after that uses
   Math.random and is properly arbitrary. */
export function mulberry32(seed: number) {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedWorld(
  size: number,
  density: number,
  whiteChance = 0.02,
  random: () => number = Math.random,
): tile[] {
  const wanted = Math.max(1, Math.floor(size * size * density))
  const taken = new Set<string>()
  const tiles: tile[] = []

  // Rejection sampling: far cheaper than listing every free cell each time,
  // which is what the original did once per tile.
  let attempts = 0
  while (tiles.length < wanted && attempts < wanted * 40) {
    attempts += 1

    const column = Math.floor(random() * size)
    const row = Math.floor(random() * size)
    const at = key(column, row)
    if (taken.has(at)) continue

    taken.add(at)
    tiles.push({
      id: tiles.length,
      column,
      row,
      colour: random() < whiteChance ? "white" : "black",
      blocked: false,
    })
  }

  return tiles
}

/* ---- Rules as text ------------------------------------------------------- */
export function serialiseRules(rules: ruleTable) {
  return JSON.stringify(rules, null, 2)
}

const VALID_ACTIONS: moveAction[] = ["up", "down", "left", "right"]

/**
 * Parses a pasted rule table, rejecting anything that is not the right shape.
 * Returns the table or a message explaining what is wrong with it.
 */
export function parseRules(text: string): { rules: ruleTable } | { error: string } {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    return { error: "That is not valid JSON." }
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { error: "Expected an object of signature → moves." }
  }

  const rules: ruleTable = {}

  for (const [eachKey, eachValue] of Object.entries(parsed)) {
    if (readSignature(eachKey).length !== 8) {
      return { error: `"${eachKey.slice(0, 24)}…" is not an eight-part signature.` }
    }

    if (!Array.isArray(eachValue)) {
      return { error: `The moves for "${eachKey.slice(0, 24)}…" are not a list.` }
    }

    for (const eachAction of eachValue) {
      if (!VALID_ACTIONS.includes(eachAction as moveAction)) {
        return { error: `"${String(eachAction)}" is not a move.` }
      }
    }

    rules[eachKey] = eachValue as moveAction[]
  }

  return { rules }
}
