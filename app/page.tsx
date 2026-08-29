import Link from "next/link"

import SignalCanvas from "@/components/hero/SignalCanvas"
import Reveal from "@/components/ui/Reveal"
import ProjectCard from "@/components/projects/ProjectCard"
import { projects } from "@/lib/projects"
import { achievements, capabilities, principles } from "@/lib/profile"
import { resolveShots } from "@/lib/shots"
import styles from "./home.module.css"

const featured = projects.filter(eachProject => eachProject.tier === "flagship").slice(0, 4)
const featuredShots = resolveShots(featured)

export default function Page() {
  return (
    <main>
      {/* ==================================================================
          HERO
          ================================================================== */}
      <section className={styles.hero}>
        <div className="gridlines" aria-hidden="true" />

        <div className={`shellWide ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className="label labelSignal">Kingston, Jamaica · Available</p>

            <h1 className={styles.heroTitle}>
              I build the instrument
              <br />
              before I trust
              <br />
              <span className={styles.heroAccent}>the reading.</span>
            </h1>

            <p className={styles.heroLede}>
              Full-stack engineer. I build trading systems that measure themselves,
              AI products that hold their shape when the model misbehaves, and
              platforms that stay correct as they grow.
            </p>

            <div className={styles.heroActions}>
              <Link href="/projects" className="btn btnPrimary">
                <span>See the work</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link href="/contactUs" className="btn">
                <span>Get in touch</span>
              </Link>
            </div>
          </div>

          <div className={styles.heroPlot}>
            <div className={styles.plotFrame}>
              <div className={styles.plotHead}>
                <span className="label labelPlain labelSignal">Live signal</span>
                <span className="readout">σ ← cursor height</span>
              </div>

              <div className={styles.plotBody}>
                <SignalCanvas />
              </div>

              <div className={styles.plotFoot}>
                <span className="readout">random walk · 22-period mean</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`shellWide ${styles.heroMeta}`}>
          {capabilities.map((eachCapability, eachIndex) => (
            <Reveal key={eachCapability.label} delay={eachIndex * 80}>
              <div className={styles.metaItem}>
                <p className="readout" data-value>{eachCapability.value}</p>
                <p>{eachCapability.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ==================================================================
          PRINCIPLES — how I work
          ================================================================== */}
      <section className="section">
        <div className="shellWide">
          <Reveal>
            <header className={styles.sectionHead}>
              <p className="label">How I work</p>
              <h2 className={styles.sectionTitle}>
                Anyone can ship. The question is whether you would know if it were wrong.
              </h2>
            </header>
          </Reveal>

          <ol className={styles.principles}>
            {principles.map((eachPrinciple, eachIndex) => (
              <Reveal key={eachPrinciple.title} as="li" delay={eachIndex * 90}>
                <article className={styles.principle}>
                  <p className="readout">{String(eachIndex + 1).padStart(2, "0")}</p>
                  <h3>{eachPrinciple.title}</h3>
                  <p>{eachPrinciple.body}</p>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ==================================================================
          FEATURED WORK
          ================================================================== */}
      <section className="section" style={{ background: "var(--color-canvas)" }}>
        <div className="shellWide">
          <Reveal>
            <header className={styles.sectionHead}>
              <p className="label">Selected work</p>
              <h2 className={styles.sectionTitle}>Four I would defend in an interview.</h2>
              <p className={styles.sectionLede}>
                Each of these has a hard part — a problem where the obvious solution was
                wrong, and the right one took real thought.
              </p>
            </header>
          </Reveal>

          <div className={styles.featured}>
            {featured.map((eachProject, eachIndex) => (
              <Reveal key={eachProject.slug} delay={eachIndex * 90}>
                <ProjectCard project={eachProject} shot={featuredShots[eachProject.slug]} />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className={styles.sectionFoot}>
              <Link href="/projects" className="btn">
                <span>All {projects.length} projects</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          ACHIEVEMENTS
          ================================================================== */}
      <section className="section">
        <div className="shellWide">
          <Reveal>
            <header className={styles.sectionHead}>
              <p className="label">Track record</p>
              <h2 className={styles.sectionTitle}>Things I have actually shipped.</h2>
            </header>
          </Reveal>

          <div className={styles.achievements}>
            {achievements.map((eachAchievement, eachIndex) => (
              <Reveal key={eachAchievement.title} delay={eachIndex * 70}>
                <article className={styles.achievement}>
                  <p className="readout">{eachAchievement.year}</p>

                  <div>
                    <h3>{eachAchievement.title}</h3>
                    <p>{eachAchievement.body}</p>

                    <ul className="chipRow">
                      {eachAchievement.stack.map(eachTech => (
                        <li key={eachTech} className="chip">{eachTech}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          PLAYGROUND TEASER
          ================================================================== */}
      <section className="section" style={{ background: "var(--color-canvas)" }}>
        <div className="shellWide">
          <div className={styles.playground}>
            <Reveal>
              <div>
                <p className="label">Playground</p>
                <h2 className={styles.sectionTitle}>
                  And some things built purely because I wanted to know if I could.
                </h2>
                <p className={styles.sectionLede}>
                  Procedural worlds, a chess engine, audio-reactive visualisers, and a
                  character who runs along the headings of the page. No client asked for
                  any of it.
                </p>

                <div className={styles.heroActions}>
                  <Link href="/fun" className="btn">
                    <span>Enter the playground</span>
                  </Link>
                  <Link href="/lab" className="btn btnGhost">
                    <span>Browse the lab</span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
