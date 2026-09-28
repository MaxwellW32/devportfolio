import type { Metadata } from "next"
import Link from "next/link"

import SpriteToggle from "@/components/player/SpriteToggle"
import Reveal from "@/components/ui/Reveal"
import { funItems } from "@/lib/FunData"
import styles from "./fun.module.css"

export const metadata: Metadata = {
  title: "Playground",
  description:
    "A chess engine, a flock of birds in Three.js, worlds generated from a seed and toys made of sound. I built them to see if I could.",
}

const stateLabel: Record<string, string> = {
  polished: "Polished",
  playable: "Playable",
  sketch: "Sketch",
}

export default function Page() {
  return (
    <main className={styles.page}>
      <section className={`shellWide ${styles.hero}`}>
        <div className="gridlines" aria-hidden="true" />

        <div className={styles.heroInner}>
          <p className="label labelSignal">Playground</p>

          {/* data-platform-enabled makes this a platform for the character */}
          <h1 data-platform-enabled className={styles.title}>
            Things I built for fun.
          </h1>

          <p className={styles.lede}>
            Each of these started with a question I wanted to answer. Can three
            simple rules make a flock? Can a whole world come from one seed? Is
            a bank shot geometry or luck? I built them to find out.
          </p>

          <div className={styles.sprite}>
            <div>
              <p className="label labelPlain">The character</p>
              <p className={styles.spriteCopy}>
                There&apos;s a little character who lives on this site.{" "}
                <kbd>A</kbd> and <kbd>D</kbd> run him along the headings,{" "}
                <kbd>W</kbd> jumps and <kbd>S</kbd> drops through. Press{" "}
                <kbd>F</kbd> to turn gravity off and he&apos;ll float wherever
                you point him. While he&apos;s floating, <kbd>E</kbd> opens
                whatever he&apos;s hovering over, so you can use him as a slow,
                silly mouse for the whole site.
              </p>
            </div>

            <div className={styles.spriteActions}>
              <SpriteToggle />
              <p className={styles.spriteHint}>
                <kbd>Shift</kbd> + <kbd>P</kbd> anywhere
              </p>
            </div>
          </div>
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
          The serious work is next door.
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
