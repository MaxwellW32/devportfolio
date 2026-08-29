import type { Metadata } from "next"
import Link from "next/link"

import Reveal from "@/components/ui/Reveal"
import { landingPageExamples } from "@/lib/landingPageExamplesData"
import styles from "./lab.module.css"

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Small self-contained builds — interface experiments, API integrations and landing-page studies.",
}

/* ============================================================================
   TO ADD A BUILD: append to `builds` below and create app/lab/<slug>/page.tsx.
   Landing-page studies come from lib/landingPageExamplesData.ts instead.
   ========================================================================= */

type build = {
  slug: string
  title: string
  blurb: string
  tags: string[]
}

const builds: build[] = [
  {
    slug: "ecommerce",
    title: "Storefront",
    blurb: "A full shop front — categories, search, cart and checkout, with state that survives navigation.",
    tags: ["State", "Search", "Cart"],
  },
  {
    slug: "calculator",
    title: "Decoy Calculator",
    blurb: "Works as a calculator. Enter the right sequence and it unlocks encrypted notes instead.",
    tags: ["Encryption", "Interface"],
  },
  {
    slug: "dictionary",
    title: "Dictionary",
    blurb: "Definitions, pronunciation and etymology from a public API, wrapped in a playful interface.",
    tags: ["API", "Lottie"],
  },
  {
    slug: "randomPlayer",
    title: "Random Player",
    blurb: "An endless video feed seeded by random words, with an offline fallback when the API is unreachable.",
    tags: ["YouTube API", "Fallbacks"],
  },
  {
    slug: "perspective",
    title: "Perspective",
    blurb: "A playlist browser built entirely out of CSS 3D transforms.",
    tags: ["CSS 3D", "API"],
  },
  {
    slug: "parallax",
    title: "Parallax",
    blurb: "Layered scroll depth done with transforms rather than a library.",
    tags: ["CSS", "Scroll"],
  },
  {
    slug: "toDo",
    title: "To Do",
    blurb: "The classic, with local persistence and a greeting that changes with the hour.",
    tags: ["Local storage"],
  },
]

export default function Page() {
  return (
    <main>
      <section className={`shellWide ${styles.hero}`}>
        <div className="gridlines" aria-hidden="true" />

        <div className={styles.heroInner}>
          <p className="label labelSignal">The lab</p>
          <h1 className={styles.title}>Small builds, one idea each.</h1>
          <p className={styles.lede}>
            Self-contained experiments — an interface pattern, an API, a piece of
            CSS I wanted to understand properly. Nothing here is a product; they
            are where techniques get tested before they go into one.
          </p>
        </div>
      </section>

      <section className={`shellWide ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Interface builds</h2>

        <div className={styles.grid}>
          {builds.map((eachBuild, eachIndex) => (
            <Reveal key={eachBuild.slug} delay={eachIndex * 60}>
              <Link href={`/lab/${eachBuild.slug}`} className={`card ${styles.card}`}>
                <h3 className={styles.cardTitle}>{eachBuild.title}</h3>
                <p className={styles.blurb}>{eachBuild.blurb}</p>

                <ul className="chipRow">
                  {eachBuild.tags.map(eachTag => (
                    <li key={eachTag} className="chip">{eachTag}</li>
                  ))}
                </ul>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={`shellWide ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Landing-page studies</h2>
        <p className={styles.sectionLede}>
          Visual exercises — each one chasing a specific mood with a different
          technique, from scroll choreography to WebGL.
        </p>

        <div className={styles.grid}>
          {landingPageExamples.map((eachPage, eachIndex) => (
            <Reveal key={eachPage.link} delay={eachIndex * 60}>
              <Link href={eachPage.link} className={`card ${styles.card}`}>
                <p className="label labelPlain">{eachPage.category}</p>
                <h3 className={styles.cardTitle}>{eachPage.title}</h3>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  )
}
