import type { Metadata } from "next"
import Link from "next/link"

import Player from "@/components/player/Player"
import Reveal from "@/components/ui/Reveal"
import { funItems } from "@/lib/FunData"
import styles from "./fun.module.css"

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Procedural worlds, flocking simulations, a chess engine and audio visualisers — built to find out whether I could.",
}

const stateLabel: Record<string, string> = {
  polished: "Polished",
  playable: "Playable",
  sketch: "Sketch",
}

export default function Page() {
  return (
    <main className={styles.page}>
      <Player />

      <section className={`shellWide ${styles.hero}`}>
        <div className="gridlines" aria-hidden="true" />

        <div className={styles.heroInner}>
          <p className="label labelSignal">Playground</p>

          {/* data-platform-enabled makes this a platform for the character */}
          <h1 data-platform-enabled className={styles.title}>
            Things nobody asked for.
          </h1>

          <p className={styles.lede}>
            Each of these started with a claim I wanted to see proved rather
            than assumed — that three rules make a flock, that a whole world can
            live in one string, that a bank shot is geometry and not luck.
          </p>

          <p className={styles.lede}>
            There is also a character on this page. Press <kbd>A</kbd> or{" "}
            <kbd>D</kbd> and every heading below becomes a platform.
          </p>
        </div>
      </section>

      <section className={`shellWide ${styles.grid}`}>
        {funItems.map((eachItem, eachIndex) => (
          <Reveal key={eachItem.slug} delay={eachIndex * 60}>
            <Link href={`/fun/${eachItem.slug}`} className={`card ${styles.card}`}>
              <div className={styles.cardHead}>
                <span className="label labelPlain">{stateLabel[eachItem.state]}</span>
                <span className={styles.arrow} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>

              {/* Every card title is also a platform */}
              <h2 data-platform-enabled className={styles.cardTitle}>
                {eachItem.title}
              </h2>

              <p className={styles.claim}>{eachItem.claim}</p>

              <ul className="chipRow">
                {eachItem.tags.map(eachTag => (
                  <li key={eachTag} className="chip">{eachTag}</li>
                ))}
              </ul>
            </Link>
          </Reveal>
        ))}
      </section>

      <section className={`shellWide ${styles.outro}`}>
        <h2 data-platform-enabled className={styles.outroTitle}>
          The serious work lives next door.
        </h2>

        <div className={styles.outroActions}>
          <Link href="/projects" className="btn btnPrimary">
            <span>See the work</span>
          </Link>
          <Link href="/lab" className="btn">
            <span>Browse the lab</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
