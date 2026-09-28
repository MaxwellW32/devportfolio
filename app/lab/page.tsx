import type { Metadata } from "next"
import Link from "next/link"

import Reveal from "@/components/ui/Reveal"
import styles from "./lab.module.css"

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Small builds where I tried out one idea at a time, like an interface, an API or a piece of CSS I wanted to understand.",
}

/* ============================================================================
   TO ADD A BUILD: append to `builds` below and create app/lab/<slug>/page.tsx.
   The landing-page studies moved out to their own project — see the note in
   the "Client-facing studies" section below.
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
    blurb: "A demo shop with categories, search, a cart and a checkout. The cart is saved in your browser, so it's still there when you come back.",
    tags: ["State", "Search", "Cart"],
  },
  {
    slug: "calculator",
    title: "Decoy Calculator",
    blurb: "It works as a normal calculator. Type in the secret sequence and your PIN, and it opens a hidden photo gallery.",
    tags: ["Encryption", "Interface"],
  },
  {
    slug: "dictionary",
    title: "Dictionary",
    blurb: "Search for a word and get its definitions from a public API, while a couple of parrots fly across the page.",
    tags: ["API", "Lottie"],
  },
  {
    slug: "randomPlayer",
    title: "Random Player",
    blurb: "It picks a random word, searches YouTube for it and plays what comes back. If YouTube can't be reached, it plays from a backup list.",
    tags: ["YouTube API", "Fallbacks"],
  },
  {
    slug: "perspective",
    title: "Perspective",
    blurb: "A YouTube player inside a 3D box you can rotate, built with CSS transforms. Add single videos or a whole playlist.",
    tags: ["CSS 3D", "API"],
  },
  {
    slug: "parallax",
    title: "Parallax",
    blurb: "A page about Mars where the layers scroll at different speeds. It's all CSS, with no library.",
    tags: ["CSS", "Scroll"],
  },
  {
    slug: "toDo",
    title: "To Do",
    blurb: "A to-do list that saves to your browser. You can attach videos to a list, and empty lines show a random quote.",
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
            These are small experiments. Each one let me try a single idea, such
            as an interface pattern, an API or a piece of CSS I wanted to
            understand properly. None of them are full products. They&apos;re
            where I try a technique before I use it in a real project.
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
        <h2 className={styles.sectionTitle}>Client-facing studies</h2>
        <p className={styles.sectionLede}>
          I also built nine complete demo sites, each with a different look for
          a different kind of business. They used to be single pages in here,
          but they grew into full sites, so now they have a project of their
          own.
        </p>

        <div className={styles.outLink}>
          <a
            href="https://squaremaxtech.com"
            target="_blank"
            rel="noreferrer"
            className="btn"
          >
            <span>Browse the website studies</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  )
}
