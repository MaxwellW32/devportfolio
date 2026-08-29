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
    slug: "musicSquare",
    title: "Step Sequencer",
    claim: "A drum machine with no samples in it. Every sound is built from oscillators and noise, and the whole pattern fits in a link.",
    tags: ["Web Audio", "Synthesis", "Sequencer"],
    state: "polished",
  },
  {
    slug: "musicBounce",
    title: "Music Bounce",
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

export const getFunItemsForNav = () => {
  return funItems.map(eachFunItem => ({
    title: eachFunItem.title,
    link: `/fun/${eachFunItem.slug}`,
  }))
}
