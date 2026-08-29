/* ============================================================================
   THE PLAYGROUND
   Things built purely to find out whether I could. Each one sets out to prove
   something small and specific, and says so.

   TO ADD ONE: append an entry below and create app/fun/(fun)/<slug>/page.tsx.
   Drop an image at public/fun/<slug>.jpg if you want artwork; otherwise a
   generated cover is drawn from the slug.
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
    slug: "three",
    title: "Boids",
    claim: "Three local rules, no leader, and a flock appears. Turn one off and watch which part dies.",
    tags: ["Three.js", "Emergence", "WebGL"],
    state: "polished",
  },
  {
    slug: "fibonacci",
    title: "Fibonacci → φ",
    claim: "The ratio of consecutive terms converges on the golden ratio. Here is the number and the picture.",
    tags: ["Maths", "BigInt", "Canvas"],
    state: "polished",
  },
  {
    slug: "tank",
    title: "Ricochet Arena",
    claim: "Shells reflect properly off walls, and the enemies aim where you are going rather than where you are.",
    tags: ["Game", "Collision", "Ballistics"],
    state: "playable",
  },
  {
    slug: "chess",
    title: "Chess",
    claim: "Full legal move generation, including the awkward ones nobody remembers.",
    tags: ["Game", "Rules engine"],
    state: "playable",
  },
  {
    slug: "luckRanked",
    title: "Luck Ranked",
    claim: "How well can you actually track a shuffle? A cup game that keeps score honestly.",
    tags: ["Game", "Three.js"],
    state: "playable",
  },
  {
    slug: "musicBounce",
    title: "Music Bounce",
    claim: "Reading real frequency data out of the Web Audio API and driving motion with it.",
    tags: ["Web Audio", "Visualiser"],
    state: "playable",
  },
  {
    slug: "musicSquare",
    title: "Music Square",
    claim: "A step sequencer — a grid becomes a loop you can actually compose in.",
    tags: ["Web Audio", "Sequencer"],
    state: "playable",
  },
  {
    slug: "musicTimeline",
    title: "Music Timeline",
    claim: "Arranging sound along a timeline, with scrubbing that stays in sync.",
    tags: ["Web Audio", "Timeline"],
    state: "sketch",
  },
  {
    slug: "reactiveMusic",
    title: "Reactive Music",
    claim: "Visuals driven directly by the amplitude envelope of whatever is playing.",
    tags: ["Web Audio", "Canvas"],
    state: "sketch",
  },
]

export const getFunItemsForNav = () => {
  return funItems.map(eachFunItem => ({
    title: eachFunItem.title,
    link: `/fun/${eachFunItem.slug}`,
  }))
}
