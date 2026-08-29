import type { Metadata } from "next"
import Link from "next/link"

import Reveal from "@/components/ui/Reveal"
import { profile, principles, skillGroups } from "@/lib/profile"
import { getStackFrequency, projects } from "@/lib/projects"
import styles from "./about.module.css"

export const metadata: Metadata = {
  title: "About",
  description:
    "Full-stack engineer in Kingston, Jamaica. Trading systems, AI products and multi-tenant platforms — built carefully, documented properly, and explained in plain language.",
}

export default function Page() {
  // The most-used technologies, straight from the project catalogue rather
  // than a hand-maintained list that would drift out of date.
  const topStack = getStackFrequency().slice(0, 14)

  return (
    <main>
      <section className={`shellWide ${styles.hero}`}>
        <div className="gridlines" aria-hidden="true" />

        <div className={styles.heroInner}>
          <p className="label labelSignal">{profile.location}</p>

          <h1 className={styles.title}>
            I like the hard part —
            <br />
            <span className={styles.accent}>and I like explaining it.</span>
          </h1>

          <div className={styles.bio}>
            {profile.bio.map(eachParagraph => (
              <p key={eachParagraph.slice(0, 40)}>{eachParagraph}</p>
            ))}
          </div>

          <div className={styles.actions}>
            <Link href="/contactUs" className="btn btnPrimary">
              <span>Get in touch</span>
            </Link>
            <a href="/resume.pdf" download className="btn">
              <span>Download résumé</span>
            </a>
          </div>
        </div>
      </section>

      {/* ---- Principles ------------------------------------------------- */}
      <section className="section" style={{ background: "var(--color-canvas)" }}>
        <div className="shellWide">
          <Reveal>
            <header className={styles.head}>
              <p className="label">How I work</p>
              <h2 className={styles.sectionTitle}>Six habits I would bring with me.</h2>
            </header>
          </Reveal>

          <ol className={styles.principles}>
            {principles.map((eachPrinciple, eachIndex) => (
              <Reveal key={eachPrinciple.title} as="li" delay={eachIndex * 70}>
                <p className="readout">{String(eachIndex + 1).padStart(2, "0")}</p>
                <div>
                  <h3>{eachPrinciple.title}</h3>
                  <p>{eachPrinciple.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Skills ----------------------------------------------------- */}
      <section className="section">
        <div className="shellWide">
          <Reveal>
            <header className={styles.head}>
              <p className="label">Toolkit</p>
              <h2 className={styles.sectionTitle}>What I build with.</h2>
              <p className={styles.lede}>
                The counts below are derived from the {projects.length} projects
                in the catalogue, so this list cannot drift away from what I have
                actually shipped.
              </p>
            </header>
          </Reveal>

          <Reveal>
            <div className={styles.frequency}>
              <p className="label labelPlain">Most used, by project count</p>
              <ul>
                {topStack.map(eachTech => (
                  <li key={eachTech.name}>
                    <span>{eachTech.name}</span>
                    <span
                      className={styles.bar}
                      style={{ "--fill": `${(eachTech.count / topStack[0].count) * 100}%` } as React.CSSProperties}
                    />
                    <span className="readout">{eachTech.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className={styles.skillGrid}>
            {skillGroups.map((eachGroup, eachIndex) => (
              <Reveal key={eachGroup.title} delay={eachIndex * 60}>
                <div className={styles.skillGroup}>
                  <p className="label labelPlain">{eachGroup.title}</p>
                  <ul className="chipRow">
                    {eachGroup.items.map(eachItem => (
                      <li key={eachItem} className="chip">{eachItem}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
