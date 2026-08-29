/* ============================================================================
   SEED WORLD — the generator

   The goal I set myself: type a seed, get a world. Type the same seed again,
   get the *same* world — every tile, forever, without storing a single one.

   That rules out Math.random() entirely. Everything here is a pure function of
   (seed, x, y). Nothing is remembered, so nothing can drift.
   ========================================================================= */

/** FNV-1a. Cheap, well-distributed, and stable across engines. */
export function hashString(text: string) {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/**
 * Deterministic value in [0,1) for an integer lattice point.
 * Mixes the coordinates into the seed rather than sampling a stored table, so
 * the world has no origin and no edges.
 */
function latticeNoise(seed: number, x: number, y: number) {
  let hash = seed
  hash ^= Math.imul(x | 0, 0x27d4eb2d)
  hash ^= Math.imul(y | 0, 0x165667b1)
  hash = Math.imul(hash ^ (hash >>> 15), 0x2545f491)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0x27d4eb2d)
  hash ^= hash >>> 16
  return (hash >>> 0) / 4294967296
}

/** Smoothstep — removes the visible grid that linear interpolation leaves. */
function fade(t: number) {
  return t * t * (3 - 2 * t)
}

/** Bilinear value noise over the integer lattice. */
function valueNoise(seed: number, x: number, y: number) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = fade(x - x0)
  const fy = fade(y - y0)

  const topLeft = latticeNoise(seed, x0, y0)
  const topRight = latticeNoise(seed, x0 + 1, y0)
  const bottomLeft = latticeNoise(seed, x0, y0 + 1)
  const bottomRight = latticeNoise(seed, x0 + 1, y0 + 1)

  const top = topLeft + (topRight - topLeft) * fx
  const bottom = bottomLeft + (bottomRight - bottomLeft) * fx

  return top + (bottom - top) * fy
}

/**
 * Fractal Brownian motion: stack octaves of the same noise at doubling
 * frequency and halving amplitude. One octave is blobs; five is terrain.
 */
export function fbm(seed: number, x: number, y: number, octaves = 5, scale = 0.012) {
  let amplitude = 1
  let frequency = scale
  let total = 0
  let normaliser = 0

  for (let i = 0; i < octaves; i++) {
    total += valueNoise(seed + i * 9871, x * frequency, y * frequency) * amplitude
    normaliser += amplitude
    amplitude *= 0.5
    frequency *= 2
  }

  return total / normaliser
}

/* ---- Biomes -------------------------------------------------------------- */

export type biome = {
  id: string
  name: string
  colour: string
  /** Drawn as small marks scattered across the tile. */
  detail: "none" | "trees" | "rocks" | "grass" | "waves" | "dunes"
  detailColour: string
}

export const biomes: Record<string, biome> = {
  deep: { id: "deep", name: "Deep water", colour: "#12324d", detail: "waves", detailColour: "#1d4a6d" },
  shallow: { id: "shallow", name: "Shallows", colour: "#1d5a7d", detail: "waves", detailColour: "#2c7ba3" },
  beach: { id: "beach", name: "Sand", colour: "#c9b184", detail: "dunes", detailColour: "#b89f70" },
  desert: { id: "desert", name: "Desert", colour: "#c4a25f", detail: "dunes", detailColour: "#ae8c4c" },
  plains: { id: "plains", name: "Plains", colour: "#6f8f4a", detail: "grass", detailColour: "#87a75c" },
  forest: { id: "forest", name: "Forest", colour: "#3f6b3c", detail: "trees", detailColour: "#2b5029" },
  jungle: { id: "jungle", name: "Rainforest", colour: "#2f6b41", detail: "trees", detailColour: "#1f4c2d" },
  savanna: { id: "savanna", name: "Savanna", colour: "#96944e", detail: "grass", detailColour: "#adaa61" },
  taiga: { id: "taiga", name: "Taiga", colour: "#44644f", detail: "trees", detailColour: "#2f4a3a" },
  tundra: { id: "tundra", name: "Tundra", colour: "#8a9491", detail: "rocks", detailColour: "#767f7c" },
  rock: { id: "rock", name: "Highlands", colour: "#6d6a66", detail: "rocks", detailColour: "#565350" },
  snow: { id: "snow", name: "Snowcap", colour: "#d8dee2", detail: "none", detailColour: "#c2c9ce" },
}

/**
 * Whittaker-style lookup: elevation decides land or water and how high, then
 * moisture and temperature pick between the land types.
 */
export function biomeAt(elevation: number, moisture: number, temperature: number): biome {
  if (elevation < 0.34) return biomes.deep
  if (elevation < 0.42) return biomes.shallow
  if (elevation < 0.46) return biomes.beach

  if (elevation > 0.82) return biomes.snow
  if (elevation > 0.72) return biomes.rock

  if (temperature < 0.25) return elevation > 0.6 ? biomes.tundra : biomes.taiga

  if (temperature > 0.72) {
    if (moisture < 0.3) return biomes.desert
    if (moisture > 0.65) return biomes.jungle
    return biomes.savanna
  }

  if (moisture < 0.32) return biomes.plains
  if (moisture > 0.6) return biomes.forest
  return biomes.plains
}

/* ---- The sample ---------------------------------------------------------- */

export type worldSample = {
  elevation: number
  moisture: number
  temperature: number
  biome: biome
}

export type worldSeeds = {
  elevation: number
  moisture: number
  temperature: number
}

/** Three decorrelated fields from one seed string. */
export function deriveSeeds(seed: string): worldSeeds {
  const base = hashString(seed)
  return {
    elevation: base,
    moisture: hashString(`${seed}:moisture`) ^ base,
    temperature: hashString(`${seed}:temperature`),
  }
}

export function sampleWorld(seeds: worldSeeds, x: number, y: number): worldSample {
  const elevation = fbm(seeds.elevation, x, y, 5, 0.02)
  const moisture = fbm(seeds.moisture, x, y, 4, 0.035)

  // Temperature falls off with latitude and with height, like the real thing
  const latitude = fbm(seeds.temperature, x, y, 3, 0.012)
  const temperature = Math.min(1, Math.max(0, latitude - Math.max(0, elevation - 0.5) * 0.5))

  return { elevation, moisture, temperature, biome: biomeAt(elevation, moisture, temperature) }
}

/** Walkable check — water blocks movement. */
export function isWalkable(sample: worldSample) {
  return sample.biome.id !== "deep"
}
