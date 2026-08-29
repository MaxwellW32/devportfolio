/* ============================================================================
   THE PLAYGROUND
   Things built purely to find out whether I could. Each one sets out to prove
   something small and specific, and says so.

   TO ADD ONE: append an entry below and create app/fun/(fun)/<slug>/page.tsx.
   The cards are typographic — there is no cover image to supply.

   ONE RULE: the title has to be the slug, spaced out. /fun/three showing a
   card called "Boids" meant the URL and the name disagreed, which is confusing
   in a browser history and worse in a conversation. `checkFunSlugs` below
   enforces it in development.
   ========================================================================= */

export type funItem = {
  slug: string
  title: string
  /** The claim the toy sets out to demonstrate. */
  claim: string
  tags: string[]
  /** Reflects how finished it is, honestly. */
  state: "polished" | "playable" | "sketch"
}

export const funItems: funItem[] = [
  {
    slug: "seedWorld",
    title: "Seed World",
    claim: "A world you can walk forever, stored nowhere. Every tile is a pure function of the seed.",
    tags: ["Procedural", "Value noise", "Canvas"],
    state: "polished",
  },
  {
    slug: "boids",
    title: "Boids",
    claim: "Three local rules, no leader, and a flock appears. Turn one off and watch which part dies.",
    tags: ["Three.js", "Emergence", "WebGL"],
    state: "polished",
  },
  {
    slug: "gameOfLife",
    title: "Game Of Life",
    claim: "Tiles that read their eight neighbours and move. Nobody writes the rules — the world invents one every time it sees an arrangement it has not met before.",
    tags: ["Cellular automata", "Emergence"],
    state: "polished",
  },
  {
    slug: "fibonacci",
    title: "Fibonacci",
    claim: "The ratio of consecutive terms converges on the golden ratio. Here is the number and the picture.",
    tags: ["Maths", "BigInt", "Canvas"],
    state: "polished",
  },
  {
    slug: "ricochetArena",
    title: "Ricochet Arena",
    claim: "Shells reflect properly off walls, and the enemies aim where you are going rather than where you are.",
    tags: ["Game", "Collision", "Ballistics"],
    state: "playable",
  },
  {
    slug: "chess",
    title: "Chess",
    claim: "Legal move generation verified against published perft counts — plus the mode where both sides move at random and a lone king beats a full roster.",
    tags: ["Game", "Rules engine", "Search"],
    state: "polished",
  },
  {
    slug: "luckRanked",
    title: "Luck Ranked",
    claim: "The winner is drawn after you click, so there is nothing to read and no way to be good at it. It ranks your luck instead.",
    tags: ["Game", "Statistics"],
    state: "polished",
  },
  {
    slug: "shellGame",
    title: "Shell Game",
    claim: "The other half of that idea: the ball goes under a cup before the shuffle, so following it is possible — and the scoreboard says whether you did.",
    tags: ["Game", "Statistics"],
    state: "polished",
  },
  {
    slug: "musicBounce",
    title: "Music Bounce",
    claim: "Pick a slice of the spectrum, say what the cube should do when it gets loud, and let the track draw the path.",
    tags: ["Web Audio", "FFT", "Canvas"],
    state: "polished",
  },
  {
    slug: "stepSequencer",
    title: "Step Sequencer",
    claim: "A drum machine with no samples in it. Every sound is built from oscillators and noise, and the whole pattern fits in a link.",
    tags: ["Web Audio", "Synthesis", "Sequencer"],
    state: "polished",
  },
  {
    slug: "chimeBox",
    title: "Chime Box",
    claim: "The walls are the instrument. Turn quantise off to hear exactly what quantising does.",
    tags: ["Web Audio", "Physics", "Generative"],
    state: "polished",
  },
  {
    slug: "musicTimeline",
    title: "Music Timeline",
    claim: "Drag clips around and it stays in time, because the playhead comes from the audio clock rather than a timer.",
    tags: ["Web Audio", "Scheduling", "Timeline"],
    state: "polished",
  },
  {
    slug: "reactiveMusic",
    title: "Reactive Music",
    claim: "A spectrum you can watch, and beat detection that works on a quiet track and a loud one alike.",
    tags: ["Web Audio", "FFT", "Canvas"],
    state: "polished",
  },
]

/** "Ricochet Arena" -> "ricochetArena", so a title can be checked against a slug. */
export function titleToSlug(title: string) {
  return title
    .split(/\s+/)
    .map((eachWord, eachIndex) =>
      eachIndex === 0
        ? eachWord.toLowerCase()
        : eachWord.charAt(0).toUpperCase() + eachWord.slice(1).toLowerCase(),
    )
    .join("")
}

/**
 * Shouts in development if a card's name and its URL have drifted apart.
 * Cheap to run, and it catches the mistake at the moment it is made rather
 * than when someone tries to share the link.
 */
export function checkFunSlugs() {
  const wrong = funItems.filter(eachItem => titleToSlug(eachItem.title) !== eachItem.slug)

  if (wrong.length > 0) {
    console.warn(
      "[FunData] title and slug disagree:",
      wrong.map(eachItem => `${eachItem.title} -> /fun/${eachItem.slug}`).join(", "),
    )
  }

  return wrong
}

if (process.env.NODE_ENV === "development") checkFunSlugs()

export const getFunItemsForNav = () => {
  return funItems.map(eachFunItem => ({
    title: eachFunItem.title,
    link: `/fun/${eachFunItem.slug}`,
  }))
}
